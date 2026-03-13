from sqlalchemy.orm import Session

from app.data.transaction_data import TransactionData
from app.models.account import Account
from app.models.transaction import Transaction
from app.services.account_service import AccountService
from app.services.base_service import BaseService


class TransactionService(BaseService[Transaction]):
    def __init__(self, db: Session, account_service: AccountService):
        super().__init__(db, TransactionData(db), "Transaction")
        self.account_service = AccountService(db)


    def create_transaction(self, account_id: int, category_id: int, amount:int, **kwargs):
        try:

            account = self.db.query(Account).filter(Account.id == account_id).with_for_update().first()

            if not account:
                raise ValueError("Account does not exist")

            transaction = Transaction(account_id=account_id, category_id=category_id, amount=amount, **kwargs)
            self.create(transaction)

            balance = account.balance + amount
            self.account_service.update(account_id, balance=balance, commit=False)

            self.db.commit()
            self.db.refresh(transaction)
            return transaction


        except Exception as e:
            self.db.rollback()
            raise e