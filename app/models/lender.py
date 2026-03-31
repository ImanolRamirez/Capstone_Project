from sqlalchemy import Column, Integer, String
from models.base_model import BaseModel


class Lender(BaseModel):
    __tablename__ = "lenders"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)