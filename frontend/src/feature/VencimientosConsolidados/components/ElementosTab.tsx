import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { TableColumn } from "react-data-table-component"
import { AppTable } from "../../../components/AppTable"
import { PageLoading } from "../../../components/PageLoading"
import { PageError } from "../../../components/PageError"
import { ActionButton } from "../../../components/ActionButton"
import { useApi } from "../../../hooks/useApi"
import { useAuth } from "../../../hooks/useAuth"
import type { ElementoLimpieza } from "../../ElementosLimpieza/types"
import { Col, Form, Row } from "react-bootstrap";
import { ListFilter } from "../../../components/ListFilter";
import { clasificarPorDiasRestantes, FILTRO_VENCIMIENTOS_LABELS, type FiltroVencimientos } from "../utils/estado";

const FILTRO_LABELS = {
    todos: FILTRO_VENCIMIENTOS_LABELS.todos,
    vencido: FILTRO_VENCIMIENTOS_LABELS.vencido,
    proximo: FILTRO_VENCIMIENTOS_LABELS.proximo,
    vigente: FILTRO_VENCIMIENTOS_LABELS.vigente,
};

function celdaEstadoVencimiento(diasRestantes: number | null, diasAntelacion: number) {
    if (diasRestantes === null) {
        return <span>Sin definir</span>
    }

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

export function ElementosTab({ diasAntelacion }: { diasAntelacion: number }) {
    const navigate = useNavigate()
    const { currentUser } = useAuth()
    const { data: elementos, error, isLoading } = useApi<ElementoLimpieza[]>("/elementos-limpieza/")
    const [search, setSearch] = useState("");
    const [estadoFiltro, setEstadoFiltro] = useState<FiltroVencimientos>("todos");

    const ordenados = useMemo(() => {
        if (!Array.isArray(elementos)) return [];

        const busqueda = search.toLowerCase();

        return elementos
            .filter((elemento) => {
                const coincideBusqueda =
                    elemento.codigo.toLowerCase().includes(busqueda) ||
                    elemento.nombre.toLowerCase().includes(busqueda) ||
                    (elemento.ubicacion ?? "").toLowerCase().includes(busqueda);

                const coincideEstado =
                    estadoFiltro === "todos" ||
                    (elemento.dias_restantes !== null &&
                        clasificarPorDiasRestantes(
                            elemento.dias_restantes,
                            diasAntelacion
                        ) === estadoFiltro);

                return elemento.estado && coincideBusqueda && coincideEstado;
            })
            .sort((a, b) =>
                (a.dias_restantes ?? Infinity) - (b.dias_restantes ?? Infinity)
            );
    }, [elementos, search, estadoFiltro, diasAntelacion]);

    if (isLoading) return <PageLoading title="Elementos de Limpieza" />
    if (!elementos || error) return <PageError title="Elementos de Limpieza" message="Ocurrió un error al cargar los elementos de limpieza" />

    const columns: TableColumn<ElementoLimpieza>[] = [
        { name: "Código", maxWidth: '200px',selector: (row) => row.codigo, sortable: true, center: true, minWidth: "110px" },
        { name: "Nombre", maxWidth: '200px', selector: (row) => row.nombre, sortable: true, center: true, grow: 2 },
        { name: "Ubicación", maxWidth: '250px', selector: (row) => row.ubicacion ?? "-", sortable: true, center: true, grow: 2 },
        {
            name: "Estado",
            selector: (row) => row.dias_restantes ?? Infinity,
            sortable: true,
            center: true,
            minWidth: '190px',
            cell: (row) => celdaEstadoVencimiento(row.dias_restantes, diasAntelacion),
        },
        {
            name: "Acciones",
            center: true,
            minWidth: '150px',
            maxWidth: '250px',
            cell: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ActionButton
                        variant="outline-info"
                        size="sm"
                        tooltip="Ver elemento"
                        icon="bi bi-eye"
                        onClick={() => navigate(`/elementos-limpieza/${row.id}`, { state: { origen: "vencimiento" }})}
                    />
                    {currentUser?.administrar && (
                        <ActionButton
                            variant="outline-success"
                            size="sm"
                            tooltip="Recambio"
                            icon="bi bi-arrow-repeat"
                            onClick={() => navigate(`/recambios-elementos-limpieza/new/${row.id}`)}
                        />
                    )}
                </div>
            ),
        },
    ]

    return (
        <>
            <Row className="mb-3 g-2 justify-content-end">
                <Col xs="auto">
                    <Form.Control
                        type="text"
                        placeholder="Buscar elemento..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </Col>

                <Col xs="auto">
                    <ListFilter
                        value={estadoFiltro}
                        options={FILTRO_LABELS}
                        onChange={(value) => setEstadoFiltro(value as FiltroVencimientos)}
                    />
                </Col>
            </Row>

            <AppTable
                columns={columns}
                data={ordenados}
            />
        </>
    );
}
