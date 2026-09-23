import { useMemo, useState } from "react";
import { mutate } from "swr";
import { Alert, Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { type TableColumn } from "react-data-table-component";

import { AppTable } from "../../../components/AppTable";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import { api } from "../../../libs/axios";

import type { ElementoLimpieza, TipoElementoLimpieza } from "../types";


export function ElementosLimpiezaPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const { data: elementos, error, isLoading } = useApi<ElementoLimpieza[]>("/elementos-limpieza");
    const { data: tipos } = useApi<TipoElementoLimpieza[]>("/elementos-limpieza/tipos");

    const obtenerNombreTipo = (tipoId: number) => {
        return tipos?.find((tipo) => tipo.id === tipoId)?.nombre ?? "Sin tipo";
    };

    const filteredElementos = useMemo(() => {
        if (!Array.isArray(elementos)) return [];

        const busqueda = search.toLowerCase();

        return elementos.filter((elemento) => {
            const nombreTipo = obtenerNombreTipo(elemento.tipo_id);

            return (
                elemento.codigo.toLowerCase().includes(busqueda) ||
                elemento.nombre.toLowerCase().includes(busqueda) ||
                nombreTipo.toLowerCase().includes(busqueda) ||
                (elemento.material ?? "").toLowerCase().includes(busqueda) ||
                (elemento.ubicacion ?? "").toLowerCase().includes(busqueda)
            );
        });
    }, [search, elementos, tipos]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                type="text"
                placeholder="Buscar elemento..."
                className="mr-sm-2"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
        );
    }, []);

    if (isLoading) return (
        <>
            <PageHeader title="Elementos de Limpieza" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </>
    );

    if (!elementos || error) return (
        <Container>
            <PageHeader title="Elementos de Limpieza" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">
                        Ocurrió un error al cargar los elementos de limpieza
                    </Alert>
                </Col>
            </Row>
        </Container>
    );

    const columns: TableColumn<ElementoLimpieza>[] = [
        {
            name: "Código",
            selector: row => row.codigo,
            sortable: true,
            center: true,
            minWidth: "110px",
        },
        {
            name: "Nombre",
            selector: row => row.nombre,
            sortable: true,
            center: true,
            grow: 2,
            minWidth: "150px",
        },
        {
            name: "Tipo",
            selector: row => obtenerNombreTipo(row.tipo_id),
            sortable: true,
            center: true,
            grow: 2,
            maxWidth: "80px",
        },
        {
            name: "Ubicación",
            selector: row => row.ubicacion ?? "-",
            sortable: true,
            center: true,
            grow: 2,
        },
        {
            name: "Frecuencia recambio",
            selector: row => row.frecuencia_recambio ?? 0,
            sortable: true,
            center: true,
            minWidth: "200px",
            cell: row => (
                <span>
                    {row.frecuencia_recambio
                        ? `${row.frecuencia_recambio} días`
                        : "Sin definir"}
                </span>
            ),
        },
        {
            name: "Estado",
            selector: row => row.estado ? "Activo" : "Inactivo",
            sortable: true,
            center: true,
            cell: row => (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                        style={{
                            padding: "4px 12px",
                            borderRadius: "16px",
                            background: row.estado ? "#dcfce7" : "#fee2e2",
                            color: row.estado ? "#166534" : "#991b1b",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {row.estado ? "Activo" : "Inactivo"}
                    </div>
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
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => navigate(`/elementos-limpieza/${row.id}`)}
                    >
                        <i className="bi bi-eye me-1"></i>
                        Ver detalle
                    </Button>

                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/elementos-limpieza/${row.id}/edit`)}
                    >
                        <i className="bi bi-pencil me-1"></i>
                        Editar
                    </Button>

                    {row.estado && (
                        <Button
                            variant="outline-danger"
                            size="sm"
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
                    <PageHeader title="Elementos de Limpieza" />
                </Col>

                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>

                <Col xs="auto" className="d-flex justify-content-end">
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate("/elementos-limpieza/new")}
                        style={{ whiteSpace: "nowrap" }}
                    >
                        + Nuevo Elemento
                    </Button>
                </Col>
            </Row>

            <AppTable
                columns={columns}
                data={filteredElementos}
            />
        </Container>
    );
}