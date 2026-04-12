from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.database import SessionLocal
from app.services.category_service import CategoryService

categories_bp = Blueprint("categories", __name__)


@categories_bp.route("/categories", methods=["GET"])
@jwt_required()
def get_categories():
    db = SessionLocal()
    try:
        service = CategoryService(db)
        categories = service.get_all()
        results = [
            {
                "id": c.id,
                "name": c.name,
                "type": c.type
            }
            for c in categories
        ]
        return jsonify(results), 200
    finally:
        db.close()


@categories_bp.route("/categories", methods=["POST"])
@jwt_required()
def create_category():
    data = request.get_json()

    if not data.get("name") or not data.get("type"):
        return jsonify({"error": "name and type are required"}), 400

    db = SessionLocal()
    try:
        service = CategoryService(db)
        category = service.create_category(name=data["name"], type=data["type"])
        return jsonify({
            "id": category.id,
            "name": category.name,
            "type": category.type
        }), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    finally:
        db.close()


@categories_bp.route("/categories/<int:category_id>", methods=["DELETE"])
@jwt_required()
def delete_category(category_id):
    db = SessionLocal()
    try:
        service = CategoryService(db)
        service.remove(category_id)
        return jsonify({"message": "Category deleted"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    finally:
        db.close()
