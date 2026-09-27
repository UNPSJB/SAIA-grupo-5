from datetime import datetime
from sqlalchemy import String
from sqlalchemy.orm import mapped_column, Mapped
from src.models import ModeloBase


class AuthPasswordRecoveryToken(ModeloBase):
    __tablename__ = "auth_password_recovery_tokens"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(1000))
    recovery_token: Mapped[str] = mapped_column(String(1000))
    expires_at: Mapped[datetime] = mapped_column()
