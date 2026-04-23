from sqlalchemy.orm import Session
from app.data.base_data import BaseData
from app.models.budget import Budget


class BudgetData(BaseData[Budget]):
    def __init__(self, db: Session):
        super().__init__(db, Budget)

    def get_budgets_by_user(self, user_id: int):
        return self.db.query(Budget).filter(
            Budget.user_id == user_id,
            Budget.deleted_at == None
        ).all()

    def get_budget(self, user_id: int, , category: str, month: int, year: int):
        return self.db.query(Budget).filter(
            Budget.user_id == user_id,
            Budget.category == category,
            Budget.month == month,
            Budget.year == year,
            Budget.deleted_at == None
        ).first()