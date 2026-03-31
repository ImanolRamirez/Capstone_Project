from sqlalchemy.orm import Session

from data.transaction_data import TransactionData
from models.account import Account
from models.transaction import Transaction
from services.account_service import AccountService
from services.base_service import BaseService

from decimal import Decimal

class TransactionService(BaseService[Transaction, TransactionData]):
    def __init__(self, db: Session):
        super().__init__(db, TransactionData(db), "Transaction")
        self.account_service = AccountService(db)


    def create_transaction(self, account_id: int, category_id: int, amount:float, merchant_id:int = None, **kwargs):
        try:

            account = self.db.query(Account).filter(Account.id == account_id).with_for_update().first()

            if not account:
                raise ValueError("Account does not exist")

            transaction = Transaction(account_id=account_id, category_id=category_id, merchant_id=merchant_id, amount=amount, **kwargs)
            self.create(transaction)

            balance = account.balance + Decimal(str(amount))
            self.account_service.update(account_id, balance=balance, commit=False)

            self.db.commit()
            self.db.refresh(transaction)
            return transaction


        except Exception as e:
            self.db.rollback()
            raise e

    def get_user_spending_by_merchant(self, user_id: int, merchant_id: int):
        return self.data.get_sum_by_user_and_merchant(user_id, merchant_id)