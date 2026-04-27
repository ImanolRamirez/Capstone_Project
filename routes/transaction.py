from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import extract
from app.database import SessionLocal
from app.services.transaction_service import TransactionService

transaction_bp = Blueprint("transactions", __name__)


@transaction_bp.route("/transactions", methods=["POST"])
@jwt_required()
def add_transaction():
    user_id = get_jwt_identity()
    db = SessionLocal()

    try:
        data = request.get_json()

        if not data.get("account_id") or not data.get("amount") or not data.get("category_id"):
            return jsonify({"error": "Account ID, category_id, and amount are required"}), 400

        service = TransactionService(db)

        # The service handles the db.commit() and balance updates internally
        transaction = service.create_transaction(
            account_id=int(data["account_id"]),
            category_id=int(data["category_id"]),
            amount=float(data["amount"]),
            merchant_id=data.get("merchant_id"),
            description=data.get("description")
        )

        return jsonify({
            "id": transaction.id,
            "account_id": transaction.account_id,
            "category_id": transaction.category_id,
            "merchant_id": transaction.merchant_id,
            "amount": str(transaction.amount),
            "description": transaction.description,
            "transaction_date": transaction.transaction_date.isoformat() if transaction.transaction_date else None
        }), 201

    except ValueError as e:
        # Gracefully handle "Insufficient funds" or "Account does not exist"
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.rollback()
        return jsonify({"error": "An unexpected error occurred."}), 500
    finally:
        db.close()


@transaction_bp.route("/transactions/<int:transaction_id>", methods=["DELETE"])
@jwt_required()
def delete_transaction(transaction_id):
    db = SessionLocal()
    try:
        service = TransactionService(db)
        # Assuming your service handles rolling back the account balance before deletion
        service.remove(transaction_id, commit=True)
        return jsonify({"message": "Transaction deleted"}), 200
    except ValueError as e:
        return jsonify({"error": "Transaction not found"}), 404
    except Exception as e:
        db.rollback()
        return jsonify({"error": "An unexpected error occurred."}), 500
    finally:
        db.close()