import pytest

from src.receta.models import Receta
from src.etapa_receta.models import EtapaReceta
from src.paso_etapa.models import PasoEtapa


@pytest.fixture
def receta(db_session, unico_producto):
    # Receta con una etapa de dos pasos
    _receta = Receta(
        producto_id=unico_producto.id,
        etapas=[
            EtapaReceta(
                nombre="Preparación",
                orden=1,
                pasos=[
                    PasoEtapa(descripcion="Cortar el salame en rodajas.", orden=1),
                    PasoEtapa(descripcion="Abrir el pan al medio.", orden=2),
                ],
            ),
        ],
    )
    db_session.add(_receta)
    db_session.commit()
    db_session.refresh(_receta)
    return _receta
