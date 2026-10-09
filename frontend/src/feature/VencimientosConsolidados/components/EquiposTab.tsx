import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import type { TableColumn } from "react-data-table-component"
import { AppTable } from "../../../components/AppTable"
import { PageLoading } from "../../../components/PageLoading"
import { PageError } from "../../../components/PageError"
import { ActionButton } from "../../../components/ActionButton"
import { useApi } from "../../../hooks/useApi"
import { useAuth } from "../../../hooks/useAuth"
import type { Equipo } from "../../Equipos/types"
import type { PlanCalibracion } from "../../PlanesCalibracion/types"
import { clasificarPorDiasRestantes, ESTADO_VENCIMIENTOS_ORDEN, type EstadoVencimientos } from "../utils/estado"
import { EstadoVencimiento } from "./EstadoVencimiento"

type FilaEquipo = {
    equipo: Equipo
    plan: PlanCalibracion | undefined
    estadoVencimiento: EstadoVencimientos
}

export function EquiposTab({ diasAntelacion }: { diasAntelacion: number }) {
    const navigate = useNavigate()
    const { currentUser } = useAuth()
    const { data: planes, error: errorPlanes, isLoading: isLoadingPlanes } = useApi<PlanCalibracion[]>("/planes-calibracion/")
    const { data: equipos, error: errorEquipos, isLoading: isLoadingEquipos } = useApi<Equipo[]>("/equipos/")

    const filas = useMemo<FilaEquipo[]>(() => {
        if (!Array.isArray(equipos)) return []
        const planesPorEquipo = new Map((planes ?? []).map((plan) => [plan.equipo_id, plan]))
        return equipos
            .filter((equipo) => equipo.estado)
            .map((equipo) => {
                const plan = planesPorEquipo.get(equipo.id)
                const tienePlanActivo = Boolean(plan && plan.estado)
                return {
                    equipo,
                    plan,
                    estadoVencimiento: tienePlanActivo
                        ? clasificarPorDiasRestantes(plan!.dias_restantes, diasAntelacion)
                        : "sin-vencimientos" as const,
                }
            })
            .sort((a, b) => ESTADO_VENCIMIENTOS_ORDEN[a.estadoVencimiento] - ESTADO_VENCIMIENTOS_ORDEN[b.estadoVencimiento])
    }, [equipos, planes, diasAntelacion])

    const isLoading = isLoadingPlanes || isLoadingEquipos
    const error = errorPlanes || errorEquipos

    if (isLoading) return <PageLoading title="Equipos" />
    if (!equipos || error) return <PageError title="Equipos" message="Ocurrió un error al cargar los equipos y sus planes de calibración" />

    const columns: TableColumn<FilaEquipo>[] = [
        { name: "Equipo", maxWidth: '200px', center: true, selector: (row) => row.equipo.nombre, grow: 2 },
        { name: "Categoría", maxWidth: '150px', selector: (row) => row.equipo.categoria, center: true },
        { name: "Ubicación", maxWidth: '150px', center: true, selector: (row) => row.equipo.ubicacion, grow: 2 },
        {
            name: "Próxima calibración",
            center: true,
            selector: (row) => row.plan?.proxima_fecha ?? "",
            cell: (row) => {
                if (!row.plan || !row.plan.estado) return <span className="text-muted">Sin plan de calibración</span>
                return <span>{row.plan.proxima_fecha ? row.plan.proxima_fecha.split("-").reverse().join("/") : "Sin definir"}</span>
            },
        },
        {
            name: "Estado",
            center: true,
            cell: (row) => <EstadoVencimiento estado={row.estadoVencimiento} />,
        },
        {
            name: "Acciones",
            center: true,
            minWidth: '150px',
            cell: (row) => {
                if (!currentUser?.administrar) return null
                return row.plan ? (
                    <ActionButton
                        variant="outline-primary"
                        size="sm"
                        tooltip="Editar plan"
                        icon="bi bi-pencil"
                        onClick={() => navigate(`/planes-calibracion/${row.plan!.id}/edit`)}
                    />
                ) : (
                    <ActionButton
                        variant="outline-success"
                        size="sm"
                        tooltip="Nuevo plan de calibración"
                        icon="bi bi-plus-circle"
                        onClick={() => navigate("/planes-calibracion/new")}
                    />
                )
            },
        },
    ]

    return (
        <AppTable
            columns={columns}
            data={filas}
        />
    )
}
