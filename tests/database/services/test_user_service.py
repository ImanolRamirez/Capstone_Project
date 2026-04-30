import pytest
from app.services.user_service import UserService

def test_create_user_hash_password(db_session):
    user_service = UserService(db_session)

    user = user_service.create_user(
        username="serviceuser",
        first_name="Service",
        last_name="User",
        email="services@test.com",
        password="testpassword123!"
    )

    db_session.commit()

    assert user.id is not None
    assert user.username == "serviceuser"
    assert user.password_hash != "testpassword123!"


def test_create_user_existing_email(db_session):
    user_service = UserService(db_session)

    user_service.create_user(
        username="first_user",
        first_name="First",
        last_name="User",
        email="existing@test.com",
        password="testpassword123!"
    )

    with pytest.raises(ValueError, match="User email already exists"):
        user_service.create_user(
            username="second_user",
            first_name="Second",
            last_name="User",
            email="existing@test.com",
            password="testpassword123!"
        )

def test_verify_user(db_session):
    user_service = UserService(db_session)

    user_service.create_user(
        username="verifyuser",
        first_name="Verify",
        last_name="User",
        email="verify@test.com",
        password="testpassword123!"
    )

    db_session.commit()

    verified_user = user_service.verify_user("verify@test.com", "testpassword123!")

    assert verified_user is not None
    assert verified_user.username == "verifyuser"
    assert verified_user.email == "verify@test.com"

    with pytest.raises(ValueError, match="Invalid email or password"):
        user_service.verify_user("verify@test.com", "wrongpassword123!")

    with pytest.raises(ValueError, match="Invalid email or password"):
        user_service.verify_user("wrong@test.com", "testpassword123!")


@pytest.mark.parametrize(
    "username, first_name, last_name, email, password, expected",
    [
        ("nosymbol", "No", "Symbol", "symbol@example.com", "password123", False),
        ("nonumber", "No", "Number", "number@example.com", "SecurePassword!", False),
        ("tooshort", "Too", "Short", "short@example.com",  "1!aB", False),
        ("simplepass", "Simple", "Pass", "simple@example.com", "SecurePass123!", True),
        ("longpass", "Long", "Pass", "long@example.com", "v3ryL0ngP@ssw0rd!+", True),
    ]
)

def test_user_passwords(db_session, username, first_name, last_name, email, password, expected):

    user_service = UserService(db_session)

    if expected:
        user = user_service.create_user(
            username=username,
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=password
        )

        assert user is not None
        assert user.username == username
        assert user.email == email

    else:
        with pytest.raises(ValueError, match="Password must be at least 8 characters and contain a number and a symbol."):
            user_service.create_user(
                username=username,
                first_name=first_name,
                last_name=last_name,
                email=email,
                password=password
            )
