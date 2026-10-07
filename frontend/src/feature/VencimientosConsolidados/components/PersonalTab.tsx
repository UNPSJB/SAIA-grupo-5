import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { mutate } from "swr"
import type { TableColumn } from "react-data-table-component"
import { AppTable } from "../../../components/AppTable"
import { PageLoading } from "../../../components/PageLoading"
import { PageError } from "../../../components/PageError"
import { ActionButton } from "../../../components/ActionButton"
import { useApi } from "../../../hooks/useApi"
import { useAuth } from "../../../hooks/useAuth"
import { RenovarVencimientoModal } from "../../VencimientoPersonal/components/RenovarVencimientoModal"
import { HistoricoVencimientoModal } from "../../VencimientoPersonal/components/HistoricoVencimientoModal"
import type { VencimientoPersonal } from "../../VencimientoPersonal/types"

const RUTA_VOLVER = "/vencimientos?default=personal"

function celdaEstadoVencimiento(diasRestantes: number, diasAntelacion: number) {
    const vencido = diasRestantes <= 0;
    const proximo = diasRestantes > 0 && diasRestantes <= diasAntelacion;
    const badge = vencido ? '#fee2e2' : proximo ? '#fef3c7' : '#dcfce7';
    const color = vencido ? '#991b1b' : proximo ? '#92400e' : '#166534';
    const texto = vencido
        ? `Vencido (${Math.abs(diasRestantes)} dias)`
        : proximo
        ? `Proximo a vencer (${diasRestantes} dias)`
        : `Vigente (${diasRestantes} dias)`;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
                style={{
                    padding: '4px 12px',
                    borderRadius: '16px',
                    background: badge,
                    color: color,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    whiteSpace: 'nowrap',
                }}
            >
                {texto}
            </div>
        </div>
    );
}

export function PersonalTab({ diasAntelacion }: { diasAntelacion: number }) {
    const navigate = useNavigate()
    const { currentUser } = useAuth()
    const { data: vencimientos, error, isLoading } = useApi<VencimientoPersonal[]>("/vencimiento-personal/")
    const [vencimientoToRenovar, setVencimientoToRenovar] = useState<VencimientoPersonal | null>(null)
    const [vencimientoHistorico, setVencimientoHistorico] = useState<VencimientoPersonal | null>(null)

    const ordenados = useMemo(() => {
        if (!Array.isArray(vencimientos)) return []
        return [...vencimientos].sort((a, b) => a.dias_restantes - b.dias_restantes)
    }, [vencimientos])

    if (isLoading) return <PageLoading title="Personal" />
    if (!vencimientos || error) return <PageError
        title="Personal"
        message="Ocurrió un error al cargar los vencimientos de personal"
    />

    const columns: TableColumn<VencimientoPersonal>[] = [
        {
            name: "Persona",
            selector: (row) => `${row.persona.nombre} ${row.persona.apellido}`,
            sortable: true,
            center: true,
            grow: 1.2,
        },
        {
            name: "Tipo de Vencimiento",
            selector: (row) => row.tipo_vencimiento.nombre,
            sortable: true,
            center: true,
            grow: 1.2,
            cell: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                        style={{
                            padding: '4px 12px',
                            borderRadius: '16px',
                            background: '#00d9ff5b',
                            color: '#000294',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {row.tipo_vencimiento.nombre}
                    </div>
                </div>
            ),
        },
        {
            name: "Fecha Desde",
            selector: (row) => row.fecha_desde.split("-").reverse().join("/"),
            sortable: true,
            center: true,
            grow: 0.6,
        },
        {
            name: "Fecha Hasta",
            selector: (row) => row.fecha_hasta.split("-").reverse().join("/"),
            sortable: true,
            center: true,
            grow: 0.6,
        },
        {
            name: "Estado",
            selector: (row) => row.dias_restantes,
            sortable: true,
            center: true,
            minWidth: '190px',
            grow: 1,
            cell: (row) => celdaEstadoVencimiento(row.dias_restantes, diasAntelacion),
        },
        {
            name: "Acciones",
            center: true,
            minWidth: '190px',
            grow: 0.2,
            cell: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ActionButton
                        variant="outline-info"
                        size="sm"
                        tooltip="Ver vencimiento"
                        icon="bi bi-eye"
                        onClick={() => navigate(`/vencimiento-personal/${row.id}`, { state: { rutaVolver: RUTA_VOLVER } })}
                    />

                    <ActionButton
                        variant="outline-warning"
                        size="sm"
                        tooltip="Historico"
                        icon="bi bi-clock-history"
                        onClick={() => setVencimientoHistorico(row)}
                    />
                    {currentUser?.administrar && (
                        <>
                            <ActionButton
                                variant="outline-primary"
                                size="sm"
                                tooltip="Editar"
                                icon="bi bi-pencil"
                                disabled={!row.persona?.activo}
                                onClick={() => navigate(`/vencimiento-personal/${row.id}/edit`, { state: { rutaVolver: RUTA_VOLVER } })}
                            />
                            <ActionButton
                                variant="outline-success"
                                size="sm"
                                tooltip="Renovar"
                                icon="bi bi-arrow-repeat"
                                disabled={!row.persona?.activo}
                                onClick={() => setVencimientoToRenovar(row)}
                            />
                        </>
                    )}
                </div>
            ),
        },
    ]

    return (
        <>
            <AppTable
                columns={columns}
                data={ordenados}
            />
            <RenovarVencimientoModal
                vencimiento={vencimientoToRenovar}
                onHide={() => setVencimientoToRenovar(null)}
                onRenovado={() => mutate("/vencimiento-personal/")}
            />
            <HistoricoVencimientoModal
                vencimiento={vencimientoHistorico}
                onHide={() => setVencimientoHistorico(null)}
            />
        </>
    )
}
