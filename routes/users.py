from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.database import SessionLocal
from app.models.user import User
from app.models.account import Account
from app.services.user_service import UserService

users_bp = Blueprint("users", __name__)


@users_bp.route("/user/me", methods=["GET"])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    db = SessionLocal()
    try:
        service = UserService(db)
        user = service.get_by_id(int(user_id))
        return jsonify({
            "id": user.id,
            "firstName": user.first_name,
            "lastName": user.last_name,
            "email": user.email,
            "username": user.username,
            "security_question": user.security_question,
            "language": user.language or "English"
        }), 200
    except ValueError:
        return jsonify({"error": "User not found"}), 404
    finally:
        db.close()


@users_bp.route("/user/update", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    data = request.get_json()
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        if data.get("firstName") and data["firstName"] != user.first_name:
            old_first = user.first_name
            new_first = data["firstName"]
            user.first_name = new_first
            # Rename any accounts that start with the old first name
            accounts = db.query(Account).filter(Account.user_id == int(user_id)).all()
            for acct in accounts:
                if acct.account_name.startswith(old_first + "'s"):
                    acct.account_name = acct.account_name.replace(
                        old_first + "'s", new_first + "'s", 1
                    )

        if data.get("lastName"):
            user.last_name = data["lastName"]

        if data.get("email"):
            existing = db.query(User).filter(User.email == data["email"], User.id != int(user_id)).first()
            if existing:
                return jsonify({"error": "Email already in use"}), 400
            user.email = data["email"]

        db.commit()
        return jsonify({
            "message": "Profile updated",
            "firstName": user.first_name,
            "lastName": user.last_name,
            "email": user.email
        }), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@users_bp.route("/user/password", methods=["PUT"])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    data = request.get_json()
    db = SessionLocal()
    try:
        service = UserService(db)
        user = service.get_by_id(int(user_id))

        current_password = data.get("currentPassword")
        new_password = data.get("newPassword")

        if not current_password or not new_password:
            return jsonify({"error": "Current and new password are required"}), 400

        from app.utils.security import verify_password
        if not verify_password(current_password, user.password_hash):
            return jsonify({"error": "Current password is incorrect"}), 400

        service.update_user_password(int(user_id), new_password)
        return jsonify({"message": "Password updated successfully"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    finally:
        db.close()


@users_bp.route("/user/security", methods=["PUT"])
@jwt_required()
def update_security():
    user_id = get_jwt_identity()
    data = request.get_json()
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        if data.get("security_question"):
            user.security_question = data["security_question"]
        if data.get("security_answer"):
            user.security_answer = data["security_answer"]

        db.commit()
        return jsonify({"message": "Security question updated"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@users_bp.route("/user/language", methods=["PUT"])
@jwt_required()
def update_language():
    user_id = get_jwt_identity()
    data = request.get_json()
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        if not data.get("language"):
            return jsonify({"error": "Language is required"}), 400

        user.language = data["language"]
        db.commit()
        return jsonify({"message": "Language updated", "language": user.language}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()
