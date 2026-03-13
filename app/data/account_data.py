from sqlalchemy.orm import Session
from app.data.base_data import BaseData
from app.models.account import Account

class AccountData(BaseData[Account]):

    def __init__(self, db: Session):
        super().__init__(db, Account)

    def get_accounts_by_user(self, user_id: int):
        return self.db.query(Account).filter(
            Account.user_id == user_id,
            Account.deleted_at == None
        ).all()
