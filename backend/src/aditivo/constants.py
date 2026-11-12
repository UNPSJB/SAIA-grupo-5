from enum import Enum


class ClaseFuncional(str, Enum):
    ACIDULANTE = "Acidulante"
    ANTIAGLUTINANTE = "Antiaglutinante"
    ANTIESPUMANTE = "Antiespumante"
    ANTIOXIDANTE = "Antioxidante"
    AROMATIZANTE = "Aromatizante"
    COLORANTE = "Colorante"
    CONSERVANTE = "Conservante"
    EDULCORANTE = "Edulcorante"
    EMULSIONANTE = "Emulsionante"
    ESPESANTE = "Espesante"
    ESTABILIZANTE = "Estabilizante"
    GELIFICANTE = "Gelificante"
    HUMECTANTE = "Humectante"
    LEUDANTE_QUIMICO = "Leudante químico"
    REGULADOR_DE_ACIDEZ = "Regulador de acidez"
    RESALTADOR_DE_SABOR = "Resaltador de sabor"


class ErrorCode:
    ADITIVO_NO_ENCONTRADO = "El aditivo no fue encontrado."
    ADITIVO_DUPLICADO = "Ya existe un aditivo con ese nombre."
    NUMERO_INS_DUPLICADO = "Ya existe un aditivo con ese número INS."
    NUMERO_INS_OBLIGATORIO = "El número INS es obligatorio, salvo para los aromatizantes."
