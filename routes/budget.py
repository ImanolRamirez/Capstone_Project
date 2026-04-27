from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.database import SessionLocal
from app.services.budget_service import BudgetService

budget_bp = Blueprint("budgets", __name__)


@budget_bp.route("/budgets", methods=["POST"])
@jwt_required()
def create_budget():
    user_id = get_jwt_identity()
    data = request.get_json()

    # Validate required fields
    if not all(k in data for k in ("category_id", "amount", "month", "year")):
        return jsonify({"error": "category_id, amount, month, and year are required"}), 400

    db = SessionLocal()
    try:
        service = BudgetService(db)
        budget = service.create_budget(
            user_id=int(user_id),
            category_id=int(data["category_id"]),
            amount=float(data["amount"]),
            month=int(data["month"]),
            year=int(data["year"])
        )
        return jsonify({"message": "Budget created", "id": budget.id}), 201

    except ValueError as e:
        # Gracefully handle "Budget already exists" and other business logic errors
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.rollback()
        return jsonify({"error": "An unexpected error occurred."}), 500
    finally:
        db.close()


@budget_bp.route("/budgets", methods=["GET"])
@jwt_required()
def get_budgets():
    user_id = get_jwt_identity()
    db = SessionLocal()
    try:
        service = BudgetService(db)
        budgets = service.get_user_budgets(int(user_id))

        results = [{
            "id": b.id,
            "category_id": b.category_id,
            "amount": str(b.amount),
            "month": b.month,
            "year": b.year
        } for b in budgets]

        return jsonify(results), 200
    finally:
        db.close()


@budget_bp.route("/budgets/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_budget(id):
    db = SessionLocal()
    try:
        service = BudgetService(db)
        # Note: Depending on your BaseService implementation,
        # you might need to pass commit=True here if not handled natively.
        service.remove(id, commit=True)
        return jsonify({"message": "Budget deleted"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        db.rollback()
        return jsonify({"error": "An unexpected error occurred."}), 500
    finally:
        db.close()