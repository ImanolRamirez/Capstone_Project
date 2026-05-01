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

    first_name = data.get("firstName") or data.get("first_name", "")
    last_name = data.get("lastName") or data.get("last_name", "")
    email = data.get("email", "")
    password = data.get("password", "")
    security_question = data.get("securityQuestion", "").strip()
    security_answer = data.get("securityAnswer", "").strip()

    if not first_name or not last_name or not email or not password:
        return jsonify({"error": "First name, last name, email, and password are required"}), 400

    if not security_question or not security_answer:
        return jsonify({"error": "Security question and answer are required"}), 400

    # Auto-generate username from first + last name
    username = (first_name + last_name).lower().replace(" ", "")

    db = SessionLocal()
    try:
        service = UserService(db)
        user = service.create_user(
            username=username,
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=password
        )
        # Save security question after user is created
        user.security_question = security_question
        user.security_answer = security_answer
        db.commit()
        return jsonify({"message": "Registration successful", "id": user.id}), 201
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
                "email": user.email,
                "firstName": user.first_name,
                "lastName": user.last_name,
                "username": user.username
            }
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 401
    finally:
        db.close()


@auth.route("/forgot-password/question", methods=["POST"])
def get_security_question():
    data = request.get_json()
    email = data.get("email", "").strip()

    if not email:
        return jsonify({"error": "Email is required"}), 400

    db = SessionLocal()
    try:
        service = UserService(db)
        user = service.data.read_user_email(email)
        if not user:
            return jsonify({"error": "No account found with that email"}), 404
        if not user.security_question:
            return jsonify({"error": "No security question set for this account"}), 400
        return jsonify({"security_question": user.security_question}), 200
    finally:
        db.close()


@auth.route("/forgot-password/reset", methods=["POST"])
def reset_password_via_security():
    data = request.get_json()
    email = data.get("email", "").strip()
    answer = data.get("security_answer", "").strip()
    new_password = data.get("new_password", "")

    if not email or not answer or not new_password:
        return jsonify({"error": "Email, security answer, and new password are required"}), 400

    db = SessionLocal()
    try:
        service = UserService(db)
        user = service.data.read_user_email(email)
        if not user:
            return jsonify({"error": "No account found with that email"}), 404
        if not user.security_answer:
            return jsonify({"error": "No security answer set for this account"}), 400

        # Case-insensitive answer comparison
        if user.security_answer.strip().lower() != answer.lower():
            return jsonify({"error": "Incorrect security answer"}), 401

        service.update_user_password(user.id, new_password)
        return jsonify({"message": "Password reset successfully"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    finally:
        db.close()


@auth.route("/auth/me", methods=["GET"])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()

    db = SessionLocal()
    try:
        service = UserService(db)
        user = service.get_by_id(int(user_id))
        return jsonify({
            "id": user.id,
            "email": user.email,
            "firstName": user.first_name,
            "lastName": user.last_name,
            "username": user.username
        }), 200
    except ValueError:
        return jsonify({"error": "User not found"}), 404
    finally:
        db.close()
