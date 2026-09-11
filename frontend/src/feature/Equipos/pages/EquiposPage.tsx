import { useState } from "react";
import { mutate } from 'swr';
import { Alert, Button, Col, Container, OverlayTrigger, Row, Spinner, Tooltip } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { type TableColumn } from 'react-data-table-component';

import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { useApi } from '../../../hooks/useApi';

 import { DeleteEquipoModal } from '../components/DeleteEquipoModal'; 
import type { Equipo } from "./types";

export function EquiposPage() {
    const navigate = useNavigate();
    const { data: equipos, error, isLoading } = useApi<Equipo[]>("/equipos")
    const [equipoToDelete, setEquipoToDelete] = useState<Equipo | null>(null);
    
    if (isLoading) return (
        <>
            <PageHeader title="Listado de Equipos" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </>
    )
    if (!equipos || error) return (
        <Container>
            <PageHeader title="Listado de Equipos" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar los Equipos</Alert>
                </Col>
            </Row>
        </Container>
    )

    const columns: TableColumn<Equipo>[] = [
        {
            name: "ID",
            selector: row => row.id,
            sortable: true,
            center: true,
            maxWidth: "60px",
        },
        {
            name: "Nombre",
            selector: row => row.nombre,
            sortable: true,
            grow: 2,
        },
        {
            name: "Categoría",
            selector: row => row.categoria,
            sortable: true,
            grow: 2,
        },
        {
            name: "Ubicación",
            selector: row => row.ubicacion,
            sortable: true,
            grow: 2,
        },
        {
            name: "Estado",
            selector: row => row.estado ? "Activo" : "Inactivo",
            sortable: true,
            center: true,
        },
        {
            name: "Acciones",
            center: true,
            minWidth: "220px",
            cell: (row) => (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => navigate(`/equipos/${row.id}/edit`)}
                >
                <i className="bi bi-pencil me-1"></i>Editar
                </Button>

                <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => setEquipoToDelete(row)}
                >
                    <i className="bi bi-trash3 me-1"></i>Eliminar
                </Button>
            </div>
            ),
        },
    ];

    return (
        <Container>
            <Row className="p-2">
                <Col xs lg="11">
                    <PageHeader title="Listado de Equipos" />
                </Col>
                <Col>
                    <OverlayTrigger
                        placement="left"
                        delay={{ show: 250, hide: 400 }}
                        overlay={(props) => (
                            <Tooltip id="button-tooltip" {...props}>
                                Agregar Equipo
                            </Tooltip>
                        )}
                    >   
                        <Button size="lg" onClick={() => navigate("/equipos/new")}>+</Button>
                    </OverlayTrigger>

                </Col>
            </Row>
            <AppTable columns={columns} data={equipos} />
            <DeleteEquipoModal
                equipo={equipoToDelete}
                onHide={() => setEquipoToDelete(null)}
                onDeleted={() => mutate("/equipos")}
            />
            
        </Container>
    );
}