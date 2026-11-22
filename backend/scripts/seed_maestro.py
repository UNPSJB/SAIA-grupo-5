# scripts/seed_maestro.py
"""
Seed maestro: arma una cadena completa y coherente alrededor de 5 productos.

Por cada producto deja cargado:
  - insumos con su información nutricional y su fuente,
  - receta vigente con etapas y pasos,
  - información nutricional calculada de la receta (tabla del rótulo),
  - evaluación de rotulado (reglas vigentes + sellos frontales),
  - lotes de producción con historial de estados e insumos utilizados,
  - despachos a clientes (envíos).

Y alrededor de la cadena:
  - proveedor con su catálogo,
  - pedido al proveedor,
  - recepción de mercadería (LoteProveedor + InsumoLote en stock),
  - clientes con direcciones de entrega.

Es idempotente: si un producto ya existe no se vuelve a crear, y los catálogos
(unidades, insumos, proveedor, clientes) se completan sin duplicarse.

Requiere una base con el esquema creado (lo crea si falta).
Uso: python -m scripts.seed_maestro
"""
from datetime import date, datetime, time, timedelta
from decimal import ROUND_CEILING, Decimal

from sqlalchemy import select

import src.all_models  # noqa: F401
from src.database import SessionLocal, engine
from src.models import ModeloBase

from src.aditivo.models import Aditivo
from src.auth.utils import get_password_hash
from src.calculo_nutricional.schemas import CalculoRecetaCreate
from src.calculo_nutricional.services import calcular_informacion_receta
from src.clientes.models import Cliente
from src.direcciones_cliente.models import DireccionCliente
from src.envios_lote.models import EnvioLote, EstadoEnvio
from src.etapa_receta.services import construir_etapa
from src.fuente_nutricional.models import FuenteNutricional
from src.informacion_nutricional_insumo.models import InformacionNutricionalInsumo
from src.insumos.models import Insumo
from src.insumos_lote.models import InsumoLote
from src.lote_produccion.models import (
    EstadoLote,
    HistorialEstadoLote,
    InsumoUtilizado,
    LoteProduccion,
)
from src.lote_proveedor.constants import EstadoLoteProveedor
from src.lote_proveedor.models import HistorialEstadoLoteProveedor, LoteProveedor
from src.paso_etapa.schemas import PasoEtapaAnidadoCreate
from src.pedidos_proveedor.constants import EstadoPedidoProveedor
from src.pedidos_proveedor.models import PedidoProveedor, PedidoProveedorItem
from src.personal.models import Persona
from src.producto.models import Producto
from src.proveedor.models import Proveedor, ProveedorInsumo
from src.receta import orden
from src.receta.constants import TipoRenglon
from src.receta.models import InsumoReceta, Receta
from src.receta.sellos import gramos_de_insumo
from src.rotulado import services as rotulado_services
from src.unidad_medida.models import UnidadMedida
from src.unidad_medida.services import cargar_unidades_estandar

from scripts.seed_productos import FOTO_PRODUCTO_SEED

# Orden de las tuplas de valores nutricionales (los mismos campos que
# informacion_nutricional_insumo.constants.DATOS_NUTRICIONALES).
CAMPOS_NUTRICIONALES = (
    "valor_energetico", "carbohidratos", "azucares_totales", "azucares_anadidos", "proteinas",
    "grasas_totales", "grasas_saturadas", "grasas_trans", "fibra_alimentaria", "sodio",
)

# Campos que además se copian en el insumo (los usa la evaluación de sellos).
CAMPOS_INSUMO = ("valor_energetico", "azucares_anadidos", "grasas_totales", "grasas_saturadas", "sodio")

UNIDADES = ["Gramo", "Kilogramo", "Mililitro", "Litro", "Unidad"]

FUENTE = {
    "nombre": "Seed maestro SAIA (desarrollo)",
    "descripcion": "Valores nutricionales de referencia de los insumos del seed maestro.",
    "origen": "backend/scripts/seed_maestro.py",
    "licencia_uso": "Uso interno para desarrollo y pruebas. No usar para rotulado real.",
    "formato_uso": "Valores cada 100 g: energía en kcal, macronutrientes en g y sodio en mg.",
}

