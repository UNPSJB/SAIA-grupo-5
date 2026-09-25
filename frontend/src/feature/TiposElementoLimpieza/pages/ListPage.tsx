import { useMemo, useState } from "react";
import { mutate } from "swr";
import { Alert, Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { type TableColumn } from "react-data-table-component";

import { AppTable } from "../../../components/AppTable";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";

import { DeleteTipoElementoModal } from "../components/DeleteTipoElementoModal";
import type { TipoElementoLimpieza } from "../types";

export function TiposElementoLimpiezaPage() {
    const navigate = useNavigate();
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

    if (isLoading) return (
        <>
            <PageHeader title="Tipos de Elementos de Limpieza" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </>
    );

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

    const columns: TableColumn<TipoElementoLimpieza>[] = [
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
        {
            name: "Acciones",
            center: true,
            minWidth: "320px",
            cell: row => (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

                    <Button
                        variant="outline-primary"
                        size="sm"
                        disabled={!row.estado}
                        onClick={() => navigate(`/tipos-elementos-limpieza/${row.id}/edit`)}
                    >
                        <i className="bi bi-pencil me-1"></i>
                        Editar
                    </Button>

                    {row.estado && (
                        <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => setTipoToDelete(row)}
                        >
                            <i className="bi bi-trash3 me-1"></i>
                            Eliminar
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <Container>
            <Row className="p-2" align-items-center>
                <Col>
                    <PageHeader title="Tipos de Elementos de Limpieza" />
                </Col>

                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>

                <Col xs="auto" className="d-flex justify-content-end">
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate("/tipos-elementos-limpieza/new")}
                    >
                        + Nuevo Tipo
                    </Button>
                </Col>
            </Row>

            <AppTable
                columns={columns}
                data={filteredTipos}
            />

            <DeleteTipoElementoModal
                tipoElementoLimpieza={tipoToDelete}
                onHide={() => setTipoToDelete(null)}
                onDeleted={() => mutate("/elementos-limpieza/tipos")}
            />
        </Container>
    );
}