from sqlalchemy.orm import Session
from app.models.user import User
from app.services.base_service import BaseService
from app.utils.security import hash_password, verify_password
from app.data.user_data import UserData

class UserService(BaseService[User]):
    def __init__(self, db: Session):
        super().__init__(db, UserData(db), "User")


    def create_user(self, username: str, email: str, password: str) -> User:
        existing_user = self.read_user_email(email)
        if existing_user:
            if existing_user.deleted_at is not None:
                raise ValueError("User account was previously deleted")
            else:
                raise ValueError("User email already exists")

        hashed = hash_password(password)
        user = User(username=username, email=email, password_hash=hashed)
        return self.create(user)

    def update_user_email(self, user_id: int, new_email: str):

        email_exists = self.db.query(User).filter(User.email == new_email).first()
        if email_exists:
            raise ValueError("Email already used by another user.")

        return self.update(user_id, email=new_email)

    def update_user_password(self, user_id: int, new_password: str):
        return self.update(user_id, password=hash_password(new_password))

    def verify_user(self, email: str, password: str):
        user = self.data.read_user_email(email)

        if user and verify_password(password, user.password_hash):
            return user
        else:
            raise ValueError("Invalid email or password")



