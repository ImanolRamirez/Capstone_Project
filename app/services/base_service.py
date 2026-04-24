from typing import TypeVar, Generic
from sqlalchemy.orm import Session
from app.data.base_data import BaseData
from app.models.base_model import BaseModel

T = TypeVar("T", bound=BaseModel)
D = TypeVar("D", bound=BaseData)

class BaseService(Generic[T, D]):
    def __init__(self, db: Session, data: D, model_name: str):
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

    def create(self, model: T, commit: bool = False):
        self.db.add(model)
        if commit:
            self.db.commit()
            self.db.refresh(model)
        else:
            self.db.flush()
        return model


    def remove(self, id: int, commit: bool = False):
        model = self.get_by_id(id)
        self.data.delete(model)
        if commit:
            self.db.commit()
        else:
            self.db.flush()
        return True

    def update(self, id: int, commit: bool = False, **kwargs):
        model = self.get_by_id(id)

        for key, value in kwargs.items():
            if hasattr(model, key):
                setattr(model, key, value)

        if commit:
            self.db.commit()
            self.db.refresh(model)
        else:
            self.db.flush()
        return model

