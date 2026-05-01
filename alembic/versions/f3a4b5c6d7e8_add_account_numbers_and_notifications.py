"""Add account numbers, savings goal, and notification preferences.

Revision ID: f3a4b5c6d7e8
Revises: e2f3a4b5c6d7
Create Date: 2026-04-30 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'f3a4b5c6d7e8'
down_revision: Union[str, Sequence[str], None] = 'e2f3a4b5c6d7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Account: routing/account numbers and savings goal
    op.add_column('accounts', sa.Column('routing_number', sa.String(length=20), nullable=True))
    op.add_column('accounts', sa.Column('account_number', sa.String(length=20), nullable=True))
    op.add_column('accounts', sa.Column('savings_goal_label', sa.String(length=100), nullable=True))
    op.add_column('accounts', sa.Column('savings_goal_amount', sa.Numeric(10, 2), nullable=True))

    # User: notification preferences
    op.add_column('users', sa.Column('notif_email_transactions', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('users', sa.Column('notif_email_security', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('users', sa.Column('notif_email_promotions', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('users', sa.Column('notif_push_transactions', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('users', sa.Column('notif_push_security', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('users', sa.Column('notif_push_promotions', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('users', sa.Column('notif_sms_transactions', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('users', sa.Column('notif_sms_security', sa.Boolean(), nullable=False, server_default='true'))


def downgrade() -> None:
    op.drop_column('users', 'notif_sms_security')
    op.drop_column('users', 'notif_sms_transactions')
    op.drop_column('users', 'notif_push_promotions')
    op.drop_column('users', 'notif_push_security')
    op.drop_column('users', 'notif_push_transactions')
    op.drop_column('users', 'notif_email_promotions')
    op.drop_column('users', 'notif_email_security')
    op.drop_column('users', 'notif_email_transactions')
    op.drop_column('accounts', 'savings_goal_amount')
    op.drop_column('accounts', 'savings_goal_label')
    op.drop_column('accounts', 'account_number')
    op.drop_column('accounts', 'routing_number')
