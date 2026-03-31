from database import Base
from utils.time import Time

class BaseModel(Base, Time):
    __abstract__ = True

    def __repr__(self):

        class_name = self.__class__.__name__

        try:
            columns = {
                c.name: getattr(self, c.name)
                for c in self.__table__.columns.values()
                if "password" not in c.name and "hash" not in c.name
            }
        except Exception:

            columns = {
                key: value for key, value in self.__dict__.items()
                if not key.startswith("_") and "password" not in key and "hash" not in key
            }

        params = ", ".join(f"{key}={value}" for key, value in columns.items())
        return f"{class_name}({params})"