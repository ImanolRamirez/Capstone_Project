from faker import Faker
import random
import math
from datetime import datetime, timedelta

import app.models.user
import app.models.account
import app.models.transaction
import app.models.category
import app.models.merchant
import app.models.address
import app.models.user_address
import app.models.lender
import app.models.budget

from app.services.account_service import AccountService
from app.services.address_service import AddressService
from app.services.category_service import CategoryService
from app.services.lender_service import LenderService
from app.services.merchant_service import MerchantService
from app.services.transaction_service import TransactionService
from app.services.user_service import UserService
from app.database import SessionLocal

fake = Faker()

# Realistic transactions per category: (merchant, description, min, max)
# Positive = income, Negative = expense
TRANSACTION_TEMPLATES = {
    "Income": [
        (None, "Paycheck - Direct Deposit", 2500, 5000),
        (None, "Salary Deposit", 2000, 4500),
        (None, "Freelance Payment", 500, 2000),
        (None, "Bonus Deposit", 300, 1500),
    ],
    "Food": [
        ("McDonald's", "McDonald's - Lunch", -5, -15),
        ("Starbucks", "Starbucks - Coffee", -5, -12),
        ("Chipotle", "Chipotle - Dinner", -10, -20),
        ("Walmart", "Walmart - Groceries", -40, -150),
        ("Trader Joe's", "Trader Joe's - Groceries", -30, -120),
        ("Chick-fil-A", "Chick-fil-A - Lunch", -8, -18),
    ],
    "Shopping": [
        ("Amazon", "Amazon - Online Order", -15, -200),
        ("Target", "Target - Household Items", -20, -150),
        ("Walmart", "Walmart - General Shopping", -30, -200),
        ("Best Buy", "Best Buy - Electronics", -50, -500),
        ("Nike", "Nike - Shoes", -60, -180),
    ],
    "Utilities": [
        ("Evergy", "Evergy - Electric Bill", -80, -200),
        ("AT&T", "AT&T - Internet Bill", -50, -100),
        ("City Water", "City Water - Water Bill", -30, -70),
        ("Spire", "Spire - Gas Bill", -40, -120),
    ],
    "Transportation": [
        ("QuikTrip", "QuikTrip - Gas", -30, -80),
        ("Shell", "Shell - Gas", -30, -80),
        ("Uber", "Uber - Ride", -8, -40),
        ("Kansas City Metro", "KC Metro - Bus Pass", -30, -60),
        ("jiffy Lube", "Jiffy Lube - Oil Change", -50, -100),
    ],
    "Bills": [
        ("State Farm", "State Farm - Auto Insurance", -80, -200),
        ("T-Mobile", "T-Mobile - Phone Bill", -40, -100),
        ("Rent", "Rent - Monthly Payment", -700, -1800),
        ("Progressive", "Progressive - Insurance", -70, -180),
    ],
    "Subscriptions": [
        ("Netflix", "Netflix - Monthly Subscription", -15, -23),
        ("Spotify", "Spotify - Monthly Subscription", -10, -16),
        ("Hulu", "Hulu - Monthly Subscription", -8, -18),
        ("Disney+", "Disney+ - Monthly Subscription", -8, -14),
        ("YouTube Premium", "YouTube Premium - Monthly", -14, -14),
    ],
    "Memberships": [
        ("Costco", "Costco - Annual Membership", -65, -65),
        ("Planet Fitness", "Planet Fitness - Monthly Membership", -10, -25),
        ("Amazon", "Amazon Prime - Annual Membership", -139, -139),
        ("Sam's Club", "Sam's Club - Annual Membership", -50, -50),
    ],
}

# Lender groups
CHECKING_SAVINGS_LENDERS = ["Commerce Bank", "UMB Bank", "Chase", "Community America", "American Express"]
AUTO_LOAN_LENDERS = ["Chase Auto Finance", "Capital One Auto", "TD Auto Finance", "Ally Financial"]
MORTGAGE_LENDERS = ["Wells Fargo Home Mortgage", "Rocket Mortgage", "Bank of America Home Loans", "Chase Home Lending"]


