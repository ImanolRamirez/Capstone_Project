from app.models.user import User
from app.data.user_data import UserData

def test_create_user(db_session):
    user_data = UserData(db_session)

    user = User(
        username="testuser1",
        first_name="Test",
        last_name="User",
        email="test1@test.com",
        password_hash="testpassword"
    )

    user_data.create(user)
    db_session.commit()

    get_user = user_data.read_user_email("test1@test.com")

    assert get_user is not None
    assert get_user.username == "testuser1"
    assert get_user.first_name == "Test"
    assert get_user.last_name == "User"
    assert get_user.email == "test1@test.com"
    assert get_user.password_hash == "testpassword"
    assert get_user.id is not None
    assert get_user.created_at is not None
    assert get_user.updated_at is not None
    assert get_user.deleted_at is None

def test_delete_user(db_session):
    user_data = UserData(db_session)

    user = User(
        username="testuser2",
        first_name="Test",
        last_name="User",
        email="test2@test.com",
        password_hash="testpassword"
    )

    user_data.create(user)
    db_session.commit()

    user_data.delete(user)
    db_session.commit()

    get_user = user_data.read_user_email("test2@test.com")

    assert get_user is None
    assert user.deleted_at is not None