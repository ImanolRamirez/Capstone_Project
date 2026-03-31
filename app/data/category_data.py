from sqlalchemy.orm import Session
from data.base_data import BaseData
from models.category import Category


class CategoryData(BaseData[Category]):
    def __init__(self, db: Session):
        super().__init__(db, Category)