def calc_monthly_payment(principal, annual_rate_pct, term_months):
    """Standard amortization monthly payment formula."""
    r = annual_rate_pct / 100 / 12
    if r == 0:
        return round(principal / term_months, 2)
    return round((principal * r) / (1 - (1 + r) ** -term_months), 2)


def months_ago_date(n):
    return datetime.now() - timedelta(days=30 * n)


def populate_database(num_users: int):
    db = SessionLocal()

    user_service = UserService(db)
    address_service = AddressService(db)
    lender_service = LenderService(db)
    merchant_service = MerchantService(db)
    category_service = CategoryService(db)
    account_service = AccountService(db)
    transaction_service = TransactionService(db)

    try:
        print("Populating database...")

        # Create lenders
        all_lender_names = CHECKING_SAVINGS_LENDERS + AUTO_LOAN_LENDERS + MORTGAGE_LENDERS
        all_lenders = {name: lender_service.create_lender(name=name) for name in all_lender_names}

        checking_lenders = [all_lenders[n] for n in CHECKING_SAVINGS_LENDERS]
        auto_lenders = [all_lenders[n] for n in AUTO_LOAN_LENDERS]
        mortgage_lenders = [all_lenders[n] for n in MORTGAGE_LENDERS]

        # Create categories
        category_defs = [
            ("Income", "Income"),
            ("Food", "Expense"),
            ("Shopping", "Expense"),
            ("Utilities", "Expense"),
            ("Transportation", "Expense"),
            ("Bills", "Expense"),
            ("Subscriptions", "Expense"),
            ("Memberships", "Expense"),
            ("Loan Payment", "Expense"),
        ]
        categories = {}
        for name, type in category_defs:
            categories[name] = category_service.create_category(name=name, type=type)

        # Create merchants
        all_merchant_names = set()
        for templates in TRANSACTION_TEMPLATES.values():
            for merchant, _, _, _ in templates:
                if merchant:
                    all_merchant_names.add(merchant)
        merchants = {}
        for name in all_merchant_names:
            merchants[name] = merchant_service.create_merchant(name=name)

        print(f"Creating {num_users} users...")

        for _ in range(num_users):
            user = user_service.create_user(
                username=fake.user_name(),
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                email=fake.email(),
                password="Password123!"
            )

            address_service.add_address(user.id, {
                "address_line1": fake.street_address(),
                "city": fake.city(),
                "state": fake.state(),
                "zip_code": fake.zipcode()
            })

            lender = random.choice(checking_lenders)

            # Checking account
            checking = account_service.create_account(
                user_id=user.id,
                account_name=f"{user.first_name}'s Checking",
                account_type="Checking",
                lender_id=lender.id,
                balance=0,
                interest_rate=0.00
            )

            # Savings account
            savings = account_service.create_account(
                user_id=user.id,
                account_name=f"{user.first_name}'s Savings",
                account_type="Savings",
                lender_id=lender.id,
                balance=0,
                interest_rate=4.50
            )

            # --- AUTO LOAN ---
            auto_lender = random.choice(auto_lenders)
            auto_original = round(random.uniform(18000, 32000), 2)
            auto_apr = round(random.uniform(4.9, 8.9), 2)
            auto_term = 72  # months
            auto_monthly_payment = calc_monthly_payment(auto_original, auto_apr, auto_term)
            auto_months_paid = random.randint(12, 30)

            auto_loan = account_service.create_account(
                user_id=user.id,
                account_name=f"{user.first_name}'s Auto Loan",
                account_type="Auto Loan",
                lender_id=auto_lender.id,
                balance=0,
                interest_rate=auto_apr
            )

            # Initial disbursement (dated back when loan originated)
            loan_start_date = months_ago_date(auto_months_paid + 1)
            transaction_service.create_transaction(
                account_id=auto_loan.id,
                category_id=categories["Income"].id,
                merchant_id=None,
                amount=auto_original,
                description=f"Auto Loan Disbursement - {auto_lender.name}",
                transaction_date=loan_start_date
            )

            # Monthly payment history
            for i in range(auto_months_paid):
                pay_date = months_ago_date(auto_months_paid - i)
                transaction_service.create_transaction(
                    account_id=auto_loan.id,
                    category_id=categories["Loan Payment"].id,
                    merchant_id=None,
                    amount=-auto_monthly_payment,
                    description=f"Auto Loan Payment - {auto_lender.name}",
                    transaction_date=pay_date
                )

            # --- MORTGAGE ---
            mortgage_lender = random.choice(mortgage_lenders)
            mortgage_original = round(random.uniform(200000, 380000), 2)
            mortgage_apr = round(random.uniform(6.5, 7.5), 2)
            mortgage_term = 360  # months (30 years)
            mortgage_monthly_payment = calc_monthly_payment(mortgage_original, mortgage_apr, mortgage_term)
            mortgage_months_paid = random.randint(24, 60)

            mortgage = account_service.create_account(
                user_id=user.id,
                account_name=f"{user.first_name}'s Mortgage",
                account_type="Mortgage",
                lender_id=mortgage_lender.id,
                balance=0,
                interest_rate=mortgage_apr
            )

            # Initial disbursement
            mortgage_start_date = months_ago_date(mortgage_months_paid + 1)
            transaction_service.create_transaction(
                account_id=mortgage.id,
                category_id=categories["Income"].id,
                merchant_id=None,
                amount=mortgage_original,
                description=f"Mortgage Disbursement - {mortgage_lender.name}",
                transaction_date=mortgage_start_date
            )

            # Monthly payment history
            for i in range(mortgage_months_paid):
                pay_date = months_ago_date(mortgage_months_paid - i)
                transaction_service.create_transaction(
                    account_id=mortgage.id,
                    category_id=categories["Loan Payment"].id,
                    merchant_id=None,
                    amount=-mortgage_monthly_payment,
                    description=f"Mortgage Payment - {mortgage_lender.name}",
                    transaction_date=pay_date
                )

            # Guarantee at least one transaction per expense category in checking
            expense_categories = ["Food", "Shopping", "Utilities", "Transportation", "Bills", "Subscriptions", "Memberships"]

            for cat_name in expense_categories:
                template = random.choice(TRANSACTION_TEMPLATES[cat_name])
                merchant_name, description, min_amt, max_amt = template
                amount = round(random.uniform(min_amt, max_amt), 2)
                merchant_id = merchants[merchant_name].id if merchant_name and merchant_name in merchants else None
                transaction_service.create_transaction(
                    account_id=checking.id,
                    category_id=categories[cat_name].id,
                    merchant_id=merchant_id,
                    amount=amount,
                    description=description
                )

            # Add several income transactions to checking
            for _ in range(5):
                template = random.choice(TRANSACTION_TEMPLATES["Income"])
                _, description, min_amt, max_amt = template
                amount = round(random.uniform(min_amt, max_amt), 2)
                transaction_service.create_transaction(
                    account_id=checking.id,
                    category_id=categories["Income"].id,
                    merchant_id=None,
                    amount=amount,
                    description=description
                )

            # Add extra random expense transactions to checking
            for _ in range(5):
                cat_name = random.choice(expense_categories)
                template = random.choice(TRANSACTION_TEMPLATES[cat_name])
                merchant_name, description, min_amt, max_amt = template
                amount = round(random.uniform(min_amt, max_amt), 2)
                merchant_id = merchants[merchant_name].id if merchant_name and merchant_name in merchants else None
                transaction_service.create_transaction(
                    account_id=checking.id,
                    category_id=categories[cat_name].id,
                    merchant_id=merchant_id,
                    amount=amount,
                    description=description
                )

            # Savings deposits
            for _ in range(4):
                amount = round(random.uniform(200, 1000), 2)
                transaction_service.create_transaction(
                    account_id=savings.id,
                    category_id=categories["Income"].id,
                    merchant_id=None,
                    amount=amount,
                    description="Savings Transfer"
                )

            print(f"Created user: {user.email}")

        print("Database populated successfully.")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    populate_database(num_users=5)
