from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.database import SessionLocal
from app.services.address_service import AddressService

addresses_bp = Blueprint("addresses", __name__)


@addresses_bp.route("/addresses", methods=["GET"])
@jwt_required()
def get_addresses():
    user_id = get_jwt_identity()
    db = SessionLocal()
    try:
        service = AddressService(db)
        addresses = service.data.get_user_addresses(int(user_id))
        results = [
            {
                "id": a.id,
                "address_line1": a.address_line1,
                "address_line2": a.address_line2,
                "city": a.city,
                "state": a.state,
                "zip_code": a.zip_code,
                "country": a.country
            }
            for a in addresses
        ]
        return jsonify(results), 200
    finally:
        db.close()


@addresses_bp.route("/addresses", methods=["POST"])
@jwt_required()
def add_address():
    user_id = get_jwt_identity()
    data = request.get_json()

    required = ["address_line1", "city", "state", "zip_code"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    address_data = {
        "address_line1": data["address_line1"],
        "address_line2": data.get("address_line2"),
        "city": data["city"],
        "state": data["state"],
        "zip_code": data["zip_code"],
        "country": data.get("country", "United States")
    }

    db = SessionLocal()
    try:
        service = AddressService(db)
        address = service.add_address(
            user_id=int(user_id),
            address_data=address_data,
            address_type=data.get("address_type", "Primary")
        )
        return jsonify({
            "id": address.id,
            "address_line1": address.address_line1,
            "address_line2": address.address_line2,
            "city": address.city,
            "state": address.state,
            "zip_code": address.zip_code,
            "country": address.country
        }), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    finally:
        db.close()


@addresses_bp.route("/addresses/<int:address_id>", methods=["DELETE"])
@jwt_required()
def delete_address(address_id):
    db = SessionLocal()
    try:
        service = AddressService(db)
        service.remove(address_id)
        return jsonify({"message": "Address deleted"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    finally:
        db.close()
