from sqlalchemy.orm import Session
from app.data.category_data import CategoryData
from app.models.category import Category
from app.services.base_service import BaseService


class CategoryService(BaseService[Category]):
    def __init__(self, db: Session):
        super().__init__(db, CategoryData(db), "Category")
