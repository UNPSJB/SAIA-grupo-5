# Valores válidos de HistorialIncidente.tipo_evento (columna String simple,
# no Enum a nivel DB -- ver models.py).
class TipoEvento:
    CREADO = "CREADO"
    CERRADO = "CERRADO"
    REABIERTO = "REABIERTO"
