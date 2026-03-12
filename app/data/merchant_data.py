from sqlalchemy.orm import Session
from app.data.base_data import BaseData
from app.models.merchant import Merchant

class MerchantData(BaseData[Merchant]):

    def __init__(self, db: Session):
        super().__init__(db, Merchant)

    def create_merchant(self, merchant_name: str):
        merchant = Merchant(name=merchant_name)
        self.db.add(merchant)
        return merchant


