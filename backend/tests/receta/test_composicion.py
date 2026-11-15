"""
La composición porcentual se calcula en el frontend; el backend solo tiene que
devolver, por renglón de la receta vigente, la unidad de medida anidada con los
datos de conversión del catálogo estándar.
"""
from src.unidad_medida.services import cargar_unidades_estandar


def test_receta_vigente_devuelve_unidad_medida_anidada(client, auth_headers, db_session, producto_solido, unidades_sellos, insumos_sellos, aditivos_receta):
    cargar_unidades_estandar(db_session)

    creada = client.post("/recetas/", json={
        "producto_id": producto_solido.id,
        "etapas": [{"nombre": "Elaboración", "pasos": [{"descripcion": "Mezclar"}]}],
        "insumos": [
            {"insumo_id": insumos_sellos["Harina"].id, "cantidad": 70},
            {"insumo_id": insumos_sellos["Huevo"].id, "cantidad": 2},
            {"insumo_id": insumos_sellos["Esencia"].id, "cantidad": 1, "tipo": "Aditivo",
             "aditivo_id": aditivos_receta["Aroma de vainilla"].id},
        ],
    }, headers=auth_headers)
    assert creada.status_code == 200

    response = client.get(f"/recetas/producto/{producto_solido.id}", headers=auth_headers)
    renglones = {item["nombre"]: item for item in response.json()["insumos"]}

    assert response.status_code == 200
    harina = renglones["Harina"]
    assert harina["insumo_id"] == insumos_sellos["Harina"].id
    assert harina["tipo"] == "Ingrediente"
    assert harina["cantidad"] == 70
    assert harina["unidad_medida"] == {
        "id": unidades_sellos["Gramo"].id, "nombre": "Gramo", "activo": True,
        "codigo": "g", "masa_volumen": "MASA", "factor_a_base": 1.0,
    }
    esencia = renglones["Esencia"]
    assert esencia["tipo"] == "Aditivo"
    assert (esencia["unidad_medida"]["codigo"], esencia["unidad_medida"]["masa_volumen"], esencia["unidad_medida"]["factor_a_base"]) == ("ml", "VOLUMEN", 1.0)
    huevo = renglones["Huevo"]
    assert (huevo["unidad_medida"]["codigo"], huevo["unidad_medida"]["masa_volumen"], huevo["unidad_medida"]["factor_a_base"]) == (None, None, None)
