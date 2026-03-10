from sqlalchemy import Column, Integer, String
from app.database import Base
from app.utils.time import Time

class Lender(Base, Time):
    __tablename__ = "lenders"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)