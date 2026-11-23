import enum


class ErrorCode:
    SUPERVISION_OCURRENCIA_NO_ENCONTRADA = "La ocurrencia de supervision no fue encontrada."
    SUPERVISION_OCURRENCIA_DATOS_INVALIDOS = "Los datos de la ocurrencia de supervision no son validos."
    SUPERVISION_COMPLETADA_POR_OTRO = "No puede editar este paso ya que fue marcado como completado por otro supervisor."
    CHECKLIST_SUPERVISION_INCOMPLETO = "No se puede avanzar el estado del lote porque aun quedan pasos del checklist de supervision pendientes."
    PRODUCTO_SIN_RECETA = "El producto seleccionado no posee una receta vigente para iniciar el lote de produccion."
    PASO_SUPERVISION_PREVIO_INCOMPLETO = "Debes completar los pasos anteriores antes de supervisar este paso."


class EstadoSupervisionOcurrencia(str, enum.Enum):
    PENDIENTE = "Pendiente"
    COMPLETADA = "Completada"
