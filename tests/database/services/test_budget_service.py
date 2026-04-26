import pytest
from decimal import Decimal
from app.models.user import User
from app.models.category import Category
from app.services.budget_service import BudgetService

def test_duplicate_budgets(db_session):

    user = User(
        username="budgetuser",
        first_name="Budget",
        last_name="User",
        email="budget@test.com",
        password_hash="testpassword"
    )

    category = Category(name="Food", type="Expense")
    db_session.add(user)
    db_session.add(category)
    db_session.flush()

    budget_service = BudgetService(db_session)

    budget_service.create_budget(
        user_id=user.id,
        category_id=category.id,
        amount=100.00,
        month=5,
        year=2026
    )
    db_session.commit()

    with pytest.raises(ValueError, match="A budget for this category already exists in 5/2026."):
        budget_service.create_budget(
            user_id=user.id,
            category_id=category.id,
            amount=200.00,
            month=5,
            year=2026
        )