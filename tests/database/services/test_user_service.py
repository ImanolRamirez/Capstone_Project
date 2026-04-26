import pytest
from app.services.user_service import UserService

def test_create_user_hash_password(db_session):
    user_service = UserService(db_session)

    user = user_service.create_user(
        username="serviceuser",
        first_name="Service",
        last_name="User",
        email="services@test.com",
        password="testpassword"
    )

    db_session.commit()

    assert user.id is not None
    assert user.username == "serviceuser"
    assert user.password_hash != "testpassword"


def test_create_user_existing_email(db_session):
    user_service = UserService(db_session)

    user_service.create_user(
        username="first_user",
        first_name="First",
        last_name="User",
        email="existing@test.com",
        password="testpassword"
    )

    with pytest.raises(ValueError, match="User email already exists"):
        user_service.create_user(
            username="second_user",
            first_name="Second",
            last_name="User",
            email="existing@test.com",
            password="testpassword"
        )

def test_verify_user(db_session):
    user_service = UserService(db_session)

    user_service.create_user(
        username="verifyuser",
        first_name="Verify",
        last_name="User",
        email="verify@test.com",
        password="testpassword"
    )

    db_session.commit()

    verified_user = user_service.verify_user("verify@test.com", "testpassword")

    assert verified_user is not None
    assert verified_user.username == "verifyuser"
    assert verified_user.email == "verify@test.com"

    with pytest.raises(ValueError, match="Invalid email or password"):
        user_service.verify_user("verify@test.com", "wrongpassword")

    with pytest.raises(ValueError, match="Invalid email or password"):
        user_service.verify_user("wrong@test.com", "testpassword")