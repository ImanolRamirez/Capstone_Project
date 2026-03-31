from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, Boolean
from sqlalchemy.orm import relationship
from models.base_model import BaseModel

class Account(BaseModel):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    lender_id = Column(Integer, ForeignKey('lenders.id'), nullable=True)

    account_name = Column(String(100), nullable=False)
    account_type = Column(String(50), nullable=False)

    balance = Column(Numeric(10, 2), default=0.00)
    interest_rate = Column(Numeric(5, 2), default=0.00)

    user = relationship("User", back_populates="accounts")
    lender = relationship("Lender")
    transactions = relationship("Transaction", back_populates="account")