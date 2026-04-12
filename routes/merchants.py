from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.database import SessionLocal
from app.services.merchant_service import MerchantService

merchants_bp = Blueprint("merchants", __name__)


@merchants_bp.route("/merchants", methods=["GET"])
@jwt_required()
def get_merchants():
    db = SessionLocal()
    try:
        service = MerchantService(db)
        merchants = service.get_all()
        results = [
            {
                "id": m.id,
                "name": m.name,
                "default_category": m.default_category
            }
            for m in merchants
        ]
        return jsonify(results), 200
    finally:
        db.close()


@merchants_bp.route("/merchants", methods=["POST"])
@jwt_required()
def create_merchant():
    data = request.get_json()

    if not data.get("name"):
        return jsonify({"error": "name is required"}), 400

    db = SessionLocal()
    try:
        service = MerchantService(db)
        merchant = service.create_merchant(
            name=data["name"],
            default_category=data.get("default_category")
        )
        return jsonify({
            "id": merchant.id,
            "name": merchant.name,
            "default_category": merchant.default_category
        }), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    finally:
        db.close()


@merchants_bp.route("/merchants/<int:merchant_id>", methods=["PUT"])
@jwt_required()
def rename_merchant(merchant_id):
    data = request.get_json()

    if not data.get("name"):
        return jsonify({"error": "name is required"}), 400

    db = SessionLocal()
    try:
        service = MerchantService(db)
        merchant = service.rename_merchant(merchant_id, data["name"])
        return jsonify({
            "id": merchant.id,
            "name": merchant.name,
            "default_category": merchant.default_category
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    finally:
        db.close()


@merchants_bp.route("/merchants/<int:merchant_id>", methods=["DELETE"])
@jwt_required()
def delete_merchant(merchant_id):
    db = SessionLocal()
    try:
        service = MerchantService(db)
        service.remove(merchant_id)
        return jsonify({"message": "Merchant deleted"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    finally:
        db.close()
