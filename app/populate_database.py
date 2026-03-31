from faker import Faker
import random

from services.account_service import AccountService
from services.address_service import AddressService
from services.category_service import CategoryService
from services.lender_service import LenderService
from services.merchant_service import MerchantService
from services.transaction_service import TransactionService
from services.user_service import UserService
from database import SessionLocal

fake = Faker()

def populate_database(num_users: int, transaction_count: int):
    db = SessionLocal()

    user_service = UserService(db)
    address_service = AddressService(db)
    lender_service = LenderService(db)
    merchant_service = MerchantService(db)
    category_service = CategoryService(db)
    account_service = AccountService(db)
    transaction_service = TransactionService(db)

    try:
        print("populating database")
        lenders = []
        lender_names = ["Commerce", "UMB", "Chase", "Community America", "American Express"]
        for name in lender_names:
            lenders.append(lender_service.create_lender(name=name))

        categories = []
        category_names = [
            ("Housing", "Expense"), ("Food", "Expense"),
            ("Salary", "Income"), ("Utilities", "Expense"),
            ("Entertainment", "Expense"), ("Transfer", "Internal"),
            ("Billing", "Expense")
        ]
        for name, type in category_names:
            category = category_service.create_category(name=name, type=type)
            categories.append(category)

        merchants = []
        merchant_names = ["Amazon", "Apple", "Starbucks", "Walmart", "Netflix", "UMKC", "QuikTrip"]
        for name in merchant_names:
            merchant = merchant_service.create_merchant(name=name)
            merchants.append(merchant)

        print(f"Creating {num_users} users with {transaction_count} transactions each.")
        for _ in range(num_users):
            user = user_service.create_user(
                username=fake.user_name(),
                email=fake.email(),
                password="password123"
            )

            address_service.add_address(user.id, {
                "address_line1": fake.street_address(),
                "city": fake.city(),
                "state": fake.state(),
                "zip_code": fake.zipcode()
            })

            for i in range(random.randint(1, 3)):
                account_name = (f"{user.username}'s {random.choice(["Simple", "Preferred"])} "
                                f"{random.choice(["Checking", "Savings", "Checking", "Loan"])}")
                lender = random.choice(lenders)

                account = account_service.create_account(
                    user_id=user.id,
                    account_name=account_name,
                    account_type=random.choice(["Checking", "Savings", "Checking", "Loan"]),
                    lender_id=lender.id,
                    balance=0
                )

                print(f"Adding Transactions for account: {account.id}")
                for _ in range(transaction_count):
                    category = random.choice(categories)

                    if category.name == "Salary":
                        amount = random.uniform(1500, 5000)
                    else:
                        amount = random.uniform(-500, -5)

                    transaction_service.create_transaction(
                        account_id=account.id,
                        category_id=category.id,
                        amount=round(amount, 2),
                        description=fake.sentence(nb_words=random.randint(1, 10))
                    )

                print("Database populated.")

    except Exception as e:
        print(e)
        db.rollback()
    finally:
        db.close()



populate_database(num_users=50, transaction_count=13)