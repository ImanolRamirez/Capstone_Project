from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
    create_access_token
)
from app.database import SessionLocal
from app.services.user_service import UserService

auth = Blueprint("auth", __name__)

@auth.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password required"}), 400

    db = SessionLocal()
    try:
        service = UserService(db)
        service.create_user(username=username, email=email, password=password)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    finally:
        db.close()

@auth.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    db = SessionLocal()
    try:
        service = UserService(db)
        user = service.authenticate_user(email=email, password=password)
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "user": {
                "id": user.id,
                "email": user.email
            }
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 401
    finally:
        db.close()


@auth.route("/auth/me", methods=["GET"])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()

    db = SessionLocal()
    try:
        service = UserService(db)
        user = service.get_user_by_id(user_id)
        return jsonify({
            "id": user.id,
            "email": user.email
        }), 200
    except ValueError:
        return jsonify({"error": "User not found"}), 404
    finally:        db.close()
    