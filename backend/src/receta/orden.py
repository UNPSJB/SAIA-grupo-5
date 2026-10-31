def renumerar(items: list) -> None:
    for posicion, item in enumerate(items, start=1):
        item.orden = posicion


def insertar(items: list, item, orden: int | None = None) -> None:
    # Sin orden (o fuera de rango) se agrega al final
    if orden is None or orden > len(items):
        items.append(item)
    else:
        items.insert(orden - 1, item)
    renumerar(items)


def mover(items: list, item, orden: int) -> None:
    items.remove(item)
    insertar(items, item, orden)
