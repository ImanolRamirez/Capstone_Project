from sqlalchemy import Column, Integer, String
from app.database import Base
from app.utils.time import Time

class Merchant(Base, Time):
    __tablename__ = "merchants"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    default_category = Column(String(100), nullable=True)