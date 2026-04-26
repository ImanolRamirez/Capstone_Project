from decimal import Decimal

import pytest

from app.models.account import Account
from app.models.category import Category
from app.models.user import User
from app.services.transaction_service import TransactionService

def test_create_transaction(db_session):

    user = User(
        username="transactionuser",
        first_name="Transaction",
        last_name="User",
        email="transaction@test.com",
        password_hash="testpassword"
    )

    db_session.add(user)
    db_session.flush()

    account = Account(
        user_id=user.id,
        account_name="Test Checking",
        account_type="Checking",
        balance=Decimal("1000.00")
    )

    db_session.add(account)

    category = Category(
        name="Test Category",
        type="Expense"
    )

    db_session.add(category)
    db_session.flush()

    transaction_service = TransactionService(db_session)

    transaction = transaction_service.create_transaction(
        account_id=account.id,
        category_id=category.id,
        description="Test Transaction",
        amount=-100.00
    )

    db_session.commit()

    assert transaction.id is not None
    assert transaction.amount == -100.00
    assert account.balance == Decimal("900.00")

def test_create_transaction_invalid_account(db_session):
    transaction_service = TransactionService(db_session)

    with pytest.raises(ValueError, match="Account does not exist"):
        transaction_service.create_transaction(
            account_id=9999,
            category_id=1,
            description="Test Transaction",
            amount=100.00
        )