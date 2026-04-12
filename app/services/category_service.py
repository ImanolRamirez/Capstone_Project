from sqlalchemy.orm import Session
from app.data.category_data import CategoryData
from app.models.category import Category
from app.services.base_service import BaseService


class CategoryService(BaseService[Category, CategoryData]):
    def __init__(self, db: Session):
        super().__init__(db, CategoryData(db), "Category")

    def create_category(self, name: str, type: str):

        existing_category = self.data.get_by_name(name)
        if existing_category:
            return existing_category

        category = Category(name=name, type=type)
        return self.create(category)