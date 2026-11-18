import pytest
from datetime import date

from src.insumos.models import Insumo
from src.producto.models import Producto
from src.receta.models import Receta, InsumoReceta
from src.unidad_medida.models import UnidadMedida


@pytest.fixture
def gramo(db_session):
    unidad = UnidadMedida(nombre="Gramo", activo=True)
    db_session.add(unidad)
    db_session.commit()
    db_session.refresh(unidad)
    return unidad


@pytest.fixture
def insumos_rotulado(db_session, gramo):
    datos = [
        ("Harina", 364, 0, 1, 0.2, 2, {}),
        ("Azúcar", 400, 100, 0, 0, 0, {"aporta_azucares": True}),
        ("Sal", 0, 0, 0, 0, 38758, {"aporta_sodio": True}),
        ("Sucralosa", 0, 0, 0, 0, 0, {"aporta_edulcorantes": True}),
        ("Café", 2, 0, 0, 0, 2, {"aporta_cafeina": True}),
    ]
    insumos = {
        nombre: Insumo(nombre=nombre, unidad_medida_id=gramo.id, activo=True, valor_energetico=kcal,
                       azucares_anadidos=azucares, grasas_totales=grasas, grasas_saturadas=saturadas, sodio=sodio, **marcas)
        for nombre, kcal, azucares, grasas, saturadas, sodio, marcas in datos
    }
    db_session.add_all(insumos.values())
    db_session.commit()
    for insumo in insumos.values():
        db_session.refresh(insumo)
    return insumos


@pytest.fixture
def producto_rotulado(db_session, gramo):
    producto = Producto(nombre="Galletitas", descripcion="Galletitas dulces", cantidad_neta=100,
                        unidad_medida_id=gramo.id, fecha_lanzamiento=date(2026, 10, 1), foto_producto=None)
    db_session.add(producto)
    db_session.commit()
    db_session.refresh(producto)
    return producto


@pytest.fixture
def con_receta(db_session, producto_rotulado, insumos_rotulado):
    def _con_receta(*items):
        receta = Receta(producto_id=producto_rotulado.id)
        for nombre, cantidad in items:
            receta.insumos.append(InsumoReceta(insumo=insumos_rotulado[nombre], cantidad=cantidad))
        db_session.add(receta)
        db_session.commit()
        db_session.refresh(receta)
        return receta
    return _con_receta
