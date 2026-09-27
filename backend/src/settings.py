import os
from dotenv import load_dotenv
from typing import Dict, Any

load_dotenv()

ENV = os.getenv("ENV", "DEV")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
SECRET_KEY = os.getenv("SECRET_KEY", "saia-dev-secret-key")
REFRESH_SECRET_KEY = os.getenv("REFRESH_SECRET_KEY", "saia-dev-refresh-secret-key")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
TOKEN_URL = os.getenv("TOKEN_URL", "auth/token")
DB_URL = os.getenv("DB_URL", "sqlite:///./saia.db")
DB_URL_TEST = os.getenv("DB_URL_TEST", "sqlite:///./saia_test.db")
ROOT_PATH = os.getenv("ROOT_PATH", "")
MAIN_SITE_DOMAIN = os.getenv(f"MAIN_SITE_DOMAIN_{ENV}", "http://localhost:5173")
API_SITE_DOMAIN = os.getenv(f"API_SITE_DOMAIN_{ENV}", "")
SECURE_COOKIES = os.getenv("SECURE_COOKIES", "false").lower() in ("true", "1", "yes")
REFRESH_TOKEN_COOKIE_NAME = os.getenv("REFRESH_TOKEN_COOKIE_NAME", "refresh_token")
ACCESS_TOKEN_COOKIE_NAME = os.getenv("ACCESS_TOKEN_COOKIE_NAME", "access_token")

def get_base_cookie_config(key: str) -> Dict[str, Any]:
    cookie_config: Dict[str, Any] = {
        "key": key,
        "httponly": True,
        "samesite": "lax",
        "secure": SECURE_COOKIES,
        "path": "/"
    }
    if API_SITE_DOMAIN:
        cookie_config["domain"] = API_SITE_DOMAIN
    return cookie_config

def get_token_settings(key: str, token: str, max_age: int) -> Dict[str, Any]:
    base_cookie = get_base_cookie_config(key)
    return {
        **base_cookie,
        "value": token,
        "max_age": max_age,
    }

def get_refresh_token_settings(refresh_token: str) -> Dict[str, Any]:
    return get_token_settings(
        REFRESH_TOKEN_COOKIE_NAME,
        refresh_token,
        REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )

def get_delete_token_settings() -> Dict[str, Any]:
    return get_base_cookie_config(REFRESH_TOKEN_COOKIE_NAME)
