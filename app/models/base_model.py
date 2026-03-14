from app.database import Base
from app.utils.time import Time

class BaseModel(Base, Time):
    __abstract__ = True