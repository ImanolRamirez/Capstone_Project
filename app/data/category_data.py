from sqlalchemy.orm import Session
from app.data.base_data import BaseData
from app.models.category import Category


class CategoryData(BaseData[Category]):
    def __init__(self, db: Session):
        super().__init__(db, Category)