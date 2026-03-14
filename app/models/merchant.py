from sqlalchemy import Column, Integer, String
from app.models.base_model import BaseModel

class Merchant(BaseModel):
    __tablename__ = "merchants"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    default_category = Column(String(100), nullable=True)