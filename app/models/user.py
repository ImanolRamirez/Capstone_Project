from sqlalchemy import Column, Integer, String, DateTime
from app.database import Base
from app.utils.time import Time

class User(Base, Time):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)