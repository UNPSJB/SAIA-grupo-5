from datetime import datetime, timedelta
from sqlalchemy import select

import src.all_models
from src.database import SessionLocal, engine
from src.models import ModeloBase
from src.insumos.migrations import migrar_esquema_insumos
from src.insumos.models import Insumo
from src.producto.models import Producto
from src.unidad_medida.models import UnidadMedida
from src.receta.models import Receta, InsumoReceta
from src.receta.migrations import migrar_esquema_recetas
from src.receta.constants import TipoRenglon
from src.aditivo.models import Aditivo
from src.receta import orden
from src.etapa_receta.services import construir_etapa
from src.paso_etapa.schemas import PasoEtapaAnidadoCreate
from scripts.seed_insumos import NOMBRES_INSUMOS, CAMPOS_NUTRICIONALES, informacion_nutricional
from scripts.seed_productos import generar_productos
from scripts.seed_aditivos import generar_aditivos


INSUMOS_ADICIONALES = {
    "Fermento láctico": ("Gramo", (350, 0, 2, 1.2, 800, None)),
    "Cuajo": ("Mililitro", (10, 0, 0, 0, 2000, None)),
    "Zanahoria": ("Kilogramo", (41, 0, 0.2, 0, 69, None)),
    "Cebolla": ("Kilogramo", (40, 0, 0.1, 0, 4, None)),
    "Ácido cítrico": ("Gramo", (None, None, None, None, None, None)),
    "Sorbato de potasio": ("Gramo", (None, None, None, None, None, None)),
}

ETAPA_RECEPCION = ("Recepción de materias primas", [
    "Verificar remitos y facturas de la mercadería recibida",
    "Controlar la temperatura y el estado de las materias primas",
])

ETAPA_ENVASADO = ("Empaque / envasado", [
    "Verificar el estado e higiene de los envases",
    "Controlar el cierre y rotulado del producto envasado",
])

