from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.merchant import Merchant
from app.data.merchant_data import MerchantData

class MerchantService:

    def __init__(self, db: Session):
        self.db = db
        self.merchant_data = MerchantData(db)

    def get_merchants(self):
        return self.merchant_data.get_merchants()

    def create_merchant(self, name:str):

        name = name.strip().lower()

        merchant = self.db.query(Merchant).filter(
            func.lower(Merchant.name) == name,
            Merchant.deleted_at == None
        ).first()

        if merchant:
            raise ValueError("Merchant already exists")

        new_merchant = self.merchant_data.create_merchant(name)
        self.db.commit()
        self.db.refresh(new_merchant)
        return new_merchant

    def rename_merchant(self, merchant_id: int, new_name: str):
        merchant = self.merchant_data.get_merchant_by_id(merchant_id)
        if not merchant:
            raise ValueError("Merchant not found")

        merchant.name = new_name.strip()
        self.db.commit()
        self.db.refresh(merchant)
        return merchant

    def remove_merchant(self, merchant_id: int):
        merchant = self.merchant_data.get_merchant_by_id(merchant_id)
        if merchant:
            self.merchant_data.delete_merchant(merchant)
            self.db.commit()
            return True
        else:
            raise ValueError("Merchant not found")