from sqlalchemy.orm import Session
from app.models.lender import Lender
from app.data.lender_data import LenderData
from app.services.base_service import BaseService


class LenderService(BaseService[Lender]):

    def __init__(self, db: Session, ):
        super().__init__(db, LenderData(db), "Lender")

    def rename_lender(self, lender_id: int, new_name: str):
        return self.update(lender_id, name=new_name.strip())
