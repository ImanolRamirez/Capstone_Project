from sqlalchemy.orm import Session
from data.base_data import BaseData
from models.merchant import Merchant

class MerchantData(BaseData[Merchant]):

    def __init__(self, db: Session):
        super().__init__(db, Merchant)


