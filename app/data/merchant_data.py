from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.merchant import Merchant
from datetime import datetime, timezone

class MerchantData:

    def __init__(self, db: Session):
        self.db = db

    def get_merchants(self):
        return self.db.query(Merchant).filter(Merchant.deleted_at == None).all()

    def get_merchant_by_id(self, merchant_id: int):
        return self.db.query(Merchant).filter(
            Merchant.id == merchant_id,
            Merchant.deleted_at == None
        ).first()

    def create_merchant(self, merchant_name: str):
        merchant = Merchant(name=merchant_name)
        self.db.add(merchant)
        return merchant

    def update_merchant(self, merchant: Merchant):
        return merchant

    def delete_merchant(self, merchant: Merchant):
        merchant.deleted_at = func.now()
        return merchant

    def restore_merchant(self, merchant: Merchant):
        merchant.deleted_at = None
        return merchant


