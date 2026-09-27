from pydantic import BaseModel
from typing import Optional


class Token(BaseModel):
    access_token: str
    user_id: Optional[int] = None


class TokenData(BaseModel):
    username: Optional[str] = None
