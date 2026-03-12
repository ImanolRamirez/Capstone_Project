from sqlalchemy.orm import Session
from app.data.base_data import BaseData
from app.models.lender import Lender

class LenderData(BaseData[Lender]):

    def __init__(self, db: Session):
        super().__init__(db, Lender)

    def create_lender(self, lender_name: str):
        lender = Lender(name=lender_name)
        self.db.add(lender)
        return lender