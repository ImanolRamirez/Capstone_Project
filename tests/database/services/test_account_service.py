import pytest
from decimal import Decimal
from app.models.account import Account
from app.models.user import User
from app.services.account_service import AccountService

def test_account_data(db_session):

    first_user = User(
        username="first_user",
        first_name="First",
        last_name="User",
        email="first@test.com",
        password_hash="testpassword"
    )

    second_user = User(
        username="second_user",
        first_name="Second",
        last_name="User",
        email="second@test.com",
        password_hash="testpassword"
    )

    db_session.add_all([first_user, second_user])
    db_session.flush()

    account_1 = Account(
        user_id=first_user.id,
        account_name="First Account",
        account_type="Checking",
        balance=Decimal("1000.00")
    )

    account_2 = Account(
        user_id=second_user.id,
        account_name="Second Account",
        account_type="Checking",
        balance=Decimal("2000.00")
    )

    db_session.add_all([account_1, account_2])
    db_session.flush()

    account_service = AccountService(db_session)

    first_user_accounts = account_service.get_user_accounts(first_user.id)

    assert len(first_user_accounts) == 1
    assert first_user_accounts[0].account_name == "First Account"
    assert first_user_accounts[0].balance == Decimal("1000.00")
    assert first_user_accounts[0].user_id == first_user.id