import math
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, extract
from app.database import SessionLocal
from app.models.account import Account
from app.models.lender import Lender
from app.models.transaction import Transaction
from app.models.category import Category
from app.services.account_service import AccountService

debts_bp = Blueprint("debts", __name__)

ASSET_TYPES = ["Checking", "Savings", "HYSA"]

# Default loan term (months) by account type
LOAN_TERMS = {
    "Auto Loan": 72,
    "Mortgage": 360,
    "Loan": 60,
    "Credit Card": 0,  # revolving — no fixed term
}


def calc_payment_info(current_balance, apr, account_type):
    """
    Returns monthlyPayment and paymentsRemaining using amortization math.
    - Monthly payment is derived from the ORIGINAL principal (max positive transaction
      on the account, passed in as original_balance).
    - payments_remaining = how many more scheduled payments to clear the debt.
    """
    term = LOAN_TERMS.get(account_type, 60)
    if term == 0 or current_balance <= 0 or apr <= 0:
        return {"monthlyPayment": None, "paymentsRemaining": None}

    r = apr / 100 / 12  # monthly rate

    # Monthly payment based on CURRENT balance and remaining term
    # (will be re-computed from original below if available)
    monthly_payment = (current_balance * r) / (1 - (1 + r) ** -term)

    return {
        "monthlyPayment": round(monthly_payment, 2),
        "paymentsRemaining": term,
    }


def calc_payment_info_with_original(current_balance, apr, account_type, original_balance):
    """
    Uses original loan amount to keep monthly payment consistent throughout the loan,
    and derives actual payments remaining from the amortization schedule.
    """
    term = LOAN_TERMS.get(account_type, 60)
    if term == 0 or current_balance <= 0 or apr <= 0 or not original_balance:
        return {"monthlyPayment": None, "paymentsRemaining": None}

    r = apr / 100 / 12

    # Scheduled monthly payment based on original principal and full term
    monthly_payment = (float(original_balance) * r) / (1 - (1 + r) ** -term)

    # Remaining payments: n = -log(1 - P*r/M) / log(1+r)
    try:
        factor = current_balance * r / monthly_payment
        if factor >= 1:
            payments_remaining = term
        else:
            payments_remaining = math.ceil(-math.log(1 - factor) / math.log(1 + r))
    except (ValueError, ZeroDivisionError):
        payments_remaining = term

    return {
        "monthlyPayment": round(monthly_payment, 2),
        "paymentsRemaining": payments_remaining,
    }


@debts_bp.route("/debts", methods=["GET"])
@jwt_required()
def get_debts():
    user_id = get_jwt_identity()
    db = SessionLocal()
    try:
        debts = db.query(Account).filter(
            Account.user_id == int(user_id),
            Account.account_type.notin_(ASSET_TYPES),
            Account.deleted_at == None
        ).all()

        now = datetime.now()
        current_month = now.month
        current_year = now.year

        results = []
        for d in debts:
            balance = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
                Transaction.account_id == d.id
            ).scalar()
            current_balance = float(abs(balance))

            # Original loan amount = the disbursement (largest positive transaction)
            original_balance = db.query(func.max(Transaction.amount)).filter(
                Transaction.account_id == d.id,
                Transaction.amount > 0
            ).scalar()

            # Fall back to current balance if no disbursement transaction exists
            orig = float(original_balance) if (original_balance and float(original_balance) > 0) else current_balance

            payment_info = calc_payment_info_with_original(
                current_balance,
                float(d.interest_rate),
                d.account_type,
                orig
            )

            # Check if a payment was made this calendar month
            loan_payment_cat = db.query(Category).filter(Category.name == "Loan Payment").first()
            paid_this_month = False
            if loan_payment_cat:
                paid_this_month = db.query(Transaction).filter(
                    Transaction.account_id == d.id,
                    Transaction.category_id == loan_payment_cat.id,
                    Transaction.amount < 0,
                    extract("month", Transaction.transaction_date) == current_month,
                    extract("year", Transaction.transaction_date) == current_year
                ).first() is not None

            results.append({
                "id": d.id,
                "name": d.account_name,
                "type": d.account_type,
                "balance": current_balance,
                "apr": float(d.interest_rate),
                "lender": d.lender.name if d.lender else None,
                "monthlyPayment": payment_info["monthlyPayment"],
                "paymentsRemaining": payment_info["paymentsRemaining"],
                "paidThisMonth": paid_this_month,
                "nextPaymentDue": 0 if paid_this_month else payment_info["monthlyPayment"],
            })
        return jsonify(results), 200
    finally:
        db.close()


@debts_bp.route("/debts", methods=["POST"])
@jwt_required()
def create_debt():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data.get("account_name") or not data.get("account_type"):
        return jsonify({"error": "account_name and account_type are required"}), 400

    db = SessionLocal()
    try:
        service = AccountService(db)
        debt = service.create_account(
            user_id=int(user_id),
            account_name=data["account_name"],
            account_type=data["account_type"],
            lender_id=data.get("lender_id"),
            balance=data.get("balance", 0.00),
            interest_rate=data.get("interest_rate", 0.00)
        )
        return jsonify({
            "id": debt.id,
            "name": debt.account_name,
            "type": debt.account_type,
            "balance": float(debt.balance),
            "apr": float(debt.interest_rate),
            "lender": debt.lender.name if debt.lender else None,
            "monthlyPayment": None,
            "paymentsRemaining": None,
        }), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    finally:
        db.close()


@debts_bp.route("/debts/<int:debt_id>", methods=["PUT"])
@jwt_required()
def update_debt(debt_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    db = SessionLocal()
    try:
        debt = db.query(Account).filter(
            Account.id == debt_id,
            Account.user_id == int(user_id),
            Account.deleted_at == None
        ).first()

        if not debt:
            return jsonify({"error": "Debt not found"}), 404

        if data.get("balance") is not None:
            debt.balance = data["balance"]
        if data.get("interest_rate") is not None:
            debt.interest_rate = data["interest_rate"]

        db.commit()
        return jsonify({"message": "Debt updated"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@debts_bp.route("/debts/<int:debt_id>", methods=["DELETE"])
@jwt_required()
def delete_debt(debt_id):
    user_id = get_jwt_identity()
    db = SessionLocal()
    try:
        debt = db.query(Account).filter(
            Account.id == debt_id,
            Account.user_id == int(user_id),
            Account.deleted_at == None
        ).first()

        if not debt:
            return jsonify({"error": "Debt not found"}), 404

        service = AccountService(db)
        service.remove(debt_id, commit=True)
        return jsonify({"message": "Debt deleted"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()
