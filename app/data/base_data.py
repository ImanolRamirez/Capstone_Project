from typing import TypeVar, Generic, Type

from sqlalchemy import func
from sqlalchemy.orm import Session
from models.base_model import BaseModel

T = TypeVar('T', bound=BaseModel)

class BaseData(Generic[T]):
    def __init__(self, db: Session, model: Type[T]):
        self.db = db
        self.model = model

    def get_all(self):
        return self.db.query(self.model).filter(
            self.model.deleted_at == None
        ).all()

    def get_by_id(self, id: int):
        return self.db.query(self.model).filter(
            self.model.id == id,
            self.model.deleted_at == None
        ).first()

    def get_by_name(self, name: str):
        return self.db.query(self.model).filter(
            func.lower(self.model.name) == name.lower(),
            self.model.deleted_at == None
        ).first()

    def create(self, obj: T):
        self.db.add(obj)
        return obj

    def delete(self, obj: T):
        obj.deleted_at = func.now()
        return obj

    def restore(self, obj: T):
        obj.deleted_at = None
        return obj