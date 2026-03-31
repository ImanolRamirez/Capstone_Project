from sqlalchemy.orm import Session

from data.address_data import AddressData
from models.address import Address
from models.user_address import UserAddress
from services.base_service import BaseService


class AddressService(BaseService[Address, AddressData]):
    def __init__(self, db: Session):
        super().__init__(db, AddressData(db), "Address")


    def add_address(self, user_id: int, address_data: dict, address_type: str = "Primary"):

        try:
            existing_address = self.data.get_by_address(
                address_data.get("address_line1"),
                address_data.get("zipcode")
            )

            if existing_address:
                address = existing_address
            else:
                address = Address(**address_data)
                self.create(address, commit=False)
                self.db.flush()

            link = self.db.query(UserAddress).filter(
                UserAddress.user_id == user_id,
                UserAddress.address_type == address_type
            ).first()

            if link:
                link.address_id = address.id
            else:
                new_link = UserAddress(
                    user_id=user_id,
                    address_id=address.id,
                    address_type=address_type
                )
                self.db.add(new_link)

            self.db.commit()
            return address
        except Exception as e:
            self.db.rollback()
            raise e
