from sqlalchemy.orm import Session
from app.data.base_data import BaseData
from app.models.address import Address
from app.models.user_address import UserAddress


class AddressData(BaseData[Address]):
    def __init__(self, db: Session):
        super().__init__(db, Address)

    def get_by_address(self, line1: str, zipcode: str):
        return self.db.query(Address).filter(
            Address.address_line1 == line1,
            Address.zip_code == zipcode,
            Address.deleted_at == None
        ).first()

    def get_user_addresses(self, user_id: int):

        return self.db.query(Address).join(
            UserAddress, UserAddress.address_id == Address.id
        ).filter(
            UserAddress.user_id == user_id,
            UserAddress.deleted_at == None
        ).all()