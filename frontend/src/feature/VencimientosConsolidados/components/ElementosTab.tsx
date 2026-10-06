import { useMemo } from "react"
import type { TableColumn } from "react-data-table-component"
import { AppTable } from "../../../components/AppTable"
import { PageLoading } from "../../../components/PageLoading"
import { PageError } from "../../../components/PageError"
import { useApi } from "../../../hooks/useApi"
import type { ElementoLimpieza } from "../../ElementosLimpieza/types"
import { clasificarPorDiasRestantes, estilosFilaPorEstado, ESTADO_VENCIMIENTOS_ORDEN, type EstadoVencimientos } from "../lib/estado"
import { EstadoBadge } from "./EstadoBadge"

type FilaElemento = ElementoLimpieza & { estadoVencimiento: EstadoVencimientos }

export function ElementosTab({ diasAntelacion }: { diasAntelacion: number }) {
    const { data: elementos, error, isLoading } = useApi<ElementoLimpieza[]>("/elementos-limpieza/")

    const filas = useMemo<FilaElemento[]>(() => {
        if (!Array.isArray(elementos)) return []
        return elementos
            .filter((elemento) => elemento.estado)
            .map((elemento) => ({ ...elemento, estadoVencimiento: clasificarPorDiasRestantes(elemento.dias_restantes, diasAntelacion) }))
            .sort((a, b) => ESTADO_VENCIMIENTOS_ORDEN[a.estadoVencimiento] - ESTADO_VENCIMIENTOS_ORDEN[b.estadoVencimiento])
    }, [elementos, diasAntelacion])

    if (isLoading) return <PageLoading title="Elementos de Limpieza" />
    if (!elementos || error) return <PageError title="Elementos de Limpieza" message="Ocurrió un error al cargar los elementos de limpieza" />

    const columns: TableColumn<FilaElemento>[] = [
        { name: "Código", selector: (row) => row.codigo, center: true, minWidth: "110px" },
        { name: "Nombre", selector: (row) => row.nombre, grow: 2 },
        { name: "Ubicación", selector: (row) => row.ubicacion ?? "-", grow: 2 },
        {
            name: "Días para recambio",
            center: true,
            selector: (row) => row.dias_restantes ?? 999999,
            cell: (row) => (row.dias_restantes === null ? <span>Sin definir</span> : <span>{row.dias_restantes} días</span>),
        },
        {
            name: "Estado",
            center: true,
            cell: (row) => <EstadoBadge estado={row.estadoVencimiento} />,
        },
    ]

    return (
        <AppTable
            columns={columns}
            data={filas}
            conditionalRowStyles={estilosFilaPorEstado<FilaElemento>((row) => row.estadoVencimiento)}
        />
    )
}
