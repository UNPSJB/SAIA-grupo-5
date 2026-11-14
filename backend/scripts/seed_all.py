"""
Corre todos los scripts de seed en orden de dependencias.
Uso: python -m scripts.seed_all

Antes de sembrar crea las tablas que falten y aplica las migraciones de
esquema (los mismos pasos que hace el lifespan de la app), así funciona
también contra una base vacía sin haber levantado el backend.
"""
import src.all_models  # noqa: F401
from src.database import engine
from src.models import ModeloBase
from src.incidentes.migrations import migrar_esquema_incidentes
from src.lote_produccion.migrations import migrar_esquema_lote_produccion
from src.insumos.migrations import migrar_esquema_insumos
from src.receta.migrations import migrar_esquema_recetas

from scripts import (
    # Catálogos base
    seed_unidad_medida,
    seed_insumos,
    seed_personal,
    seed_productos,
    seed_aditivos,
    seed_recetas,
    # Limpieza / instalaciones
    seed_planes_limpieza,
    seed_sectores,
    seed_superficies,
    seed_equipos,
    seed_tareas,
    seed_elementos_limpieza,
    # Gestión
    seed_incidentes,
    seed_vencimientoPersonal,
    seed_planCalibracion,
    seed_documentos,
    # Abastecimiento: proveedor -> pedido -> lote de proveedor (InsumoLote)
    seed_proveedores,
    seed_pedidos_proveedor,
    seed_lotes_proveedor,
    # Producción y distribución: lote de producción (consume InsumoLote) -> envío
    seed_lote_produccion,
    seed_clientes,
    seed_envios,
)

ORDEN = [
    seed_unidad_medida,
    seed_insumos,
    seed_personal,
    seed_productos,
    seed_aditivos,
    seed_recetas,
    seed_planes_limpieza,
    seed_sectores,
    seed_superficies,
    seed_equipos,
    seed_tareas,
    seed_elementos_limpieza,
    seed_incidentes,
    seed_vencimientoPersonal,
    seed_planCalibracion,
    seed_documentos,
    seed_proveedores,
    seed_pedidos_proveedor,
    seed_lotes_proveedor,
    seed_lote_produccion,
    seed_clientes,
    seed_envios,
]


def preparar_esquema():
    ModeloBase.metadata.create_all(bind=engine)
    migrar_esquema_incidentes(engine)
    migrar_esquema_lote_produccion(engine)
    migrar_esquema_insumos(engine)
    migrar_esquema_recetas(engine)


def main():
    preparar_esquema()
    for modulo in ORDEN:
        nombre = modulo.__name__.split(".")[-1]
        print(f"=== {nombre} ===")
        modulo.main()


if __name__ == "__main__":
    main()
