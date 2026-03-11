from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.user import User
from datetime import datetime, timezone

class UserData:

    def __init__(self, db: Session):
        self.db = db

    def create_user(self, user: User):
        self.db.add(user)
        return user

    def read_user(self, user_id: int):
        return self.db.query(User).filter(User.id == user_id,
                                           User.deleted_at == None).first()

    def read_user_email(self, email: str):
        return self.db.query(User).filter(User.email == email,
                                           User.deleted_at == None).first()

    def update_user(self, user: User):
        return user

    def delete_user(self, user: User):
        user.deleted_at = func.now()
        return user

    def restore_user(self, user: User):
        user.deleted_at = None
        return user



