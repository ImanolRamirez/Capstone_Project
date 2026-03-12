from sqlalchemy.orm import Session
from app.models.merchant import Merchant
from app.data.merchant_data import MerchantData
from app.services.base_service import BaseService


class MerchantService(BaseService[Merchant]):

    def __init__(self, db: Session):
        super().__init__(db, MerchantData(db), "Merchant")

    def rename_merchant(self, merchant_id: int, new_name: str):
        return self.update(merchant_id, name=new_name.strip())