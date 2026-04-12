from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.database import SessionLocal
from app.services.lender_service import LenderService

lenders_bp = Blueprint("lenders", __name__)


@lenders_bp.route("/lenders", methods=["GET"])
@jwt_required()
def get_lenders():
    db = SessionLocal()
    try:
        service = LenderService(db)
        lenders = service.get_all()
        results = [{"id": l.id, "name": l.name} for l in lenders]
        return jsonify(results), 200
    finally:
        db.close()


@lenders_bp.route("/lenders", methods=["POST"])
@jwt_required()
def create_lender():
    data = request.get_json()

    if not data.get("name"):
        return jsonify({"error": "name is required"}), 400

    db = SessionLocal()
    try:
        service = LenderService(db)
        lender = service.create_lender(name=data["name"])
        return jsonify({"id": lender.id, "name": lender.name}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    finally:
        db.close()


@lenders_bp.route("/lenders/<int:lender_id>", methods=["PUT"])
@jwt_required()
def rename_lender(lender_id):
    data = request.get_json()

    if not data.get("name"):
        return jsonify({"error": "name is required"}), 400

    db = SessionLocal()
    try:
        service = LenderService(db)
        lender = service.rename_lender(lender_id, data["name"])
        return jsonify({"id": lender.id, "name": lender.name}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    finally:
        db.close()


@lenders_bp.route("/lenders/<int:lender_id>", methods=["DELETE"])
@jwt_required()
def delete_lender(lender_id):
    db = SessionLocal()
    try:
        service = LenderService(db)
        service.remove(lender_id)
        return jsonify({"message": "Lender deleted"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    finally:
        db.close()
