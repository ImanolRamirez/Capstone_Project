from sqlalchemy.orm import Session
from models.merchant import Merchant
from data.merchant_data import MerchantData
from services.base_service import BaseService


class MerchantService(BaseService[Merchant, MerchantData]):

    def __init__(self, db: Session):
        super().__init__(db, MerchantData(db), "Merchant")

    def create_merchant(self, name: str, **kwargs):
        name = name.strip()

        existing_merchant = self.data.get_by_name(name)
        if existing_merchant:
            raise ValueError(f"Merchant with name {name} already exists")

        new_merchant = Merchant(name=name, **kwargs)
        return self.create(new_merchant)

    def rename_merchant(self, merchant_id: int, new_name: str):
        return self.update(merchant_id, name=new_name.strip().lower())