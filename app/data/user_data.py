from sqlalchemy.orm import Session
from app.data.base_data import BaseData
from app.models.user import User

class UserData(BaseData[User]):

    def __init__(self, db: Session):
        super().__init__(db, User)

    def read_user_email(self, email: str):
        return self.db.query(User).filter(
            User.email == email,
            User.deleted_at == None
        ).first()



