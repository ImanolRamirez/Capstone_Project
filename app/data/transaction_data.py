from sqlalchemy.orm import Session

from app.data.base_data import BaseData
from app.models.transaction import Transaction


class TransactionData(BaseData[Transaction]):
    def __init__(self, db: Session):
        super().__init__(db, Transaction)

    def get_by_account(self, account_id: int):
        return self.db.query(Transaction).filter(
            Transaction.account_id == account_id,
            Transaction.deleted_at == None
        ).all()