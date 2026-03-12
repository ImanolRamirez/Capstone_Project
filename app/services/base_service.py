from typing import TypeVar, Generic
from sqlalchemy.orm import Session
from app.data.base_data import BaseData

T = TypeVar("T")

class BaseService(Generic[T]):
    def __init__(self, db: Session, data: BaseData[T], model_name: str):
        self.db = db
        self.data = data
        self.model_name = model_name

    def get_all(self):
        return self.data.get_all()

    def get_by_id(self, id: int):
        model = self.data.get_by_id(id)
        if not model:
            raise ValueError(f"{self.model_name} not found")
        return model

    def create(self, model: T):
        self.data.create(model)
        self.db.commit()
        self.db.refresh(model)
        return model


    def remove(self, id: int):
        model = self.get_by_id(id)
        self.data.delete(model)
        self.db.commit()
        return True

    def update(self, id: int, **kwargs):
        model = self.get_by_id(id)

        for key, value in kwargs.items():
            if hasattr(model, key):
                setattr(model, key, value)

        self.db.commit()
        self.db.refresh(model)
        return model

