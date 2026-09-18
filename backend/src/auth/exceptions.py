from src.auth.constants import ErrorCode
from src.exceptions import BadRequest, NotAuthenticated, PermissionDenied


class IncorrectUserOrPassword(BadRequest):
    DETAIL = ErrorCode.INCORRECT_USER_OR_PASSWORD


class InvalidCredentials(NotAuthenticated):
    DETAIL = ErrorCode.AUTHENTICATION_REQUIRED


class RefreshTokenNotValid(NotAuthenticated):
    DETAIL = ErrorCode.REFRESH_TOKEN_NOT_VALID


class InvalidPasswordUpdateToken(NotAuthenticated):
    DETAIL = ErrorCode.INVALID_PASSWORD_TOKEN


class InvalidEmailCredentials(NotAuthenticated):
    DETAIL = ErrorCode.EMAIL_AUTHENTICATION_REQUIRED


class UserNotFound(NotAuthenticated):
    DETAIL = "El usuario no fue encontrado"
