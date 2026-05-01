from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship

from app.models.base_model import BaseModel

class User(BaseModel):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String(100), unique=True, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    security_question = Column(String(255), nullable=True)
    security_answer = Column(String(255), nullable=True)
    language = Column(String(50), nullable=False, default="English")

    notif_email_transactions = Column(Boolean, nullable=False, default=True)
    notif_email_security = Column(Boolean, nullable=False, default=True)
    notif_email_promotions = Column(Boolean, nullable=False, default=False)
    notif_push_transactions = Column(Boolean, nullable=False, default=True)
    notif_push_security = Column(Boolean, nullable=False, default=True)
    notif_push_promotions = Column(Boolean, nullable=False, default=False)
    notif_sms_transactions = Column(Boolean, nullable=False, default=False)
    notif_sms_security = Column(Boolean, nullable=False, default=True)

    accounts = relationship("Account", back_populates="user", cascade="all, delete-orphan")
    budgets = relationship("Budget", back_populates="user", cascade="all, delete-orphan")
