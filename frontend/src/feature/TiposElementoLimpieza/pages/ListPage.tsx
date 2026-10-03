import { useMemo, useState } from "react";
import { mutate } from "swr";
import { Alert, Button, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { type TableColumn } from "react-data-table-component";

import { AppTable } from "../../../components/AppTable";
import { PageHeader } from "../../../components/PageHeader";
import { PageLoading } from "../../../components/PageLoading";
import { ActionButton } from "../../../components/ActionButton";
import { useApi } from "../../../hooks/useApi";
import { useAuth } from "../../../hooks/useAuth";

import { EstadoTipoElementoModal } from "../components/DeleteTipoElementoModal";
import type { TipoElementoLimpieza } from "../types";

export function TiposElementoLimpiezaPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [search, setSearch] = useState("");
    const [tipoToDelete, setTipoToDelete] = useState<TipoElementoLimpieza | null>(null);

    const { data: tipos, error, isLoading } = useApi<TipoElementoLimpieza[]>("/elementos-limpieza/tipos");

    const filteredTipos = useMemo(() => {
        if (!Array.isArray(tipos)) return [];

        const busqueda = search.toLowerCase();

        return tipos.filter((tipo) =>
            tipo.nombre.toLowerCase().includes(busqueda) ||
            tipo.prefijo.toLowerCase().includes(busqueda)
        );
    }, [search, tipos]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                type="text"
                placeholder="Buscar tipo..."
                className="mr-sm-2"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
        );
    }, []);

    if (isLoading) return <PageLoading title="Tipos de Elementos de Limpieza" />;

    if (!tipos || error) return (
        <Container>
            <PageHeader title="Tipos de Elementos de Limpieza" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">
                        Ocurrió un error al cargar los tipos de elementos
                    </Alert>
                </Col>
            </Row>
        </Container>
    );

    const baseColumns: TableColumn<TipoElementoLimpieza>[] = [
        {
            name: "Nombre",
            selector: row => row.nombre,
            sortable: true,
            center: true,
        },
        {
            name: "Prefijo",
            selector: row => row.prefijo,
            sortable: true,
            center: true,
        },
        {
            name: "Estado",
            selector: row => row.estado ? "Activo" : "Inactivo",
            sortable: true,
            center: true,
            cell: row => (
                <div
                    style={{
                        padding: "4px 12px",
                        borderRadius: "16px",
                        background: row.estado ? "#dcfce7" : "#fee2e2",
                        color: row.estado ? "#166534" : "#991b1b",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                    }}
                >
                    {row.estado ? "Activo" : "Inactivo"}
                </div>
            ),
        },
    ];
    const columns: TableColumn<TipoElementoLimpieza>[] = currentUser?.administrar
        ? [
            ...baseColumns,
            {
                name: "Acciones",
                center: true,
                minWidth: "220px",
                cell: row => (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        {row.estado && (
                            <ActionButton
                                variant="outline-primary"
                                size="sm"
                                tooltip="Editar"
                                icon="bi-pencil"
                                onClick={() => navigate(`/tipos-elementos-limpieza/${row.id}/edit`)}
                            />
                        )}

                        <ActionButton
                            variant={row.estado ? "outline-danger" : "outline-success"}
                            size="sm"
                            tooltip={row.estado ? "Dar de baja" : "Dar de alta"}
                            icon={row.estado ? "bi-dash-circle" : "bi-check-circle"}
                            onClick={() => setTipoToDelete(row)}
                        />
                    </div>
                ),
            },
        ]
        : baseColumns;

    return (
        <Container>
            <Row className="p-2 align-items-center">
                <Col>
                    <PageHeader title="Tipos de Elementos de Limpieza" />
                </Col>

                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>

                {currentUser?.administrar && (
                    <Col xs="auto" className="d-flex justify-content-end">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate("/tipos-elementos-limpieza/new")}
                        >
                            + Nuevo Tipo
                        </Button>
                    </Col>
                )}
            </Row>

            <AppTable
                columns={columns}
                data={filteredTipos}
            />

            <EstadoTipoElementoModal
                tipoElementoLimpieza={tipoToDelete}
                onHide={() => setTipoToDelete(null)}
                onDeleted={() => mutate("/elementos-limpieza/tipos")}
            />
        </Container>
    );
}