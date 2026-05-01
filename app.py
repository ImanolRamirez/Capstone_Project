import os
from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from datetime import timedelta
from routes.transactions import transaction_bp
from routes.users import users_bp
from routes.transfers import transfers_bp
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
from dotenv import load_dotenv

load_dotenv()

flask_app = Flask(__name__)

flask_app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY")
flask_app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY")
flask_app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)

JWTManager(flask_app)
CORS(flask_app)

# Register blueprints with /api prefix
flask_app.register_blueprint(auth, url_prefix="/api")
flask_app.register_blueprint(transaction_bp, url_prefix="/api")
flask_app.register_blueprint(dashboard_bp, url_prefix="/api")
flask_app.register_blueprint(budget_bp, url_prefix="/api")
flask_app.register_blueprint(debts_bp, url_prefix="/api")
flask_app.register_blueprint(accounts_bp, url_prefix="/api")
flask_app.register_blueprint(categories_bp, url_prefix="/api")
flask_app.register_blueprint(merchants_bp, url_prefix="/api")
flask_app.register_blueprint(lenders_bp, url_prefix="/api")
flask_app.register_blueprint(addresses_bp, url_prefix="/api")
flask_app.register_blueprint(users_bp, url_prefix="/api")
flask_app.register_blueprint(transfers_bp, url_prefix="/api")

# Create tables
Base.metadata.create_all(engine)
print("Tables created")

if __name__ == "__main__":
    flask_app.run(debug=True)
