from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base_model import BaseModel


class Category(BaseModel):
    __tablename__ = 'categories'

    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False, unique=True)
    type = Column(String(50), nullable=False)

    transactions = relationship("Transaction", back_populates="category")