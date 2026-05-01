"""
add_loans.py — adds Auto Loan and Mortgage accounts to all existing users
who do not already have them.  Run once from the project root:

    python add_loans.py
"""

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

from app.models.account import Account
from app.models.lender import Lender
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.user import User
from app.services.account_service import AccountService
from app.services.lender_service import LenderService
from app.services.transaction_service import TransactionService
from app.database import SessionLocal

AUTO_LOAN_LENDERS = ["Chase Auto Finance", "Capital One Auto", "TD Auto Finance", "Ally Financial"]
MORTGAGE_LENDERS = ["Wells Fargo Home Mortgage", "Rocket Mortgage", "Bank of America Home Loans", "Chase Home Lending"]


def calc_monthly_payment(principal, annual_rate_pct, term_months):
    r = annual_rate_pct / 100 / 12
    if r == 0:
        return round(principal / term_months, 2)
    return round((principal * r) / (1 - (1 + r) ** -term_months), 2)


def months_ago_date(n):
    return datetime.now() - timedelta(days=30 * n)


def get_or_create_lender(db, name):
    lender = db.query(Lender).filter(Lender.name == name).first()
    if not lender:
        lender_service = LenderService(db)
        lender = lender_service.create_lender(name=name)
    return lender


def get_or_create_category(db, name, type_):
    cat = db.query(Category).filter(Category.name == name).first()
    if not cat:
        cat = Category(name=name, type=type_)
        db.add(cat)
        db.flush()
    return cat


def add_loans_to_users():
    db = SessionLocal()
    account_service = AccountService(db)
    transaction_service = TransactionService(db)

    try:
        # Ensure lenders exist
        auto_lenders = [get_or_create_lender(db, n) for n in AUTO_LOAN_LENDERS]
        mortgage_lenders_list = [get_or_create_lender(db, n) for n in MORTGAGE_LENDERS]
        db.commit()

        # Ensure categories exist
        income_cat = get_or_create_category(db, "Income", "Income")
        loan_payment_cat = get_or_create_category(db, "Loan Payment", "Expense")
        db.commit()

        users = db.query(User).all()
        print(f"Found {len(users)} users.")

        for user in users:
            existing_types = {
                a.account_type for a in db.query(Account).filter(
                    Account.user_id == user.id,
                    Account.deleted_at == None
                ).all()
            }

            # --- AUTO LOAN ---
            if "Auto Loan" not in existing_types:
                auto_lender = random.choice(auto_lenders)
                original = round(random.uniform(18000, 32000), 2)
                apr = round(random.uniform(4.9, 8.9), 2)
                term = 72
                monthly_payment = calc_monthly_payment(original, apr, term)
                months_paid = random.randint(12, 30)

                auto_loan = account_service.create_account(
                    user_id=user.id,
                    account_name=f"{user.first_name}'s Auto Loan",
                    account_type="Auto Loan",
                    lender_id=auto_lender.id,
                    balance=0,
                    interest_rate=apr
                )

                loan_start_date = months_ago_date(months_paid + 1)
                transaction_service.create_transaction(
                    account_id=auto_loan.id,
                    category_id=income_cat.id,
                    merchant_id=None,
                    amount=original,
                    description=f"Auto Loan Disbursement - {auto_lender.name}",
                    transaction_date=loan_start_date
                )

                for i in range(months_paid):
                    pay_date = months_ago_date(months_paid - i)
                    transaction_service.create_transaction(
                        account_id=auto_loan.id,
                        category_id=loan_payment_cat.id,
                        merchant_id=None,
                        amount=-monthly_payment,
                        description=f"Auto Loan Payment - {auto_lender.name}",
                        transaction_date=pay_date
                    )

                remaining = original - (monthly_payment * months_paid)
                print(f"  {user.first_name}: Auto Loan ${original:,.2f} @ {apr}% — {months_paid} payments made, ~${remaining:,.2f} remaining")
            else:
                print(f"  {user.first_name}: Auto Loan already exists, skipping.")

            # --- MORTGAGE ---
            if "Mortgage" not in existing_types:
                mort_lender = random.choice(mortgage_lenders_list)
                original = round(random.uniform(200000, 380000), 2)
                apr = round(random.uniform(6.5, 7.5), 2)
                term = 360
                monthly_payment = calc_monthly_payment(original, apr, term)
                months_paid = random.randint(24, 60)

                mortgage = account_service.create_account(
                    user_id=user.id,
                    account_name=f"{user.first_name}'s Mortgage",
                    account_type="Mortgage",
                    lender_id=mort_lender.id,
                    balance=0,
                    interest_rate=apr
                )

                mort_start_date = months_ago_date(months_paid + 1)
                transaction_service.create_transaction(
                    account_id=mortgage.id,
                    category_id=income_cat.id,
                    merchant_id=None,
                    amount=original,
                    description=f"Mortgage Disbursement - {mort_lender.name}",
                    transaction_date=mort_start_date
                )

                for i in range(months_paid):
                    pay_date = months_ago_date(months_paid - i)
                    transaction_service.create_transaction(
                        account_id=mortgage.id,
                        category_id=loan_payment_cat.id,
                        merchant_id=None,
                        amount=-monthly_payment,
                        description=f"Mortgage Payment - {mort_lender.name}",
                        transaction_date=pay_date
                    )

                remaining = original - (monthly_payment * months_paid)
                print(f"  {user.first_name}: Mortgage ${original:,.2f} @ {apr}% — {months_paid} payments made, ~${remaining:,.2f} remaining")
            else:
                print(f"  {user.first_name}: Mortgage already exists, skipping.")

        print("\nDone. All loans and mortgages added.")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    add_loans_to_users()