# Valores cada 100 g: (kcal, carbohidratos, azúcares totales, azúcares añadidos, proteínas,
# grasas totales, grasas saturadas, grasas trans, fibra, sodio mg)
INSUMOS = {
    "Leche entera": {
        "unidad": "Kilogramo",
        "marca": "La Serenísima",
        "valores": (61, 4.8, 4.8, 0, 3.2, 3.3, 1.9, 0.1, 0, 43),
        "aporta": {"grasas"},
    },
    "Azúcar": {
        "unidad": "Kilogramo",
        "marca": "Ledesma",
        "valores": (400, 100, 100, 100, 0, 0, 0, 0, 0, 0),
        "aporta": {"azucares"},
    },
    "Sal fina": {
        "unidad": "Kilogramo",
        "marca": "Dos Anclas",
        "valores": (0, 0, 0, 0, 0, 0, 0, 0, 0, 38758),
        "aporta": {"sodio"},
    },
    "Fermento láctico": {
        "unidad": "Gramo",
        "marca": "Calsa",
        "valores": (350, 80, 0, 0, 10, 2, 1.2, 0, 0, 800),
        "aporta": set(),
    },
    "Cuajo": {
        "unidad": "Gramo",
        "marca": "Milkaut",
        "valores": (10, 0, 0, 0, 2.5, 0, 0, 0, 0, 2000),
        "aporta": set(),
    },
    "Sorbato de potasio": {
        "unidad": "Gramo",
        "marca": "Sin marca",
        "valores": (0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
        "aporta": set(),
    },
    "Harina 000": {
        "unidad": "Kilogramo",
        "marca": "Morixe",
        "valores": (364, 76, 0.3, 0, 10, 1.0, 0.2, 0, 2.7, 2),
        "aporta": set(),
    },
    "Harina 0000": {
        "unidad": "Kilogramo",
        "marca": "Blancaflor",
        "valores": (364, 76, 0.3, 0, 10, 1.0, 0.2, 0, 2.7, 2),
        "aporta": set(),
    },
    "Agua": {
        "unidad": "Kilogramo",
        "marca": "Sin marca",
        "valores": (0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
        "aporta": set(),
    },
    "Levadura fresca": {
        "unidad": "Gramo",
        "marca": "Calsa",
        "valores": (105, 18, 0, 0, 8.4, 1.9, 0.2, 0, 8.1, 30),
        "aporta": set(),
    },
    "Avena": {
        "unidad": "Kilogramo",
        "marca": "Quaker",
        "valores": (389, 66, 1, 0, 16.9, 6.9, 1.2, 0, 10.6, 2),
        "aporta": set(),
    },
    "Manteca": {
        "unidad": "Kilogramo",
        "marca": "La Serenísima",
        "valores": (717, 0.1, 0.1, 0, 0.9, 81, 51, 3.3, 0, 11),
        "aporta": {"grasas"},
    },
    "Huevo": {
        "unidad": "Gramo",
        "marca": "Granja del Sol",
        "valores": (143, 0.7, 0.4, 0, 12.6, 9.5, 3.1, 0, 0, 142),
        "aporta": set(),
    },
    "Jugo de limón": {
        "unidad": "Kilogramo",
        "marca": "Sin marca",
        "valores": (22, 6.9, 2.5, 0, 0.4, 0.2, 0, 0, 0.3, 1),
        "aporta": set(),
    },
}

ADITIVOS = {
    "Sorbato de potasio": {"clase_funcional": "Conservante", "numero_ins": "202"},
}

# (marca del producto, campo del insumo, campo del producto)
MARCAS_PRODUCTO = {
    "azucares": ("aporta_azucares", "azucares_agregados"),
    "grasas": ("aporta_grasas", "grasas_agregadas"),
    "sodio": ("aporta_sodio", "sodio_agregado"),
}

ETAPA_RECEPCION = ("Recepción de materias primas", [
    "Verificar el remito y el estado de la mercadería recibida",
    "Controlar la temperatura de los insumos refrigerados",
])

ETAPA_ENVASADO = ("Envasado y rotulado", [
    "Verificar la higiene de los envases",
    "Controlar el cierre y el rotulado del producto",
])

# Cada producto: receta completa, etapas y cantidad neta declarada.
PRODUCTOS = [
    {
        "nombre": "Yogur natural azucarado",
        "descripcion": "Yogur batido elaborado con leche entera y azúcar, envase de 900 ml.",
        "cantidad_neta": 900,
        "unidad": "Mililitro",
        "porcion": (200, "Mililitro"),
        "insumos": [("Leche entera", 0.85), ("Azúcar", 0.05), ("Fermento láctico", 5)],
        "etapas": [
            ETAPA_RECEPCION,
            ("Elaboración", [
                "Pasteurizar la leche a 85 °C durante 30 minutos",
                "Enfriar a 43 °C e inocular el fermento láctico",
                "Incubar 5 horas y agregar el azúcar",
            ]),
            ETAPA_ENVASADO,
        ],
    },
    {
        "nombre": "Queso cremoso untable",
        "descripcion": "Queso cremoso untable de pasta blanda, horma de 400 g.",
        "cantidad_neta": 400,
        "unidad": "Gramo",
        "porcion": (30, "Gramo"),
        "insumos": [
            ("Leche entera", 2.5),
            ("Sal fina", 0.02),
            ("Cuajo", 2),
            ("Sorbato de potasio", 0.5, "Sorbato de potasio"),
        ],
        "etapas": [
            ETAPA_RECEPCION,
            ("Elaboración", [
                "Calentar la leche a 37 °C y agregar el cuajo",
                "Cortar la cuajada y desuerar",
                "Salar, agregar el conservante y moldear",
            ]),
            ETAPA_ENVASADO,
        ],
    },
    {
        "nombre": "Pan de campo de masa madre",
        "descripcion": "Pan de campo de corteza crocante, pieza de 500 g.",
        "cantidad_neta": 500,
        "unidad": "Gramo",
        "porcion": (50, "Gramo"),
        "insumos": [
            ("Harina 000", 0.3),
            ("Agua", 0.2),
            ("Levadura fresca", 6),
            ("Sal fina", 0.006),
        ],
        "etapas": [
            ETAPA_RECEPCION,
            ("Amasado y leudado", [
                "Mezclar la harina, el agua, la levadura y la sal",
                "Amasar y dejar levar 2 horas",
            ]),
            ("Horneado", ["Hornear a 220 °C durante 35 minutos"]),
            ETAPA_ENVASADO,
        ],
    },
    {
        "nombre": "Galletitas de avena y manteca",
        "descripcion": "Galletitas dulces de avena con manteca, paquete de 300 g.",
        "cantidad_neta": 300,
        "unidad": "Gramo",
        "porcion": (30, "Gramo"),
        "insumos": [
            ("Avena", 0.12),
            ("Harina 0000", 0.06),
            ("Azúcar", 0.05),
            ("Manteca", 0.045),
            ("Huevo", 25),
        ],
        "etapas": [
            ETAPA_RECEPCION,
            ("Elaboración", [
                "Batir la manteca con el azúcar y el huevo",
                "Incorporar la avena y la harina",
                "Formar las galletitas y hornear a 180 °C durante 15 minutos",
            ]),
            ETAPA_ENVASADO,
        ],
    },
    {
        "nombre": "Agua saborizada cítrica",
        "descripcion": "Bebida sin alcohol sabor limón, botella de 500 ml.",
        "cantidad_neta": 500,
        "unidad": "Mililitro",
        "porcion": (250, "Mililitro"),
        "insumos": [("Agua", 0.46), ("Jugo de limón", 0.025), ("Azúcar", 0.02)],
        "etapas": [
            ETAPA_RECEPCION,
            ("Elaboración", [
                "Disolver el azúcar en el agua",
                "Agregar el jugo de limón y filtrar",
                "Pasteurizar antes de envasar",
            ]),
            ETAPA_ENVASADO,
        ],
    },
]

PROVEEDOR = {
    "nombre": "Insumos del Sur S.A.",
    "cuit": "30-70000001-9",
    "telefono": "0280-4450000",
    "email": "ventas@insumosdelsur.com",
}
NUMERO_REMITO = "MAE-0001-00000001"

CLIENTES = [
    {
        "razon_social": "Supermercado del Valle",
        "cuit": "30-70000002-8",
        "telefono": "0280-4451111",
        "email": "compras@superdelvalle.com",
        "direcciones": [
            ("Av. San Martín 1200", "Trelew", "Chubut", "9100", "Sucursal centro"),
            ("Ruta 3 Km 4", "Trelew", "Chubut", "9100", "Depósito"),
        ],
    },
    {
        "razon_social": "Almacén La Esquina",
        "cuit": "20-70000003-4",
        "telefono": "0280-4452222",
        "email": None,
        "direcciones": [("Belgrano 780", "Rawson", "Chubut", "9103", None)],
    },
]

CANTIDAD_LOTE_TERMINADO = 100
CANTIDAD_LOTE_PRODUCCION = 60
CANTIDAD_STOCK_INSUMO = 200
MINIMO_ALERTA_INSUMO = 20
DESPACHO_POR_LOTE = 10


def _valores(datos: dict) -> dict[str, Decimal]:
    return {campo: Decimal(str(valor)) for campo, valor in zip(CAMPOS_NUTRICIONALES, datos["valores"])}


def _persona(db, username: str, nombre: str, apellido: str, dni: str, capacidades: dict) -> Persona:
    persona = db.scalar(select(Persona).where(Persona.username == username))
    if persona is None:
        persona = Persona(
            nombre=nombre,
            apellido=apellido,
            dni=dni,
            mail=f"{username}@saia.local",
            username=username,
            hashed_password=get_password_hash("password123"),
            activo=True,
            **capacidades,
        )
        db.add(persona)
        db.flush()
    return persona


def _unidades(db) -> dict[str, UnidadMedida]:
    existentes = {unidad.nombre: unidad for unidad in db.scalars(select(UnidadMedida)).all()}
    faltantes = [UnidadMedida(nombre=nombre, activo=True) for nombre in UNIDADES if nombre not in existentes]
    db.add_all(faltantes)
    db.commit()
    # Completa codigo/factor de las unidades estándar (lo mismo que hace el arranque).
    cargar_unidades_estandar(db)

    return {unidad.nombre: unidad for unidad in db.scalars(select(UnidadMedida)).all()}


def _fuente(db, administrador: Persona) -> FuenteNutricional:
    fuente = db.scalar(select(FuenteNutricional).where(FuenteNutricional.nombre == FUENTE["nombre"]))
    if fuente is None:
        fuente = FuenteNutricional(
            **FUENTE,
            licencia_verificada=True,
            activo=True,
            verificada_por_id=administrador.id,
            fecha_verificacion=datetime.now(),
        )
        db.add(fuente)
        db.flush()
    return fuente


def _insumos(db, unidades, fuente: FuenteNutricional, administrador: Persona) -> dict[str, Insumo]:
    insumos = {}
    ahora = datetime.now()

    for nombre, datos in INSUMOS.items():
        valores = _valores(datos)
        # Los campos que usa la evaluación de sellos se dejan con los valores del seed
        # aunque el insumo ya exista, para que el rótulo del producto sea evaluable.
        flags = {
            "aporta_azucares": "azucares" in datos["aporta"],
            "aporta_grasas": "grasas" in datos["aporta"],
            "aporta_sodio": "sodio" in datos["aporta"],
            "aporta_edulcorantes": False,
            "aporta_cafeina": False,
        }
        valores_insumo = {campo: valores[campo] for campo in CAMPOS_INSUMO}

        insumo = db.scalar(select(Insumo).where(Insumo.nombre == nombre))
        if insumo is None:
            insumo = Insumo(
                nombre=nombre,
                marca=datos["marca"],
                unidad_medida_id=unidades[datos["unidad"]].id,
                activo=True,
                **flags,
                **valores_insumo,
            )
            db.add(insumo)
            db.flush()
        else:
            for campo, valor in {**flags, **valores_insumo}.items():
                setattr(insumo, campo, valor)

        info = db.scalar(
            select(InformacionNutricionalInsumo).where(InformacionNutricionalInsumo.insumo_id == insumo.id)
        )
        if info is None:
            db.add(InformacionNutricionalInsumo(
                insumo_id=insumo.id,
                **valores,
                fuente_nutricional_id=fuente.id,
                referencia_fuente=f"{nombre} ({datos['marca']}) - valores cada 100 g",
                cargada_por_id=administrador.id,
                fecha_carga=ahora,
                modificado=False,
            ))

        insumos[nombre] = insumo

    db.commit()
    return insumos


def _aditivos(db) -> dict[str, Aditivo]:
    aditivos = {}
    for nombre, datos in ADITIVOS.items():
        aditivo = db.scalar(select(Aditivo).where(Aditivo.nombre == nombre))
        if aditivo is None:
            aditivo = Aditivo(nombre=nombre, activo=True, **datos)
            db.add(aditivo)
        aditivos[nombre] = aditivo
    db.commit()
    return aditivos


def _marcas_del_producto(insumos_receta: list[Insumo]) -> dict[str, bool]:
    return {
        campo_producto: any(getattr(insumo, campo_insumo) for insumo in insumos_receta)
        for campo_insumo, campo_producto in MARCAS_PRODUCTO.values()
    }


def _producto(db, datos: dict, unidades, insumos, aditivos) -> tuple[Producto, object | None]:
    producto = db.scalar(select(Producto).where(Producto.nombre == datos["nombre"]))
    if producto is not None:
        return producto, None

    insumos_receta = [insumos[item[0]] for item in datos["insumos"]]

    producto = Producto(
        nombre=datos["nombre"],
        descripcion=datos["descripcion"],
        cantidad_neta=datos["cantidad_neta"],
        unidad_medida_id=unidades[datos["unidad"]].id,
        foto_producto=FOTO_PRODUCTO_SEED,
        fecha_lanzamiento=date.today() - timedelta(days=30),
        activo=True,
        envasado_ausencia_cliente=True,
        contiene_edulcorantes=False,
        contiene_cafeina=False,
        **_marcas_del_producto(insumos_receta),
    )

    ahora = datetime.now()
    receta = Receta(
        producto=producto,
        version=1,
        vigente=True,
        fecha_creacion=ahora,
        fecha_desde_vigencia=ahora,
        porcion=datos["porcion"][0],
        porcion_unidad_medida_id=unidades[datos["porcion"][1]].id,
    )

    for item in datos["insumos"]:
        nombre, cantidad = item[0], item[1]
        aditivo = aditivos[item[2]] if len(item) > 2 else None
        receta.insumos.append(InsumoReceta(
            insumo=insumos[nombre],
            cantidad=cantidad,
            tipo=TipoRenglon.ADITIVO.value if aditivo else TipoRenglon.INGREDIENTE.value,
            aditivo=aditivo,
        ))

    for nombre_etapa, pasos in datos["etapas"]:
        etapa = construir_etapa(nombre_etapa, [PasoEtapaAnidadoCreate(descripcion=p) for p in pasos])
        orden.insertar(receta.etapas, etapa)

    # La receta no cuelga del producto por relación navegable desde Producto
    # (es viewonly), así que se agrega aparte para que reciba su id.
    db.add_all([producto, receta])
    db.commit()

    # El rendimiento de la tanda es la suma de los gramos de todos los renglones.
    rendimiento = sum(
        gramos_de_insumo(item.insumo, item.cantidad) or 0 for item in receta.insumos
    )
    calcular_informacion_receta(
        db, receta.id, CalculoRecetaCreate(rendimiento=Decimal(str(round(rendimiento, 2))))
    )

    evaluacion = rotulado_services.evaluar_rotulado(
        db, producto, [(item.insumo, item.cantidad) for item in receta.insumos]
    )
    return producto, evaluacion


def _proveedor(db, insumos: dict[str, Insumo]) -> Proveedor:
    proveedor = db.scalar(select(Proveedor).where(Proveedor.cuit == PROVEEDOR["cuit"]))
    if proveedor is None:
        proveedor = Proveedor(
            **PROVEEDOR,
            numero_habilitacion="RNE-70001",
            vencimiento_habilitacion=date.today() + timedelta(days=365),
            activo=True,
            insumos_asociados=[ProveedorInsumo(insumo_id=insumo.id) for insumo in insumos.values()],
        )
        db.add(proveedor)
        db.commit()
    return proveedor


def _clientes(db) -> list[Cliente]:
    clientes = []
    for datos in CLIENTES:
        cliente = db.scalar(select(Cliente).where(Cliente.cuit == datos["cuit"]))
        if cliente is None:
            cliente = Cliente(
                razon_social=datos["razon_social"],
                cuit=datos["cuit"],
                telefono=datos["telefono"],
                email=datos["email"],
                activo=True,
                direcciones=[
                    DireccionCliente(
                        calle_altura=calle,
                        localidad=localidad,
                        provincia=provincia,
                        codigo_postal=cp,
                        descripcion=descripcion,
                        activo=True,
                    )
                    for calle, localidad, provincia, cp, descripcion in datos["direcciones"]
                ],
            )
            db.add(cliente)
        clientes.append(cliente)
    db.commit()
    return clientes


def _recepcion(db, proveedor: Proveedor, insumos: dict[str, Insumo], administrador: Persona) -> LoteProveedor:
    lote = db.scalar(select(LoteProveedor).where(LoteProveedor.numero_remito == NUMERO_REMITO))
    if lote is not None:
        return lote

    hoy = date.today()
    fecha_recepcion = hoy - timedelta(days=8)
    llegada = datetime.combine(fecha_recepcion, time(8, 30))

    pedido = PedidoProveedor(
        proveedor_id=proveedor.id,
        registrado_por_id=administrador.id,
        fecha_pedido=hoy - timedelta(days=12),
        fecha_entrega_estimada=fecha_recepcion,
        estado=EstadoPedidoProveedor.RECIBIDO,
        fecha_registro=datetime.combine(hoy - timedelta(days=12), time(9, 0)),
        activo=True,
        items=[
            PedidoProveedorItem(insumo_id=insumo.id, cantidad_pedida=CANTIDAD_STOCK_INSUMO)
            for insumo in insumos.values()
        ],
    )

    lote = LoteProveedor(
        proveedor_id=proveedor.id,
        registrado_por_id=administrador.id,
        numero_remito=NUMERO_REMITO,
        fecha_recepcion=fecha_recepcion,
        pedido=pedido,
        estado=EstadoLoteProveedor.ACOMODADO,
        fecha_registro=llegada,
        activo=True,
        insumos=[
            InsumoLote(
                insumo_id=insumo.id,
                marca=insumo.marca,
                cantidad=CANTIDAD_STOCK_INSUMO,
                cantidad_restante=CANTIDAD_STOCK_INSUMO,
                fecha_vencimiento=hoy + timedelta(days=120),
                costo_unitario=Decimal("120.00"),
                minimo_alerta=MINIMO_ALERTA_INSUMO,
                numero_lote=f"MAE-{insumo.id:03d}",
                activo=True,
            )
            for insumo in insumos.values()
        ],
        historial_estados=[
            HistorialEstadoLoteProveedor(
                estado=estado,
                fecha_hora=llegada + timedelta(hours=horas),
                usuario_id=administrador.id,
                observacion="Recepción inicial de mercadería" if horas == 0 else None,
            )
            for estado, horas in (
                (EstadoLoteProveedor.LLEGADA, 0),
                (EstadoLoteProveedor.DESEMPAQUE, 2),
                (EstadoLoteProveedor.ACOMODADO, 5),
            )
        ],
    )

    db.add(lote)
    db.commit()
    return lote


def _consumir_insumos(db, receta: Receta) -> list[InsumoUtilizado]:
    """Descuenta stock FIFO de los lotes de proveedor y arma los renglones de trazabilidad."""
    utilizados = []
    for item in receta.insumos:
        stock = db.scalar(
            select(InsumoLote)
            .where(InsumoLote.insumo_id == item.insumo_id, InsumoLote.cantidad_restante > 0)
            .order_by(InsumoLote.fecha_vencimiento)
        )
        if stock is None:
            continue

        # El stock de los lotes de proveedor se lleva en unidades enteras.
        cantidad = max(1, int(Decimal(str(item.cantidad)).to_integral_value(rounding=ROUND_CEILING)))
        if stock.cantidad_restante < cantidad:
            cantidad = stock.cantidad_restante

        stock.cantidad_restante -= cantidad
        if stock.cantidad_restante == 0:
            stock.activo = False
        utilizados.append(InsumoUtilizado(insumo_lote=stock, cantidad_utilizada=Decimal(cantidad)))
    return utilizados


def _produccion(db, producto: Producto, receta: Receta, operario: Persona) -> list[LoteProduccion]:
    existentes = db.scalars(select(LoteProduccion).where(LoteProduccion.producto_id == producto.id)).all()
    if existentes:
        return []

    hoy = date.today()
    terminado = date.today() - timedelta(days=6)

    lote_terminado = LoteProduccion(
        producto_id=producto.id,
        fecha_produccion=terminado,
        fecha_vencimiento=terminado + timedelta(days=25),
        cantidad_producida=CANTIDAD_LOTE_TERMINADO,
        cantidad_disponible=CANTIDAD_LOTE_TERMINADO,
        estado=EstadoLote.TERMINADO.value,
        activo=True,
        insumos_utilizados=_consumir_insumos(db, receta),
    )
    lote_terminado.historial_estados = [
        HistorialEstadoLote(
            estado=estado,
            fecha_hora=datetime.combine(terminado, time(7, 0)) + timedelta(hours=horas),
            usuario_id=operario.id,
            observacion="Alta del lote" if horas == 0 else None,
        )
        for estado, horas in (
            (EstadoLote.EN_PRODUCCION.value, 0),
            (EstadoLote.EMPAQUETANDO.value, 4),
            (EstadoLote.TERMINADO.value, 8),
        )
    ]

    lote_en_proceso = LoteProduccion(
        producto_id=producto.id,
        fecha_produccion=hoy,
        fecha_vencimiento=hoy + timedelta(days=30),
        cantidad_producida=CANTIDAD_LOTE_PRODUCCION,
        cantidad_disponible=CANTIDAD_LOTE_PRODUCCION,
        estado=EstadoLote.EN_PRODUCCION.value,
        activo=True,
    )
    lote_en_proceso.historial_estados = [
        HistorialEstadoLote(
            estado=EstadoLote.EN_PRODUCCION.value,
            fecha_hora=datetime.combine(hoy, time(7, 0)),
            usuario_id=operario.id,
            observacion="Alta del lote",
        )
    ]

    db.add_all([lote_terminado, lote_en_proceso])
    db.commit()
    return [lote_terminado, lote_en_proceso]


def _envios(db, lote: LoteProduccion, clientes: list[Cliente]) -> list[EnvioLote]:
    if lote.envios or lote.cantidad_disponible <= 0:
        return []

    hoy = date.today()
    entregado, en_camino = clientes[0], clientes[-1]
    envios = [
        EnvioLote(
            lote=lote,
            cliente_id=entregado.id,
            direccion_cliente_id=entregado.direcciones[0].id,
            cantidad=DESPACHO_POR_LOTE,
            numero_remito=f"R-MAE-{lote.id:06d}-1",
            transportista="Transporte Patagónico",
            estado=EstadoEnvio.ENTREGADO.value,
            fecha_envio=hoy - timedelta(days=4),
            fecha_entrega=hoy - timedelta(days=3),
        ),
        EnvioLote(
            lote=lote,
            cliente_id=en_camino.id,
            direccion_cliente_id=en_camino.direcciones[0].id,
            cantidad=DESPACHO_POR_LOTE,
            numero_remito=f"R-MAE-{lote.id:06d}-2",
            transportista="Logística del Sur",
            estado=EstadoEnvio.EN_CAMINO.value,
            fecha_envio=hoy - timedelta(days=1),
            fecha_entrega=None,
        ),
    ]
    lote.cantidad_disponible -= sum(envio.cantidad for envio in envios)
    lote.estado = (
        EstadoLote.ENVIADO.value if lote.cantidad_disponible <= 0
        else EstadoLote.PARCIALMENTE_DESPACHADO.value
    )
    db.add_all(envios)
    db.commit()
    return envios


def main():
    ModeloBase.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        administrador = _persona(
            db, "seed.maestro", "Maestro", "Seed", "99000001", {"operar": True, "administrar": True}
        )
        operario = _persona(db, "seed.operario", "Operario", "Seed", "99000002", {"operar": True})

        unidades = _unidades(db)
        fuente = _fuente(db, administrador)
        insumos = _insumos(db, unidades, fuente, administrador)
        aditivos = _aditivos(db)
        proveedor = _proveedor(db, insumos)
        _recepcion(db, proveedor, insumos, administrador)
        clientes = _clientes(db)

        print(f"Catálogos: {len(insumos)} insumos, {len(aditivos)} aditivos, "
              f"{len(clientes)} clientes, proveedor '{proveedor.nombre}'.")

        for datos in PRODUCTOS:
            producto, evaluacion = _producto(db, datos, unidades, insumos, aditivos)

            receta = db.scalar(
                select(Receta).where(Receta.producto_id == producto.id, Receta.vigente.is_(True))
            )
            lotes = _produccion(db, producto, receta, operario)
            envios = 0
            for lote in lotes:
                # Solo se despacha mercadería terminada.
                if lote.estado != EstadoLote.TERMINADO.value:
                    continue
                envios += len(_envios(db, lote, clientes))

            if evaluacion is None:
                print(f"  - {producto.nombre}: ya existía, no se recreó.")
                continue

            sellos = ", ".join(evaluacion.sellos.sellos) if evaluacion.sellos else "sin sellos"
            print(
                f"  - {producto.nombre}: rotulado {evaluacion.estado.value} ({sellos}); "
                f"{len(lotes)} lotes de producción, {envios} envíos."
            )

        print("Seed maestro terminado.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
