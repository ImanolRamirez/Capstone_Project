from sqlalchemy import Column, Integer, String, Boolean
from models.base_model import BaseModel

class Address(BaseModel):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True)

    address_line1 = Column(String(255), nullable=False)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    zip_code = Column(String(20), nullable=False)
    country = Column(String(100), default="United States", nullable=False)

    is_primary = Column(Boolean, default=False)

