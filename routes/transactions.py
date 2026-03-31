from flask import Blueprint, jsonify, request
from models import db, Transaction

transaction_bp = Blueprint("transactions", __name__)

transactions = [
    {"id": 1, "amount": 2000, "type": "income", "category": "Salary"},
    {"id": 2, "amount": 50, "type": "expense", "category": "Food"},
    {"id": 3, "amount": 800, "type": "expense", "category": "Rent"},
]

# GET all transactions
@transaction_bp.route("/transactions", methods=["GET"])
def get_transactions():
    month = request.args.get("month")
    year = request.args.get("year")
    type = request.args.get("type")
    category = request.args.get("category")

    query = Transaction.query.filter_by(user_id=1)

    if month and year:
        query = query.filter(
            db.extract('month', Transaction.date) == int(month),
            db.extract('year', Transaction.date) == int(year)
        )

    if category:
        query = query.filter_by(category=category)

    if type:
        query = query.filter_by(type=type)

    transactions = query.all()

    results = []
    for t in transactions:
        results.append({
            "id": t.id,
            "amount": t.amount,
            "type" : t.type,
            "category": t.category,
            "date": t.date
        })

    return jsonify(results)


# POST new transaction
@transaction_bp.route("/transactions", methods=["POST"])
def add_transaction():
    data = request.get_json()

    if not data.get("amount") or not data.get("type"):
        return jsonify({"error": "Amount and type required"}), 400

    new_transaction = {
        "id": len(transactions) + 1,
        "amount": data["amount"],
        "type" : data["type"],
        "category": data.get("category", "Other")
    }

    db.session.add(new_transaction)
    db.session.commit()

    return jsonify({
        "id": new_transaction.id,
        "amount": new_transaction.amount,
        "type": new_transaction.type,
        "category": new_transaction.category,
        "date": new_transaction.date
    }), 201