RECETAS = {
    "Yogur natural": {
        "porcion": (200, "Mililitro"),
        "insumos": [("Leche entera", 1.0), ("Fermento láctico", 2)],
        "elaboracion": [
            "Pasteurizar la leche a 85 °C durante 30 minutos",
            "Enfriar a 43 °C e inocular el fermento láctico",
            "Incubar durante 5 horas hasta lograr la acidez deseada",
        ],
    },
    "Queso cremoso": {
        "porcion": (30, "Gramo"),
        "insumos": [
            ("Leche entera", 3.5),
            ("Sal fina", 0.012),
            ("Cuajo", 2),
            ("Sorbato de potasio", 0.5, "Sorbato de potasio"),
        ],
        "elaboracion": [
            "Calentar la leche a 37 °C y agregar el cuajo",
            "Cortar la cuajada y desuerar",
            "Moldear, salar y dejar madurar en cámara",
        ],
    },
    "Dulce de leche": {
        "insumos": [
            ("Leche entera", 0.8),
            ("Azúcar", 0.16),
            ("Bicarbonato de sodio", 1, "Bicarbonato de sodio"),
            ("Esencia de vainilla", 2, "Aroma natural de vainilla"),
        ],
        "elaboracion": [
            "Mezclar la leche con el azúcar y el bicarbonato",
            "Cocinar revolviendo hasta alcanzar 68 °Brix",
            "Agregar la esencia de vainilla y enfriar",
        ],
    },
    "Manteca": {
        "insumos": [("Crema de leche", 0.42), ("Sal fina", 0.002)],
        "elaboracion": [
            "Batir la crema hasta separar la manteca del suero",
            "Lavar la manteca con agua fría y salar",
            "Amasar para eliminar el exceso de suero",
        ],
    },
    "Pan de campo": {
        "porcion": (50, "Gramo"),
        "version_anterior": [
            ("Harina 000", 0.3),
            ("Agua", 0.2),
            ("Levadura fresca", 10),
            ("Sal fina", 0.006),
        ],
        "insumos": [
            ("Harina 000", 0.3),
            ("Agua", 0.2),
            ("Levadura fresca", 10),
            ("Sal fina", 0.002),
        ],
        "elaboracion": [
            "Mezclar la harina, el agua, la levadura y la sal",
            "Amasar y dejar levar durante 2 horas",
            "Hornear a 220 °C durante 35 minutos",
        ],
    },
    "Galletitas de avena": {
        "porcion": (30, "Gramo"),
        "insumos": [
            ("Avena", 0.08),
            ("Harina 0000", 0.04),
            ("Azúcar", 0.04),
            ("Manteca", 0.035),
            ("Huevo", 1),
            ("Sal fina", 0.001),
            ("Nuez moscada", 1),
        ],
        "elaboracion": [
            "Batir la manteca con el azúcar y el huevo",
            "Incorporar la avena, la harina, la sal y la nuez moscada",
            "Formar las galletitas y hornear a 180 °C durante 15 minutos",
        ],
    },
    "Agua saborizada de limón": {
        "porcion": (250, "Mililitro"),
        "insumos": [
            ("Agua", 0.47),
            ("Jugo de limón", 0.025),
            ("Azúcar", 0.03),
            ("Ácido cítrico", 1, "Ácido cítrico"),
        ],
        "elaboracion": [
            "Disolver el azúcar en el agua",
            "Agregar el jugo de limón y filtrar",
            "Pasteurizar la bebida antes de envasar",
        ],
    },
    "Granola natural": {
        "porcion": (40, "Gramo"),
        "insumos": [
            ("Avena", 0.18),
            ("Almendras", 0.05),
            ("Nueces", 0.04),
            ("Pasas de uva", 0.03),
        ],
        "elaboracion": [
            "Tostar la avena a 160 °C durante 20 minutos",
            "Picar las almendras y las nueces",
            "Mezclar con las pasas de uva una vez fría la avena",
        ],
    },
    "Alfajor de maicena": {
        "insumos": [
            ("Almidón de maíz", 0.025),
            ("Manteca", 0.01),
            ("Azúcar", 0.008),
            ("Huevo", 0.2),
            ("Dulce de leche", 0.02),
            ("Polvo de hornear", 1, "Pirofosfato ácido de sodio"),
        ],
        "elaboracion": [
            "Preparar la masa con la manteca, el azúcar, el huevo, el almidón y el polvo de hornear",
            "Estirar, cortar las tapas y hornear a 170 °C durante 10 minutos",
            "Rellenar con dulce de leche y unir las tapas",
        ],
    },
    "Caldo de verduras": {
        "porcion": (250, "Mililitro"),
        "insumos": [
            ("Agua", 0.98),
            ("Zanahoria", 0.15),
            ("Cebolla", 0.1),
            ("Sal fina", 0.008),
        ],
        "elaboracion": [
            "Lavar, pelar y cortar las verduras",
            "Hervir las verduras en el agua con la sal durante 40 minutos",
            "Colar el caldo y enfriar rápidamente",
        ],
    },
}


def obtener_insumos(db, unidades: dict[str, int]) -> dict[str, Insumo]:
    nombres = {
        renglon[0]
        for receta in RECETAS.values()
        for renglon in receta["insumos"] + receta.get("version_anterior", [])
    }
    existentes = {
        insumo.nombre: insumo
        for insumo in db.scalars(select(Insumo).where(Insumo.tipo_herencia == "general", Insumo.nombre.in_(nombres))).all()
    }

    insumos = {}
    for nombre in sorted(nombres):
        if nombre in INSUMOS_ADICIONALES:
            unidad, valores = INSUMOS_ADICIONALES[nombre]
            nutricion = dict(zip(CAMPOS_NUTRICIONALES, valores))
        else:
            unidad = NOMBRES_INSUMOS[nombre]
            nutricion = informacion_nutricional(nombre)

        insumo = existentes.get(nombre)
        if insumo is None:
            insumo = Insumo(nombre=nombre, unidad_medida_id=unidades[unidad], activo=True, **nutricion)
            db.add(insumo)
        elif insumo.valor_energetico is None:
            for campo, valor in nutricion.items():
                setattr(insumo, campo, valor)
        insumos[nombre] = insumo
    return insumos


