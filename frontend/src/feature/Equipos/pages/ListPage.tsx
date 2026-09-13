import { useState, useMemo} from "react";
import { mutate } from 'swr';
import { Alert, Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { type TableColumn } from 'react-data-table-component';

import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { useApi } from '../../../hooks/useApi';

 import { DeleteEquipoModal } from '../components/DeleteEquipoModal'; 
import type { Equipo } from "../types";

export function EquiposPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const { data: equipos, error, isLoading } = useApi<Equipo[]>("/equipos")
    const [equipoToDelete, setEquipoToDelete] = useState<Equipo | null>(null);
    
    const filteredInsumos = useMemo(() => {
        if (!Array.isArray(equipos)) return [];
        return (equipos ?? []).filter((equipo) => {
            return (
                equipo.nombre.toLowerCase().includes(search.toLowerCase()) ||
                equipo.categoria.toLowerCase().includes(search.toLowerCase()) ||
                equipo.ubicacion.toLowerCase().includes(search.toLowerCase())
            );
        });
    }, [search, equipos]);
    
    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                type="text"
                placeholder="Buscar equipo..."
                className=" mr-sm-2"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
        );
    }, [search]);

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
            center: true,
            grow: 2,
        },
        {
            name: "Categoría",
            selector: row => row.categoria,
            sortable: true,
            center: true,
            grow: 2,
        },
        {
            name: "Ubicación",
            selector: row => row.ubicacion,
            sortable: true,
            center: true,
            grow: 2,
        },
        {
            name: 'Estado',
            selector: row => row.estado ? 'Activo' : 'Inactivo',
            sortable: true,
            center: true,
            cell: row => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10}}>
                    <div
                        style={{
                            padding: '4px 12px',
                            borderRadius: '16px',
                            background: row.estado ? '#dcfce7' : '#fee2e2',
                            color: row.estado ? '#166534' : '#991b1b',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {row.estado ? 'Activo' : 'Inactivo'}
                    </div>
                </div>
            )
        },
        {
            name: "Acciones",
            center: true,
            minWidth: "220px",
            cell: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/equipos/${row.id}/edit`)}
                    >
                        <i className="bi bi-pencil me-1"></i>Editar
                    </Button>

                    {row.estado && (
                    <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => setEquipoToDelete(row)}
                    >
                        <i className="bi bi-trash3 me-1"></i>Eliminar
                    </Button>
                    )}
                </div>
            )
        },
    ];

    return (
        <Container>
            <Row className="p-2" align-items-center>
                <Col>
                    <PageHeader title="Listado de Equipos" />
                </Col>
                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>
                <Col xs="auto" className="d-flex justify-content-end">
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate("/equipos/new")}     
                        style={{whiteSpace: "nowrap"}}               
                    >
                        + Nuevo Equipo
                    </Button>
                </Col>
            </Row>
            <AppTable columns={columns} data={filteredInsumos} />
            <DeleteEquipoModal
                equipo={equipoToDelete}
                onHide={() => setEquipoToDelete(null)}
                onDeleted={() => mutate("/equipos")}
            />
            
        </Container>
    );
}