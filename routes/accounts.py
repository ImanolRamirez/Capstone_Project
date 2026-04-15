from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.database import SessionLocal
from app.services.account_service import AccountService

accounts_bp = Blueprint("accounts", __name__)


@accounts_bp.route("/accounts", methods=["GET"])
@jwt_required()
def get_accounts():
    user_id = get_jwt_identity()
    db = SessionLocal()
    try:
        service = AccountService(db)
        accounts = service.get_user_accounts(int(user_id))
        results = [
            {
                "id": a.id,
                "account_name": a.account_name,
                "account_type": a.account_type,
                "balance": str(a.balance),
                "interest_rate": str(a.interest_rate),
                "lender_id": a.lender_id
            }
            for a in accounts
        ]
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
            "account_name": account.account_name,
            "account_type": account.account_type,
            "balance": str(account.balance),
            "interest_rate": str(account.interest_rate),
            "lender_id": account.lender_id
        }), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    finally:
        db.close()


@accounts_bp.route("/accounts/<int:account_id>/balance", methods=["PUT"])
@jwt_required()
def update_balance(account_id):
    data = request.get_json()

    if data.get("balance") is None:
        return jsonify({"error": "balance is required"}), 400

    db = SessionLocal()
    try:
        service = AccountService(db)
        account = service.update_balance(account_id, data["balance"])
        return jsonify({
            "id": account.id,
            "account_name": account.account_name,
            "balance": str(account.balance)
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    finally:
        db.close()


@accounts_bp.route("/accounts/<int:account_id>", methods=["DELETE"])
@jwt_required()
def delete_account(account_id):
    db = SessionLocal()
    try:
        service = AccountService(db)
        service.remove(account_id)
        return jsonify({"message": "Account deleted"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    finally:
        db.close()
