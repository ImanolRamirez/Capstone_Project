from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, extract
from app.models.budget import Budget
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.account import Account
from app.database import SessionLocal

budget_bp = Blueprint("budgets", __name__)


@budget_bp.route("/budgets", methods=["POST"])
@jwt_required()
def create_budget():
    user_id = get_jwt_identity()
    db = SessionLocal()
    try:
        data = request.get_json()

        # Accept category by name or by id
        category_id = data.get("category_id")
        if isinstance(category_id, str) and not category_id.isdigit():
            cat = db.query(Category).filter(Category.name == category_id).first()
            if not cat:
                return jsonify({"error": f"Category '{category_id}' not found"}), 404
            category_id = cat.id

        new_budget = Budget(
            user_id=int(user_id),
            category_id=category_id,
            amount=data["amount"],
            month=data["month"],
            year=data["year"]
        )

        db.add(new_budget)
        db.commit()
        db.refresh(new_budget)

        return jsonify({"message": "Budget created", "id": new_budget.id}), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@budget_bp.route("/budgets", methods=["GET"])
@jwt_required()
def get_budgets():
    user_id = int(get_jwt_identity())
    month = request.args.get("month", type=int)
    year = request.args.get("year", type=int)

    db = SessionLocal()
    try:
        query = db.query(Budget).filter(Budget.user_id == user_id)
        if month:
            query = query.filter(Budget.month == month)
        if year:
            query = query.filter(Budget.year == year)

        budgets = query.all()

        results = []
        for b in budgets:
            # Calculate actual spending for this category/month/year
            spent = db.query(func.coalesce(func.sum(Transaction.amount), 0)).join(
                Account, Transaction.account_id == Account.id
            ).filter(
                Account.user_id == user_id,
                Transaction.category_id == b.category_id,
                extract("month", Transaction.transaction_date) == b.month,
                extract("year", Transaction.transaction_date) == b.year,
                Transaction.amount < 0
            ).scalar()

            results.append({
                "id": b.id,
                "category_id": b.category_id,
                "category": b.category.name if b.category else "Unknown",
                "amount": float(b.amount),
                "spent": float(abs(spent)),
                "month": b.month,
                "year": b.year
            })

        return jsonify(results), 200
    finally:
        db.close()


@budget_bp.route("/budgets/<int:budget_id>", methods=["PUT"])
@jwt_required()
def update_budget(budget_id):
    user_id = int(get_jwt_identity())
    db = SessionLocal()
    try:
        budget = db.query(Budget).filter(
            Budget.id == budget_id,
            Budget.user_id == user_id
        ).first()

        if not budget:
            return jsonify({"error": "Budget not found"}), 404

        data = request.get_json()
        budget.amount = data.get("amount", budget.amount)

        db.commit()

        return jsonify({"message": "Budget updated"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@budget_bp.route("/budgets/<int:budget_id>", methods=["DELETE"])
@jwt_required()
def delete_budget(budget_id):
    user_id = int(get_jwt_identity())
    db = SessionLocal()
    try:
        budget = db.query(Budget).filter(
            Budget.id == budget_id,
            Budget.user_id == user_id
        ).first()

        if not budget:
            return jsonify({"error": "Budget not found"}), 404

        db.delete(budget)
        db.commit()

        return jsonify({"message": "Budget deleted"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()
