from enum import Enum


class Capacidades(str, Enum):
    OPERAR = "operar"
    ADMINISTRAR = "administrar"


class ErrorCode:
    PERSONA_NO_ENCONTRADA = "La persona no fue encontrada."
    USERNAME_EXISTENTE = "El nombre de usuario ya está en uso."
    DNI_EXISTENTE = "El DNI ingresado ya está registrado."
    MAIL_EXISTENTE = "El correo electrónico ya está registrado."
    DEBE_TENER_CAPACIDAD = "Debe asignar al menos una capacidad (operar o administrar)."
