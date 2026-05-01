from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from app.database import SessionLocal
from app.models.account import Account
from app.models.lender import Lender
from app.models.transaction import Transaction
from app.services.account_service import AccountService

accounts_bp = Blueprint("accounts", __name__)

ASSET_TYPES = ["Checking", "Savings", "HYSA"]


@accounts_bp.route("/accounts", methods=["GET"])
@jwt_required()
def get_accounts():
    user_id = get_jwt_identity()
    db = SessionLocal()
    try:
        accounts = db.query(Account).filter(
            Account.user_id == int(user_id),
            Account.account_type.in_(ASSET_TYPES),
            Account.deleted_at == None
        ).all()

        results = []
        for a in accounts:
            balance = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
                Transaction.account_id == a.id
            ).scalar()
            results.append({
                "id": a.id,
                "name": a.account_name,
                "type": a.account_type,
                "balance": float(balance),
                "apy": float(a.interest_rate)
            })
        return jsonify(results), 200
    finally:
        db.close()


@accounts_bp.route("/accounts", methods=["POST"])
@jwt_required()
def create_account():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data.get("account_name") or not data.get("account_type"):
        return jsonify({"error": "account_name and account_type are required"}), 400

    db = SessionLocal()
    try:
        service = AccountService(db)
        account = service.create_account(
            user_id=int(user_id),
            account_name=data["account_name"],
            account_type=data["account_type"],
            lender_id=data.get("lender_id"),
            balance=data.get("balance", 0.00),
            interest_rate=data.get("interest_rate", 0.00)
        )
        return jsonify({
            "id": account.id,
            "name": account.account_name,
            "type": account.account_type,
            "balance": float(account.balance),
            "apy": float(account.interest_rate)
        }), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    finally:
        db.close()


@accounts_bp.route("/accounts/<int:account_id>/balance", methods=["PUT"])
@jwt_required()
def update_balance(account_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    if data.get("balance") is None:
        return jsonify({"error": "balance is required"}), 400

    db = SessionLocal()
    try:
        account = db.query(Account).filter(
            Account.id == account_id,
            Account.user_id == int(user_id),
            Account.deleted_at == None
        ).first()
        if not account:
            return jsonify({"error": "Account not found"}), 404

        service = AccountService(db)
        account = service.update_balance(account_id, data["balance"])
        return jsonify({
            "id": account.id,
            "name": account.account_name,
            "balance": float(account.balance)
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    finally:
        db.close()


@accounts_bp.route("/accounts/<int:account_id>", methods=["DELETE"])
@jwt_required()
def delete_account(account_id):
    user_id = get_jwt_identity()
    db = SessionLocal()
    try:
        account = db.query(Account).filter(
            Account.id == account_id,
            Account.user_id == int(user_id),
            Account.deleted_at == None
        ).first()
        if not account:
            return jsonify({"error": "Account not found"}), 404

        service = AccountService(db)
        service.remove(account_id)
        return jsonify({"message": "Account deleted"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    finally:
        db.close()
