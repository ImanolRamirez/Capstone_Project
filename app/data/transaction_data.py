from sqlalchemy import func
from sqlalchemy.orm import Session

from data.base_data import BaseData
from models.account import Account
from models.transaction import Transaction


class TransactionData(BaseData[Transaction]):
    def __init__(self, db: Session):
        super().__init__(db, Transaction)

    def get_by_account(self, account_id: int):
        return self.db.query(Transaction).filter(
            Transaction.account_id == account_id,
            Transaction.deleted_at == None
        ).all()

    def get_sum_by_user_and_merchant(self, user_id: int, merchant_id: int):
        return self.db.query(func.sum(Transaction.amount)).join(
            Account, Transaction.account_id == Account.id
        ).filter(
            Account.user_id == user_id,
            Transaction.merchant_id == merchant_id,
            Transaction.deleted_at == None
        ).scalar() or 0.0