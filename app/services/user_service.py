from sqlalchemy.orm import Session
from app.models.user import User
from app.utils.security import hash_password, verify_password
from app.data.user_data import UserData

class UserService:
    def __init__(self, db: Session):
        self.user_data = UserData(db)


    def create_user(self, username: str, email: str, password: str) -> User:
        existing_user = self.user_data.get_user_by_email(email)
        if existing_user:
            raise ValueError("User email already exists")

        hashed = hash_password(password)
        user = User(username=username, email=email, password_hash=hashed)
        self.user_data.db.create_user(user)
        self.user_data.db.commit()
        self.user_data.db.refresh(user)
        return user

    def read_user_id(self, user_id: int):
        return self.user_data.read_user(user_id)

    def read_user_email(self, email: str):
        return self.user_data.read_user_email(email)

    def update_user_email(self, user_id: int, new_email: str):
        user = self.user_data.read_user(user_id)

        if user:
            user.email = new_email
            self.user_data.update(user)
            self.user_data.db.commit()
            self.user_data.db.refresh(user)
            return user
        else:
            raise ValueError("User not found")

    def update_user_password(self, user_id: int, new_password: str):
        user = self.user_data.read_user(user_id)

        if user:
            user.password_hash = hash_password(new_password)
            self.user_data.update(user)
            self.user_data.db.commit()
            self.user_data.db.refresh(user)
            return user
        else:
            raise ValueError("User not found")

    def delete_user(self, user_id: int) -> bool:
        user = self.user_data.read_user(user_id)

        if user:
            self.user_data.delete(user)
            self.user_data.db.commit()
            return True
        else:
            raise ValueError("User not found")

    def verify_user(self, email: str, password: str) -> User:
        user = self.user_data.read_user_email(email)

        if user and verify_password(password, user.password_hash):
            return user
        else:
            raise ValueError("Invalid email or password")



