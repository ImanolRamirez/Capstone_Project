from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, DateTime, func
from sqlalchemy.orm import relationship
from app.models.base_model import BaseModel


class Transaction(BaseModel):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)

    amount = Column(Numeric(10, 2), nullable=False)
    description = Column(String(255))
    transaction_date = Column(DateTime, server_default=func.now())

    account = relationship("Account", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")

    merchant_id = Column(Integer, ForeignKey("merchants.id"), nullable=True, index=True)
    merchant = relationship("Merchant", back_populates="transactions")