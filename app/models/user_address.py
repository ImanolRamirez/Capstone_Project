from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from app.models.base_model import BaseModel


class UserAddress(BaseModel):
    __tablename__ = "user_address"

    user_id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    address_id = Column(Integer, ForeignKey('addresses.id'), primary_key=True)

    address_type = Column(String(100), nullable=False, default='Primary')
    is_default = Column(Boolean, default=False)