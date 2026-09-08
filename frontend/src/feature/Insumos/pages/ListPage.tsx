import { useState } from 'react';
import { mutate } from 'swr';
import { Alert, Button, Col, Container, OverlayTrigger, Row, Spinner, Tooltip } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { type TableColumn } from 'react-data-table-component';

import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { useApi } from '../../../hooks/useApi';

import { DeleteInsumoModal } from '../components/DeleteInsumoModal';
import type { Insumo } from '../types';


export function ListPage() {
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el insumo
    const { data: insumos, error, isLoading } = useApi<Insumo[]>("/insumos/")
    const [insumoToDelete, setInsumoToDelete] = useState<Insumo | null>(null);


    if (isLoading) return (
        <>
            <PageHeader title="Listado de Insumos" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </>
    )
    if (!insumos || error) return (
        <Container>
            <PageHeader title="Listado de Insumos" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar Insumos</Alert>
                </Col>
            </Row>
        </Container>
    )

    const columns: TableColumn<Insumo>[] = [
        {
            name: "ID",
            selector: row => row.id,
            sortable: true,
            center: true,
            maxWidth: '160px'
        },
        {
            name: 'Nombre',
            selector: row => row.nombre,
            sortable: true,
            center: true,
            minWidth: '200px',
            grow: 2,
        },
        {
            name: 'Unidad de medida',
            selector: row => row.unidad_medida,
            sortable: true,
            center: true,
            cell: row => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: '#dbeafe',
                            color: '#1d4ed8',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {row.unidad_medida}
                    </div>
                </div>
            ),
        },
        {
            name: "Acciones",
            cell: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/insumos/${row.id}/edit`)}
                    >
                        editar
                    </Button>
                    <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => setInsumoToDelete(row)}
                    >
                        eliminar
                    </Button>
                </div>
            )
        },
    ];

    return (
        <Container>
            <Row className="p-2">
                <Col xs lg="11">
                    <PageHeader title="Listado de Insumos" />
                </Col>
                <Col>
                    <OverlayTrigger
                        placement="left"
                        delay={{ show: 250, hide: 400 }}
                        overlay={(props) => (
                            <Tooltip id="button-tooltip" {...props}>
                                Agregar Insumo
                            </Tooltip>
                        )}
                    >   
                        <Button size="lg" onClick={() => navigate("/insumos/new")}>+</Button>
                    </OverlayTrigger>

                </Col>
            </Row>
            <AppTable columns={columns} data={insumos} />
            <DeleteInsumoModal
                insumo={insumoToDelete}
                onHide={() => setInsumoToDelete(null)}
                onDeleted={() => mutate("/insumos/")}
            />
        </Container>
    );
}