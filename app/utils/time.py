from typing import Optional
from sqlalchemy import Column, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

class Time:
    create_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        default=func.now()
    )
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        default=func.now(),
        onupdate=func.now()
    )
    # Optional[] indicates it can be NULL
    deleted_at: Mapped[Optional[DateTime]] = mapped_column(DateTime(timezone=True), nullable=True)