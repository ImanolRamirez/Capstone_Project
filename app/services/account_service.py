import random
from sqlalchemy.orm import Session
from app.data.account_data import AccountData
from app.models.account import Account
from app.services.base_service import BaseService


def _generate_routing_number() -> str:
    return str(random.randint(100000000, 999999999))


def _generate_account_number() -> str:
    return str(random.randint(1000000000, 9999999999))


class AccountService(BaseService[Account, AccountData]):
    def __init__(self, db: Session):
        super().__init__(db, AccountData(db), "Account")

    def create_account(self, user_id: int, account_name: str, account_type: str, lender_id: int,  **kwargs):
        existing_account = self.db.query(Account).filter(
            Account.user_id == user_id,
            Account.account_name == account_name.strip(),
            Account.lender_id == lender_id,
        ).first()

        if existing_account:
            if existing_account.deleted_at is not None:
                raise ValueError("Account was previously deleted.")
            else:
                raise ValueError("Account already exists.")

        new_account = Account(
            user_id=user_id,
            account_name=account_name,
            account_type=account_type,
            lender_id=lender_id,
            routing_number=_generate_routing_number(),
            account_number=_generate_account_number(),
            **kwargs
        )

        return self.create(new_account, commit=True)


    def get_user_accounts(self, user_id: int):
        return self.data.get_accounts_by_user(user_id)

    def update_balance(self, account_id: int, new_balance: float):
        return self.update(account_id, balance=new_balance, commit=True)
