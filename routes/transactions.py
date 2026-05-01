from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import extract
from app.models.transaction import Transaction
from app.models.account import Account
from app.models.category import Category
from app.database import SessionLocal
from datetime import datetime

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

        transactions = query.order_by(Transaction.transaction_date.desc()).all()

        results = [
            {
                "id": t.id,
                "account_id": t.account_id,
                "category_id": t.category_id,
                "category": t.category.name if t.category else None,
                "merchant_id": t.merchant_id,
                "amount": float(t.amount),
                "description": t.description,
                "date": t.transaction_date.strftime("%Y-%m-%d") if t.transaction_date else None
            }
            for t in transactions
        ]
        return jsonify(results), 200
    finally:
        db.close()


@transaction_bp.route("/transactions", methods=["POST"])
@jwt_required()
def add_transaction():
    user_id = get_jwt_identity()
    db = SessionLocal()
    try:
        data = request.get_json()

        if not data.get("account_id") or not data.get("amount"):
            return jsonify({"error": "Account ID and amount are required"}), 400

        # Verify the account belongs to the current user
        account = db.query(Account).filter(
            Account.id == int(data["account_id"]),
            Account.user_id == int(user_id),
            Account.deleted_at == None
        ).first()
        if not account:
            return jsonify({"error": "Account not found"}), 404

        tx_date = None
        if data.get("transaction_date"):
            try:
                tx_date = datetime.strptime(data["transaction_date"], "%Y-%m-%d")
            except ValueError:
                tx_date = None

        new_transaction = Transaction(
            account_id=data["account_id"],
            category_id=data.get("category_id"),
            merchant_id=data.get("merchant_id"),
            amount=data["amount"],
            description=data.get("description"),
            transaction_date=tx_date
        )

        db.add(new_transaction)
        db.commit()
        db.refresh(new_transaction)

        return jsonify({
            "id": new_transaction.id,
            "account_id": new_transaction.account_id,
            "category_id": new_transaction.category_id,
            "category": new_transaction.category.name if new_transaction.category else None,
            "merchant_id": new_transaction.merchant_id,
            "amount": float(new_transaction.amount),
            "description": new_transaction.description,
            "date": new_transaction.transaction_date.strftime("%Y-%m-%d") if new_transaction.transaction_date else None
        }), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@transaction_bp.route("/transactions/<int:transaction_id>", methods=["DELETE"])
@jwt_required()
def delete_transaction(transaction_id):
    user_id = get_jwt_identity()
    db = SessionLocal()
    try:
        transaction = db.query(Transaction).join(Transaction.account).filter(
            Transaction.id == transaction_id,
            Account.user_id == int(user_id)
        ).first()

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
