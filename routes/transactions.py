from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import extract
from app.models.transaction import Transaction
from app.models.account import Account
from app.database import SessionLocal

transaction_bp = Blueprint("transactions", __name__)


@transaction_bp.route("/transactions", methods=["GET"])
@jwt_required()
def get_transactions():
    user_id = get_jwt_identity()
    db = SessionLocal()
    try:
        month = request.args.get("month")
        year = request.args.get("year")
        category_id = request.args.get("category")

        query = db.query(Transaction).join(Transaction.account).filter(
            Account.user_id == int(user_id)
        )

        if month and year:
            query = query.filter(
                extract("month", Transaction.transaction_date) == int(month),
                extract("year", Transaction.transaction_date) == int(year)
            )

        if category_id:
            query = query.filter(Transaction.category_id == int(category_id))

        transactions = query.all()

        results = [
            {
                "id": t.id,
                "account_id": t.account_id,
                "category_id": t.category_id,
                "merchant_id": t.merchant_id,
                "amount": str(t.amount),
                "description": t.description,
                "transaction_date": t.transaction_date.isoformat() if t.transaction_date else None
            }
            for t in transactions
        ]
        return jsonify(results), 200
    finally:
        db.close()


@transaction_bp.route("/transactions", methods=["POST"])
@jwt_required()
def add_transaction():
    db = SessionLocal()
    try:
        data = request.get_json()

        if not data.get("account_id") or not data.get("amount"):
            return jsonify({"error": "Account ID and amount are required"}), 400

        new_transaction = Transaction(
            account_id=data["account_id"],
            category_id=data.get("category_id"),
            merchant_id=data.get("merchant_id"),
            amount=data["amount"],
            description=data.get("description"),
        )

        db.add(new_transaction)
        db.commit()
        db.refresh(new_transaction)

        return jsonify({
            "id": new_transaction.id,
            "account_id": new_transaction.account_id,
            "category_id": new_transaction.category_id,
            "merchant_id": new_transaction.merchant_id,
            "amount": str(new_transaction.amount),
            "description": new_transaction.description,
            "transaction_date": new_transaction.transaction_date.isoformat() if new_transaction.transaction_date else None
        }), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@transaction_bp.route("/transactions/<int:transaction_id>", methods=["DELETE"])
@jwt_required()
def delete_transaction(transaction_id):
    db = SessionLocal()
    try:
        transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()

        if not transaction:
            return jsonify({"error": "Transaction not found"}), 404

        db.delete(transaction)
        db.commit()

        return jsonify({"message": "Transaction deleted"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()
