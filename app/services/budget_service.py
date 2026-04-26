from sqlalchemy.orm import Session
from app.data.budget_data import BudgetData
from app.models.budget import Budget
from app.services.base_service import BaseService


class BudgetService(BaseService[Budget, BudgetData]):
    def __init__(self, db: Session):
        super().__init__(db, BudgetData(db), "Budget")

    def create_budget(self, user_id: int, category_id: int, amount: float, month: int, year: int, **kwargs):
        existing_budget = self.data.get_budget(user_id, category_id, month, year)

        if existing_budget:
            raise ValueError(f"A budget for this category already exists in {month}/{year}.")

        new_budget = Budget(
            user_id=user_id,
            category_id=category_id,
            amount=amount,
            month=month,
            year=year,
            **kwargs
        )

        return self.create(new_budget)

    def get_user_budgets(self, user_id: int):
        return self.data.get_budgets_by_user(user_id)