from typing import Dict
from fastapi import Depends, APIRouter, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from src.database import get_db
from src.settings import get_delete_token_settings, get_refresh_token_settings
from src.auth import service, schemas, exceptions
from src.auth.utils import create_access_token, create_refresh_token
from src.auth.dependencies import get_refresh_persona, get_current_persona

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/token", response_model=schemas.Token)
async def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> schemas.Token:
    persona = service.authenticate_user(form_data.username, form_data.password, db)
    refresh_token_value = await create_refresh_token(db, persona.id)
    access_token = create_access_token(persona)
    response.set_cookie(**get_refresh_token_settings(refresh_token_value))

    return schemas.Token(access_token=access_token, user_id=persona.id)


@router.put("/token", response_model=schemas.Token)
async def refresh_tokens(
    response: Response,
    db: Session = Depends(get_db),
    persona=Depends(get_refresh_persona),
) -> schemas.Token:
    new_access_token = create_access_token(persona)
    new_refresh_token = await create_refresh_token(db, persona.id)
    response.set_cookie(**get_refresh_token_settings(new_refresh_token))

    return schemas.Token(access_token=new_access_token, user_id=persona.id)


@router.delete("/token")
async def logout_user(response: Response) -> Dict[str, str]:
    response.delete_cookie(**get_delete_token_settings())
    return {
        "msg": "La sesión se ha cerrado exitosamente!",
    }


@router.get("/validate-user", response_model=schemas.Token)
async def validate_user(
    auth_persona=Depends(get_current_persona),
) -> schemas.Token:
    if auth_persona:
        access_token = create_access_token(auth_persona)
        return schemas.Token(access_token=access_token, user_id=auth_persona.id)
    raise exceptions.NotAuthenticated()
