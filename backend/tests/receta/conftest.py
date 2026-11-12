import pytest
from datetime import date

from src.insumos.models import Insumo
from src.producto.models import Producto
from src.unidad_medida.models import UnidadMedida


@pytest.fixture
def unidades_sellos(db_session):
    unidades = {nombre: UnidadMedida(nombre=nombre, activo=True) for nombre in ("Gramo", "Mililitro", "Unidad")}
    db_session.add_all(unidades.values())
    db_session.commit()
    for unidad in unidades.values():
        db_session.refresh(unidad)
    return unidades


@pytest.fixture
def insumos_sellos(db_session, unidades_sellos):
    datos = [
        ("Azúcar", "Gramo", 400, 100, 0, 0, 0, None, True),
        ("Harina", "Gramo", 364, 0, 1, 0.2, 2, None, True),
        ("Manteca", "Gramo", 717, 0, 81, 51, 11, None, True),
        ("Sal", "Gramo", 0, 0, 0, 0, 38758, None, True),
        ("Agua", "Mililitro", 0, 0, 0, 0, 0, None, True),
        ("Caldo", "Mililitro", 5, 0, 0, 0, 400, None, True),
        ("Huevo", "Unidad", 143, 0, 9.5, 3.1, 142, 50, True),
        ("Esencia", "Mililitro", None, None, None, None, None, None, True),
        ("Colorante", "Gramo", 0, 0, 0, 0, 0, None, False),
    ]
    insumos = {
        nombre: Insumo(
            nombre=nombre,
            unidad_medida_id=unidades_sellos[unidad].id,
            valor_energetico=kcal,
            azucares_anadidos=azucares,
            grasas_totales=grasas,
            grasas_saturadas=saturadas,
            sodio=sodio,
            peso_unidad=peso_unidad,
            activo=activo,
        )
        for nombre, unidad, kcal, azucares, grasas, saturadas, sodio, peso_unidad, activo in datos
    }
    db_session.add_all(insumos.values())
    db_session.commit()
    for insumo in insumos.values():
        db_session.refresh(insumo)
    return insumos


@pytest.fixture
def producto_solido(db_session, unidades_sellos):
    producto = Producto(nombre="Galletitas", descripcion="Galletitas dulces", cantidad_neta=100,
                        unidad_medida_id=unidades_sellos["Gramo"].id,
                        fecha_lanzamiento=date(2026, 10, 1), foto_producto=None)
    db_session.add(producto)
    db_session.commit()
    db_session.refresh(producto)
    return producto


@pytest.fixture
def producto_liquido(db_session, unidades_sellos):
    producto = Producto(nombre="Agua saborizada", descripcion="Agua saborizada", cantidad_neta=500,
                        unidad_medida_id=unidades_sellos["Mililitro"].id,
                        fecha_lanzamiento=date(2026, 10, 1), foto_producto=None)
    db_session.add(producto)
    db_session.commit()
    db_session.refresh(producto)
    return producto


@pytest.fixture
def producto_por_unidad(db_session, unidades_sellos):
    producto = Producto(nombre="Alfajor", descripcion="Alfajor relleno", cantidad_neta=1,
                        unidad_medida_id=unidades_sellos["Unidad"].id,
                        fecha_lanzamiento=date(2026, 10, 1), foto_producto=None)
    db_session.add(producto)
    db_session.commit()
    db_session.refresh(producto)
    return producto
