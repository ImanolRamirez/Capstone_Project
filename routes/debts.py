from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Debt

debts_bp = Blueprint("debts", __name__)

@debts_bp.route("/debts", methods=["GET"])
@jwt_required()
def get_debts():

    user_id = get_jwt_identity()

    debts = Debt.query.filter_by(user_id=user_id).all()

    results = []
    for debt in debts:
        results.append({
            "id": debt.id,
            "name": debt.name,
            "amount": debt.amount,
            "interest_rate": debt.interest_rate
        })

    return jsonify(results), 200

@debts_bp.route("/debts", methods=["POST"])
@jwt_required()
def create_debt():

    user_id = get_jwt_identity()
    data = request.get_json()

    new_debt = Debt(
        name=data["name"],
        amount=data["amount"],
        interest_rate=data["interest_rate"],
        user_id=user_id
    )

    db.session.add(new_debt)
    db.session.commit()

    return jsonify({"message": "Debt created"}), 201

@debts_bp.route("/debts/<int:id>", methods=["PUT"])
@jwt_required()
def update_debt(id):

    data = request.get_json()
    debt = Debt.query.get_or_404(id)

    debt.name = data["name"]
    debt.amount = data["amount"]
    debt.interest_rate = data["interest_rate"]

    db.session.commit()

    return jsonify({"message": "Debt updated"})

@debts_bp.route("/debts/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_debt(id):

    debt = Debt.query.get_or_404(id)

    db.session.delete(debt)
    db.session.commit()

    return jsonify({"message": "Debt deleted"})