import pytest
from src.lote_produccion import services as lote_services
from src.supervision_lote import exceptions, schemas, services
from src.supervision_lote.constants import EstadoSupervisionOcurrencia


def test_generar_checklist_al_crear_lote_service(db_session, multiples_supervisiones_ocurrencia):
    assert len(multiples_supervisiones_ocurrencia) == 2
    assert multiples_supervisiones_ocurrencia[0].etapa_nombre_snap == "Amasado"
    assert (
        multiples_supervisiones_ocurrencia[0].paso_descripcion_snap
        == "Mezclar harina y agua durante 15 minutos"
    )
    assert multiples_supervisiones_ocurrencia[0].estado == EstadoSupervisionOcurrencia.PENDIENTE


def test_bloqueo_avance_sin_checklist_y_generacion_empaquetado_service(db_session, unico_lote_con_supervision, multiples_supervisiones_ocurrencia, persona_supervisor):
    with pytest.raises(exceptions.ChecklistSupervisionIncompleto):
        lote_services.cambiar_estado_lote_produccion(
            db=db_session,
            lote_id=unico_lote_con_supervision.id,
            usuario_id=persona_supervisor.id,
        )

    for item in multiples_supervisiones_ocurrencia:
        services.completar_supervision_ocurrencia(
            db=db_session,
            ocurrencia_id=item.id,
            datos=schemas.SupervisionOcurrenciaCompletar(observacion="Paso verificado"),
            supervisor=persona_supervisor,
        )

    lote_empaquetando = lote_services.cambiar_estado_lote_produccion(db=db_session, lote_id=unico_lote_con_supervision.id, usuario_id=persona_supervisor.id)

    assert lote_empaquetando.estado == "Empaquetando"

    ocurrencias_empaquetado = services.listar_checklist_activo(db=db_session, lote_id=unico_lote_con_supervision.id)

    assert len(ocurrencias_empaquetado) == 4
    assert ocurrencias_empaquetado[0].etapa_nombre_snap == "Control de Empaquetado y Rotulado"

    with pytest.raises(exceptions.ChecklistSupervisionIncompleto):
        lote_services.cambiar_estado_lote_produccion(
            db=db_session,
            lote_id=unico_lote_con_supervision.id,
            usuario_id=persona_supervisor.id,
        )

    for item in ocurrencias_empaquetado:
        services.completar_supervision_ocurrencia(db=db_session, ocurrencia_id=item.id, datos=schemas.SupervisionOcurrenciaCompletar(observacion="Empaque OK"), supervisor=persona_supervisor)

    lote_terminado = lote_services.cambiar_estado_lote_produccion(db=db_session, lote_id=unico_lote_con_supervision.id, usuario_id=persona_supervisor.id)
    
    assert lote_terminado.estado == "Terminado"


def test_edicion_supervision_por_mismo_y_bloqueo_otro_supervisor_service(db_session, multiples_supervisiones_ocurrencia, persona_supervisor, otro_supervisor):
    primera = multiples_supervisiones_ocurrencia[0]

    completada = services.completar_supervision_ocurrencia(
        db=db_session,
        ocurrencia_id=primera.id,
        datos=schemas.SupervisionOcurrenciaCompletar(observacion="Observacion inicial"),
        supervisor=persona_supervisor,
    )
    assert completada.fue_editada is False

    editada = services.completar_supervision_ocurrencia(
        db=db_session,
        ocurrencia_id=primera.id,
        datos=schemas.SupervisionOcurrenciaCompletar(observacion="Observacion corregida"),
        supervisor=persona_supervisor,
    )
    assert editada.fue_editada is True
    assert editada.observacion == "Observacion corregida"

    with pytest.raises(exceptions.SupervisionCompletadaPorOtro):
        services.completar_supervision_ocurrencia(
            db=db_session,
            ocurrencia_id=primera.id,
            datos=schemas.SupervisionOcurrenciaCompletar(observacion="Intento de otro"),
            supervisor=otro_supervisor,
        )


def test_no_permite_completar_paso_siguiente_si_hay_previo_pendiente(
    db_session, multiples_supervisiones_ocurrencia, persona_supervisor
):
    segunda = multiples_supervisiones_ocurrencia[1]
    with pytest.raises(exceptions.PasoSupervisionPrevioIncompleto):
        services.completar_supervision_ocurrencia(
            db=db_session,
            ocurrencia_id=segunda.id,
            datos=schemas.SupervisionOcurrenciaCompletar(observacion="Salteando paso"),
            supervisor=persona_supervisor,
        )
