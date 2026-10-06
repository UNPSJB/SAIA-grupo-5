import { useMemo } from "react"
import { Table } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import type { ExpanderComponentProps, TableColumn } from "react-data-table-component"
import { AppTable } from "../../../components/AppTable"
import { PageLoading } from "../../../components/PageLoading"
import { PageError } from "../../../components/PageError"
import { ActionButton } from "../../../components/ActionButton"
import { useApi } from "../../../hooks/useApi"
import type { Persona } from "../../Personal/types"
import { calcularEstadoVencimientos, ESTADO_VENCIMIENTOS_ORDEN, type VencimientoPersonal } from "../../VencimientoPersonal/types"
import { estilosFilaPorEstado, type EstadoVencimientos } from "../lib/estado"
import { EstadoBadge } from "./EstadoBadge"

type GrupoPersona = {
    persona: Persona
    vencimientos: VencimientoPersonal[]
    estado: EstadoVencimientos
}

function DetalleVencimientos({ data }: ExpanderComponentProps<GrupoPersona>) {
    return (
        <div className="p-3">
            <Table size="sm" bordered responsive className="mb-0">
                <thead>
                    <tr>
                        <th>Tipo de Vencimiento</th>
                        <th>Vencimiento</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {data.vencimientos.map((vencimiento) => (
                        <tr key={vencimiento.id}>
                            <td>{vencimiento.tipo_vencimiento.nombre}</td>
                            <td>{vencimiento.fecha_hasta.split("-").reverse().join("/")}</td>
                            <td>
                                <EstadoBadge estado={vencimiento.dias_restantes <= 0 ? "vencido" : "proximo"} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    )
}

export function PersonalTab({ diasAntelacion }: { diasAntelacion: number }) {
    const navigate = useNavigate()
    const { data: vencimientos, error, isLoading } = useApi<VencimientoPersonal[]>("/vencimiento-personal/")

    const grupos = useMemo<GrupoPersona[]>(() => {
        if (!Array.isArray(vencimientos)) return []
        const porPersona = new Map<number, VencimientoPersonal[]>()
        vencimientos.forEach((vencimiento) => {
            const lista = porPersona.get(vencimiento.persona_id) ?? []
            lista.push(vencimiento)
            porPersona.set(vencimiento.persona_id, lista)
        })
        return Array.from(porPersona.values())
            .map((lista) => ({
                persona: lista[0].persona,
                vencimientos: lista,
                estado: calcularEstadoVencimientos(lista, diasAntelacion),
            }))
            .sort((a, b) => ESTADO_VENCIMIENTOS_ORDEN[a.estado] - ESTADO_VENCIMIENTOS_ORDEN[b.estado])
    }, [vencimientos, diasAntelacion])

    if (isLoading) return <PageLoading title="Personal" />
    if (!vencimientos || error) return <PageError title="Personal" message="Ocurrió un error al cargar los vencimientos de personal" />

    const columns: TableColumn<GrupoPersona>[] = [
        {
            name: "Persona",
            selector: (row) => `${row.persona.nombre} ${row.persona.apellido}`,
            grow: 2,
        },
        {
            name: "Estado",
            center: true,
            cell: (row) => <EstadoBadge estado={row.estado} />,
        },
        {
            name: "Acciones",
            center: true,
            cell: (row) => (
                <ActionButton
                    variant="outline-secondary"
                    size="sm"
                    tooltip="Ver vencimientos"
                    icon="bi-calendar-check"
                    onClick={() => navigate(`/personal/${row.persona.id}/vencimientos`)}
                />
            ),
        },
    ]

    return (
        <AppTable
            columns={columns}
            data={grupos}
            expandableRows
            expandableRowsComponent={DetalleVencimientos}
            conditionalRowStyles={estilosFilaPorEstado<GrupoPersona>((row) => row.estado)}
        />
    )
}
