from datetime import date

import pytest
from sqlalchemy import select

from src.vencimiento_personal.models import VencimientoPersonal
from src.vencimiento_personal import services, schemas, exceptions
from src.vencimiento_personal.constants import ErrorCode


def _vencimientos_actuales(db_session, persona_id, tipo_vencimiento_id):
    return db_session.scalars(
        select(VencimientoPersonal).where(
            VencimientoPersonal.persona_id == persona_id,
            VencimientoPersonal.tipo_vencimiento_id == tipo_vencimiento_id,
            VencimientoPersonal.es_actual == True,
        )
    ).all()


def test_crear_vencimiento_duplicado(db_session, persona, tipo_vencimiento):
    datos = schemas.VencimientoPersonalCreate(
        persona_id=persona.id,
        tipo_vencimiento_id=tipo_vencimiento.id,
        fecha_desde=date(2026, 1, 1),
        fecha_hasta=date(2026, 6, 1),
    )
    services.crear_vencimiento(db_session, datos)

    with pytest.raises(exceptions.VencimientoDuplicado) as exc_info:
        services.crear_vencimiento(db_session, datos)
    assert exc_info.value.detail == ErrorCode.VENCIMIENTO_DUPLICADO

    # el duplicado rechazado no debe alterar el invariante
    actuales = _vencimientos_actuales(db_session, persona.id, tipo_vencimiento.id)
    assert len(actuales) == 1


def test_renovar_vencimiento_inexistente(db_session):
    datos = schemas.VencimientoPersonalUpdate(fecha_desde=date(2026, 1, 1), fecha_hasta=date(2026, 6, 1))
    with pytest.raises(exceptions.VencimientoNoEncontrado) as exc_info:
        services.renovar_vencimiento(db_session, 9999, datos)
    assert exc_info.value.detail == ErrorCode.VENCIMIENTO_NO_ENCONTRADO
