from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from routes.transactions import transaction_bp
from routes.dashboard import dashboard_bp
from routes.auth import auth
from routes.budgets import budget_bp
from routes.debts import debts_bp
from routes.accounts import accounts_bp
from routes.categories import categories_bp
from routes.merchants import merchants_bp
from routes.lenders import lenders_bp
from routes.addresses import addresses_bp
from app.database import Base, engine
import app.models.user
import app.models.account
import app.models.transaction
import app.models.category
import app.models.merchant
import app.models.address
import app.models.user_address
import app.models.lender
import app.models.budget

flask_app = Flask(__name__)

flask_app.config["SECRET_KEY"] = "secret_key"
flask_app.config["JWT_SECRET_KEY"] = "secret_key"

JWTManager(flask_app)
CORS(flask_app)

# Register blueprints
flask_app.register_blueprint(auth)
flask_app.register_blueprint(transaction_bp)
flask_app.register_blueprint(dashboard_bp)
flask_app.register_blueprint(budget_bp)
flask_app.register_blueprint(debts_bp)
flask_app.register_blueprint(accounts_bp)
flask_app.register_blueprint(categories_bp)
flask_app.register_blueprint(merchants_bp)
flask_app.register_blueprint(lenders_bp)
flask_app.register_blueprint(addresses_bp)

# Create tables
Base.metadata.create_all(engine)
print("Tables created")

if __name__ == "__main__":
    flask_app.run(debug=True)