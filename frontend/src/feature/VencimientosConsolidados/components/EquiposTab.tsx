import { useMemo } from "react"
import type { TableColumn } from "react-data-table-component"
import { AppTable } from "../../../components/AppTable"
import { PageLoading } from "../../../components/PageLoading"
import { PageError } from "../../../components/PageError"
import { useApi } from "../../../hooks/useApi"
import type { Equipo } from "../../Equipos/types"
import type { PlanCalibracion } from "../../PlanesCalibracion/types"
import { clasificarPorDiasRestantes, estilosFilaPorEstado, ESTADO_VENCIMIENTOS_ORDEN, type EstadoVencimientos } from "../lib/estado"
import { EstadoBadge } from "./EstadoBadge"

type FilaPlan = PlanCalibracion & { equipo: Equipo | undefined; estadoVencimiento: EstadoVencimientos }

export function EquiposTab({ diasAntelacion }: { diasAntelacion: number }) {
    const { data: planes, error: errorPlanes, isLoading: isLoadingPlanes } = useApi<PlanCalibracion[]>("/planes-calibracion/")
    const { data: equipos, error: errorEquipos, isLoading: isLoadingEquipos } = useApi<Equipo[]>("/equipos/")

    const filas = useMemo<FilaPlan[]>(() => {
        if (!Array.isArray(planes)) return []
        const equiposPorId = new Map((equipos ?? []).map((equipo) => [equipo.id, equipo]))
        return planes
            .filter((plan) => plan.estado)
            .map((plan) => ({
                ...plan,
                equipo: equiposPorId.get(plan.equipo_id),
                estadoVencimiento: clasificarPorDiasRestantes(plan.dias_restantes, diasAntelacion),
            }))
            .sort((a, b) => ESTADO_VENCIMIENTOS_ORDEN[a.estadoVencimiento] - ESTADO_VENCIMIENTOS_ORDEN[b.estadoVencimiento])
    }, [planes, equipos, diasAntelacion])

    const isLoading = isLoadingPlanes || isLoadingEquipos
    const error = errorPlanes || errorEquipos

    if (isLoading) return <PageLoading title="Equipos" />
    if (!planes || error) return <PageError title="Equipos" message="Ocurrió un error al cargar los planes de calibración" />

    const columns: TableColumn<FilaPlan>[] = [
        { name: "Equipo", selector: (row) => row.equipo?.nombre ?? `#${row.equipo_id}`, grow: 2 },
        { name: "Categoría", selector: (row) => row.equipo?.categoria ?? "-", center: true },
        { name: "Ubicación", selector: (row) => row.equipo?.ubicacion ?? "-", grow: 2 },
        {
            name: "Próxima calibración",
            center: true,
            selector: (row) => row.proxima_fecha ?? "",
            cell: (row) => <span>{row.proxima_fecha ? row.proxima_fecha.split("-").reverse().join("/") : "Sin definir"}</span>,
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
            conditionalRowStyles={estilosFilaPorEstado<FilaPlan>((row) => row.estadoVencimiento)}
        />
    )
}
