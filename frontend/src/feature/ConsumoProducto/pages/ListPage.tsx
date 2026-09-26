import { useState, useMemo} from "react";
import { mutate } from 'swr';
import { Alert, Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { type TableColumn } from 'react-data-table-component';

import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { useApi } from '../../../hooks/useApi';

import { DeleteConsumoProductoModal } from '../components/DeleteConsumoProductoModal'; 
import type { ConsumoProducto } from "../types";

export function ListPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [search, setSearch] = useState('');
    const { data: consumos, error, isLoading } = useApi<ConsumoProducto[]>(`/consumos-productos/tarea/${id}`)
    const [consumoProductoToDelete, setConsumoProductoToDelete] = useState<ConsumoProducto | null>(null);
    
    const filteredConsumos = useMemo(() => {
        if (!Array.isArray(consumos)) return [];
        return (consumos ?? []).filter((consumo) => {
            return (
                consumo.insumo.nombre.toLowerCase().includes(search.toLowerCase()) ||
                consumo.cantidad_aproximada.toString().includes(search)
            );
        });
    }, [search, consumos]);
    
    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                type="text"
                placeholder="Buscar consumo..."
                className=" mr-sm-2"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
        );
    }, [search]);
    
    if (isLoading) return (
        <>
            <PageHeader title="Insumos químicos utilizados en la tarea" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </>
    )
    if (!consumos || error) return (
        <Container>
            <PageHeader title="Insumos químicos utilizados en la tarea" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar los Consumos</Alert>
                </Col>
            </Row>
        </Container>
    )

    const columns: TableColumn<ConsumoProducto>[] = [
        {
            name: "Insumo Químico",
            selector: row => row.insumo.nombre,
            sortable: true,
            center: true,
            grow: 2,
        },
        {
            name: "Cantidad",
            selector: row => row.cantidad_aproximada,
            sortable: true,
            center: true,
            grow: 1,

            cell: row => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span>
                        {row.cantidad_aproximada}
                    </span>

                    <div
                        style={{
                            padding: '4px 12px',
                            borderRadius: '16px',
                            background: '#dbeafe',
                            color: '#1d4ed8',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            whiteSpace: 'nowrap',
                        }}      // Se modifico para poder poner las unidades de medida con los nombres completos y que se vean bien
                    >
                        {row.unidad_medida}
                    </div>
                </div>
            ),
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
            minWidth: "50px",
            cell: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        disabled={!row.estado}      // Si no esta activo se muestra en gris y no se puede editar
                        onClick={() => navigate(`/consumos-productos/${row.id}/edit`)}
                    >
                        <i className="bi bi-pencil me-1"></i>Editar
                    </Button>
                    <Button
                        variant={row.estado ? 'outline-danger' : 'outline-success'}
                        size="sm"
                        onClick={() => setConsumoProductoToDelete(row)}
                    >
                        <i className={`bi ${row.estado ? 'bi-dash-circle' : 'bi-check-circle'} me-1`}></i>
                        {row.estado ? 'Dar de baja' : 'Dar de alta'}
                    </Button>
                </div>
            )
        },
    ];

    return (
        <Container>
            <Row className="p-2 align-items-center">
                <Col>
                    <PageHeader title="Insumos químicos utilizados en la tarea" />
                </Col>
                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>
                <Col xs="auto" className="d-flex justify-content-end">
                    <Button
                        variant="primary"
                        size='sm'
                        onClick={() => navigate(`/consumos-productos/new?tareaId=${id}`)}
                        style={{ whiteSpace: "nowrap" }}
                    >
                        + Nuevo Insumo
                    </Button>
                </Col>
            </Row>
            <AppTable columns={columns} data={filteredConsumos} />
            <Row>
                <Col xs="auto">
                    <Button variant="secondary" size="sm" className="px-3" 
                        onClick={() => navigate('/tareas')}
                    >
                        <i className="bi bi-arrow-left"></i> Volver
                    </Button>
                </Col>
            </Row>
            <DeleteConsumoProductoModal
                consumoProducto={consumoProductoToDelete}
                onHide={() => setConsumoProductoToDelete(null)}
                onDeleted={() => mutate(`/consumos-productos/tarea/${id}`)}
            />
        </Container>
    );
    
}