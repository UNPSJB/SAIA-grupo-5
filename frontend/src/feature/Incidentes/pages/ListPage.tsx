import { useMemo, useState } from "react";
import { Col, Container, Form, Row } from "react-bootstrap";
import { type TableColumn } from "react-data-table-component";
import { mutate } from "swr";

import { AppTable } from "../../../components/AppTable";
import { PageHeader } from "../../../components/PageHeader";
import { PageLoading } from "../../../components/PageLoading";
import { PageError } from "../../../components/PageError";
import { ActionButton } from "../../../components/ActionButton";
import { useApi } from "../../../hooks/useApi";
import { useAuth } from "../../../hooks/useAuth";
import { AccionCorrectivaModal } from "../components/AccionCorrectivaModal";
import { ReabrirIncidenteModal } from "../components/ReabrirIncidenteModal";
import { HistorialIncidenteModal } from "../components/HistorialIncidenteModal";
import type { Incidente } from "../types";

export function ListPage() {
    const { currentUser } = useAuth();
    const [search, setSearch] = useState("");
    const [incidenteParaAccionCorrectiva, setIncidenteParaAccionCorrectiva] = useState<Incidente | null>(null);
    const [incidenteParaReabrir, setIncidenteParaReabrir] = useState<Incidente | null>(null);
    const [incidenteParaHistorial, setIncidenteParaHistorial] = useState<Incidente | null>(null);

    const { data: incidentes, error, isLoading } = useApi<Incidente[]>("/incidentes/");

    const filteredIncidentes = useMemo(() => {
        if (!Array.isArray(incidentes)) return [];
        const busqueda = search.toLowerCase();
        return incidentes.filter((incidente) => {
            const operarioNombre = `${incidente.operario.nombre} ${incidente.operario.apellido}`.toLowerCase();
            return (
                incidente.nombre.toLowerCase().includes(busqueda) ||
                incidente.descripcion.toLowerCase().includes(busqueda) ||
                incidente.tipo.nombre.toLowerCase().includes(busqueda) ||
                (incidente.sector?.nombre ?? "").toLowerCase().includes(busqueda) ||
                operarioNombre.includes(busqueda)
            );
        });
    }, [search, incidentes]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                type="text"
                placeholder="Buscar incidente..."
                className="mr-sm-2"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
        );
    }, []);

    if (isLoading) return <PageLoading title="Listado de Incidentes" />;

    if (!incidentes || error) return (
        <PageError title="Listado de Incidentes" message="Ocurrió un error al cargar los incidentes" />
    );

    const columns: TableColumn<Incidente>[] = [
        {
            name: "Nombre",
            selector: (row) => row.nombre,
            sortable: true,
            center: true,
            grow: 2,
        },
        {
            name: "Tipo",
            selector: (row) => row.tipo.nombre,
            sortable: true,
            center: true,
        },
        {
            name: "Sector",
            selector: (row) => row.sector?.nombre ?? "-",
            sortable: true,
            center: true,
        },
        {
            name: "Operario",
            selector: (row) => `${row.operario.nombre} ${row.operario.apellido}`,
            sortable: true,
            center: true,
            grow: 1.5,
        },
        {
            name: "Fecha Apertura",
            selector: (row) => row.fecha_abierto,
            sortable: true,
            center: true,
            cell: (row) => <span>{new Date(row.fecha_abierto).toLocaleDateString("es-AR")}</span>,
        },
        {
            name: "Estado",
            selector: (row) => row.estado,
            sortable: true,
            center: true,
            cell: (row) => (
                <div
                    style={{
                        padding: "4px 12px",
                        borderRadius: "16px",
                        background: row.estado === "Abierto" ? "#fef3c7" : "#dcfce7",
                        color: row.estado === "Abierto" ? "#92400e" : "#166534",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                    }}
                >
                    {row.estado}
                </div>
            ),
        },
        {
            name: "Acciones",
            center: true,
            minWidth: "120px",
            cell: (row) => (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <ActionButton
                        variant="outline-secondary"
                        size="sm"
                        tooltip="Ver historial"
                        icon="bi-clock-history"
                        onClick={() => setIncidenteParaHistorial(row)}
                    />
                    {currentUser?.administrar && (
                        <>
                            <ActionButton
                                variant="outline-success"
                                size="sm"
                                tooltip="Acción correctiva"
                                icon="bi-clipboard-check"
                                disabled={row.estado === "Cerrado"}
                                onClick={() => setIncidenteParaAccionCorrectiva(row)}
                            />
                            <ActionButton
                                variant="outline-warning"
                                size="sm"
                                tooltip="Reabrir incidente"
                                icon="bi-arrow-counterclockwise"
                                disabled={row.estado === "Abierto"}
                                onClick={() => setIncidenteParaReabrir(row)}
                            />
                        </>
                    )}
                </div>
            ),
        },
    ];

    return (
        <Container>
            <Row className="p-2 align-items-center">
                <Col>
                    <PageHeader title="Listado de Incidentes" />
                </Col>
                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>
            </Row>

            <AppTable columns={columns} data={filteredIncidentes} />

            <AccionCorrectivaModal
                incidente={incidenteParaAccionCorrectiva}
                onHide={() => setIncidenteParaAccionCorrectiva(null)}
                onRegistrada={() => mutate("/incidentes/")}
            />

            <ReabrirIncidenteModal
                incidente={incidenteParaReabrir}
                onHide={() => setIncidenteParaReabrir(null)}
                onReabierto={() => mutate("/incidentes/")}
            />

            <HistorialIncidenteModal
                incidente={incidenteParaHistorial}
                onHide={() => setIncidenteParaHistorial(null)}
            />
        </Container>
    );
}
