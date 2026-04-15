from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.database import SessionLocal
from app.models.transaction import Transaction
from app.models.account import Account
from app.models.category import Category

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/dashboard/summary", methods=["GET"])
@jwt_required()
def get_summary():
    user_id = get_jwt_identity()
    db = SessionLocal()
    try:
        transactions = (
            db.query(Transaction)
            .join(Transaction.account)
            .join(Transaction.category)
            .filter(Account.user_id == int(user_id))
            .all()
        )

        total_income = sum(
            float(t.amount) for t in transactions if t.category.type == "income"
        )
        total_expenses = sum(
            float(t.amount) for t in transactions if t.category.type == "expense"
        )

        return jsonify({
            "total_income": total_income,
            "total_expenses": total_expenses,
            "total_saved": total_income - total_expenses
        }), 200
    finally:
        db.close()
