"""Added user profile fields.

Revision ID: d1e2f3a4b5c6
Revises: cc4607c8d12c
Create Date: 2026-04-28 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'd1e2f3a4b5c6'
down_revision: Union[str, Sequence[str], None] = 'cc4607c8d12c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('security_question', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('security_answer', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('language', sa.String(length=50), nullable=False, server_default='English'))


def downgrade() -> None:
    op.drop_column('users', 'language')
    op.drop_column('users', 'security_answer')
    op.drop_column('users', 'security_question')