def construir_receta(producto: Producto, datos: dict, renglones: list[tuple], insumos: dict[str, Insumo],
                     aditivos: dict[str, Aditivo], unidades: dict[str, int], version: int) -> Receta:
    porcion = datos.get("porcion")
    receta = Receta(
        producto=producto,
        version=version,
        rendimiento=producto.cantidad_neta,
        rendimiento_unidad_medida_id=producto.unidad_medida_id,
        porcion=porcion[0] if porcion else None,
        porcion_unidad_medida_id=unidades[porcion[1]] if porcion else None,
    )
    etapas = [ETAPA_RECEPCION, ("Elaboración / fabricación", datos["elaboracion"]), ETAPA_ENVASADO]
    for nombre_etapa, pasos in etapas:
        orden.insertar(
            receta.etapas,
            construir_etapa(nombre_etapa, [PasoEtapaAnidadoCreate(descripcion=paso) for paso in pasos]),
        )
    for renglon in renglones:
        nombre_insumo, cantidad = renglon[:2]
        aditivo = aditivos[renglon[2]] if len(renglon) > 2 else None
        receta.insumos.append(InsumoReceta(
            insumo=insumos[nombre_insumo],
            cantidad=cantidad,
            tipo=(TipoRenglon.ADITIVO if aditivo else TipoRenglon.INGREDIENTE).value,
            aditivo=aditivo,
        ))
    return receta


def completar_receta_existente(receta: Receta, datos: dict, aditivos: dict[str, Aditivo], unidades: dict[str, int]) -> None:
    porcion = datos.get("porcion")
    receta.rendimiento = receta.producto.cantidad_neta
    receta.rendimiento_unidad_medida_id = receta.producto.unidad_medida_id
    receta.porcion = porcion[0] if porcion else None
    receta.porcion_unidad_medida_id = unidades[porcion[1]] if porcion else None
    receta.fecha_desde_vigencia = receta.fecha_desde_vigencia or receta.fecha_creacion
    aditivos_por_insumo = {renglon[0]: aditivos[renglon[2]] for renglon in datos["insumos"] if len(renglon) > 2}
    for item in receta.insumos:
        aditivo = aditivos_por_insumo.get(item.insumo.nombre)
        if aditivo is not None:
            item.tipo = TipoRenglon.ADITIVO.value
            item.aditivo = aditivo


def generar_recetas(db) -> list[Receta]:
    unidades = {unidad.nombre: unidad.id for unidad in db.scalars(select(UnidadMedida)).all()}
    faltantes = {"Kilogramo", "Gramo", "Litro", "Mililitro", "Unidad"} - unidades.keys()
    if faltantes:
        raise ValueError(f"Faltan unidades de medida: {', '.join(sorted(faltantes))}")

    db.add_all(generar_productos(db))
    db.add_all(generar_aditivos(db))
    insumos = obtener_insumos(db, unidades)
    db.flush()

    aditivos = {aditivo.nombre: aditivo for aditivo in db.scalars(select(Aditivo)).all()}
    productos = {
        producto.nombre: producto
        for producto in db.scalars(select(Producto).where(Producto.nombre.in_(RECETAS.keys()))).all()
    }
    vigentes = {
        receta.producto_id: receta
        for receta in db.scalars(select(Receta).where(Receta.vigente.is_(True))).all()
    }

    recetas = []
    for nombre_producto, datos in RECETAS.items():
        producto = productos.get(nombre_producto)
        if producto is None:
            continue
        existente = vigentes.get(producto.id)
        if existente is not None:
            if existente.rendimiento is None:
                completar_receta_existente(existente, datos, aditivos, unidades)
            continue

        ahora = datetime.now()
        version = 1
        if "version_anterior" in datos:
            anterior = construir_receta(producto, datos, datos["version_anterior"], insumos, aditivos, unidades, version)
            anterior.vigente = False
            anterior.fecha_desde_vigencia = ahora - timedelta(days=30)
            anterior.fecha_hasta_vigencia = ahora
            recetas.append(anterior)
            version += 1

        receta = construir_receta(producto, datos, datos["insumos"], insumos, aditivos, unidades, version)
        receta.vigente = True
        receta.fecha_desde_vigencia = ahora
        recetas.append(receta)
    return recetas


def main():
    ModeloBase.metadata.create_all(bind=engine)
    migrar_esquema_insumos(engine)
    migrar_esquema_recetas(engine)
    db = SessionLocal()
    try:
        recetas = generar_recetas(db)

        db.add_all(recetas)
        db.commit()

        print(f"Se insertaron {len(recetas)} recetas.")
    
    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()
