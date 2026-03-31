from flask import Flask
from flask_bcrypt import Bcrypt
from routes.transactions import transaction_bp
from routes.dashboard import dashboard_bp
from routes.auth import auth
from routes.budgets import budget_bp
from routes.debts import debts_bp
from extensions import db
from models import User, Transaction, Debt, Budget
from flask_cors import CORS

app = Flask(__name__)

# Database config
app.config["SECRET_KEY"] = "secret_key"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///./budget.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False


# Initialize extensions
db.init_app(app)
bcrypt = Bcrypt(app)
CORS(app)

# Register blueprints
app.register_blueprint(auth)
app.register_blueprint(transaction_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(budget_bp)
app.register_blueprint(debts_bp)


# Create tables automatically
with app.app_context():
    db.create_all()
    print("Tables created")

if __name__ == "__main__":
    app.run(debug=True)