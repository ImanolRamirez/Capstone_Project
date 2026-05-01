from decimal import Decimal
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from app.database import SessionLocal
from app.models.account import Account
from app.models.transaction import Transaction
from app.models.category import Category

transfers_bp = Blueprint("transfers", __name__)

ASSET_TYPES = ["Checking", "Savings", "HYSA"]
DEBT_TYPES = ["Auto Loan", "Mortgage", "Loan", "Credit Card"]


@transfers_bp.route("/transfer", methods=["POST"])
@jwt_required()
def make_transfer():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    from_id = data.get("from_account_id")
    to_id = data.get("to_account_id")
    amount = data.get("amount")
    memo = data.get("memo", "")

    if not from_id or not to_id or not amount:
        return jsonify({"error": "from_account_id, to_account_id, and amount are required"}), 400

    try:
        amount = float(amount)
    except (TypeError, ValueError):
        return jsonify({"error": "amount must be a number"}), 400

    if amount <= 0:
        return jsonify({"error": "Amount must be greater than 0"}), 400

    if int(from_id) == int(to_id):
        return jsonify({"error": "Source and destination accounts must be different"}), 400

    db = SessionLocal()
    try:
        # Verify both accounts belong to the current user
        from_account = db.query(Account).filter(
            Account.id == int(from_id),
            Account.user_id == user_id,
            Account.deleted_at == None
        ).first()

        to_account = db.query(Account).filter(
            Account.id == int(to_id),
            Account.user_id == user_id,
            Account.deleted_at == None
        ).first()

        if not from_account:
            return jsonify({"error": "Source account not found"}), 404
        if not to_account:
            return jsonify({"error": "Destination account not found"}), 404

        # Check sufficient funds (balance = sum of transactions)
        from_balance = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
            Transaction.account_id == from_account.id
        ).scalar()
        from_balance = float(from_balance)

        if amount > from_balance:
            return jsonify({"error": "Insufficient funds"}), 400

        is_debt_payment = to_account.account_type in DEBT_TYPES

        # Get or create the appropriate category
        if is_debt_payment:
            cat_name = "Loan Payment"
            cat_type = "Expense"
        else:
            cat_name = "Transfer"
            cat_type = "Transfer"

        tx_category = db.query(Category).filter(Category.name == cat_name).first()
        if not tx_category:
            tx_category = Category(name=cat_name, type=cat_type)
            db.add(tx_category)
            db.flush()

        # Build description
        if is_debt_payment:
            debit_desc = f"Loan Payment — {to_account.account_name}"
            credit_desc = f"Loan Payment received from {from_account.account_name}"
        else:
            debit_desc = f"Transfer to {to_account.account_name}"
            credit_desc = f"Transfer from {from_account.account_name}"

        if memo:
            debit_desc += f" — {memo}"
            credit_desc += f" — {memo}"

        # Debit source account (always negative)
        debit_tx = Transaction(
            account_id=from_account.id,
            category_id=tx_category.id,
            amount=-amount,
            description=debit_desc
        )

        # Destination transaction:
        # - Regular transfer: positive (money arrives in asset account)
        # - Debt payment: negative (reduces remaining loan balance)
        credit_amount = -amount if is_debt_payment else amount
        credit_tx = Transaction(
            account_id=to_account.id,
            category_id=tx_category.id,
            amount=credit_amount,
            description=credit_desc
        )

        db.add(debit_tx)
        db.add(credit_tx)

        # Keep account.balance column in sync
        from_account.balance = (from_account.balance or Decimal("0")) - Decimal(str(amount))
        to_account.balance = (to_account.balance or Decimal("0")) + Decimal(str(credit_amount))

        db.commit()
        db.refresh(debit_tx)
        db.refresh(credit_tx)

        # Return updated balances
        new_from_balance = float(db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
            Transaction.account_id == from_account.id
        ).scalar())

        new_to_balance_raw = float(db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
            Transaction.account_id == to_account.id
        ).scalar())
        # For debt accounts, balance is always shown as a positive (amount owed)
        new_to_balance = abs(new_to_balance_raw) if is_debt_payment else new_to_balance_raw

        return jsonify({
            "message": "Transfer successful",
            "is_debt_payment": is_debt_payment,
            "from_account": {
                "id": from_account.id,
                "name": from_account.account_name,
                "new_balance": new_from_balance
            },
            "to_account": {
                "id": to_account.id,
                "name": to_account.account_name,
                "new_balance": new_to_balance
            },
            "amount": amount
        }), 200

    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()
