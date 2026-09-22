import { useState, useMemo} from "react";
import { mutate } from 'swr';
import { Alert, Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { type TableColumn } from 'react-data-table-component';

import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { useApi } from '../../../hooks/useApi';

import { DeleteConsumoProductoModal } from '../components/DeleteConsumoProductoModal'; 
import { EditarConsumoProductoModal } from '../components/EditarConsumoProductoModal'; 
import type { ConsumoProducto } from "../types";

export function ListPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const { data: consumos, error, isLoading } = useApi<ConsumoProducto[]>("/consumos_productos")
    const [consumoProductoToDelete, setConsumoProductoToDelete] = useState(false);
    const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
    
    const filteredConsumos = useMemo(() => {
        if (!Array.isArray(consumos)) return [];
        return (consumos ?? []).filter((consumo) => {
            return (
                consumo.tarea_id.toString().includes(search) ||
                consumo.insumo.nombre.toLowerCase().includes(search.toLowerCase())
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
            <PageHeader title="Listado de Consumos de Insumos Químicos" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </>
    )
    if (!consumos || error) return (
        <Container>
            <PageHeader title="Listado de Consumos de Insumos Químicos" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar los Consumos</Alert>
                </Col>
            </Row>
        </Container>
    )
    

    const columns: TableColumn<ConsumoProducto>[] = [
        {
            name: "ID",
            selector: row => row.id,
            sortable: true,
            center: true,
            maxWidth: "60px",
        },
        {
            name: "Fecha",
            //selector: row => row.tarea.fecha,
            sortable: true,
            center: true,
            grow: 1,
        },
        {
            name: "Tarea",
            selector: row => row.tarea_id,
            sortable: true,
            center: true,
            grow: 2,
        },
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
                        variant="outline-success"
                        size="sm"
                        onClick={() => navigate("/consumos_productos/new")}
                    >
                        <i class="bi bi-plus-circle"></i> Registrar consumo
                    </Button>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/consumos_productos/${row.id}/edit`)}
                    >
                        <i className="bi bi-pencil me-1"></i>Editar
                    </Button>
                </div>
            )
        },
        
    ];

    return (
        <Container>
            <Row className="p-2" align-items-center>
                <Col>
                    <PageHeader title="Listado de Consumos de Insumos Químicos" />
                </Col>
                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>
                <Col xs="auto" className="d-flex justify-content-end">
                    <Button
                        variant="primary"
                        size="sm"
                        style={{whiteSpace: "nowrap"}}  
                        onClick={() => setMostrarModalEditar(true)}              
                    >
                        <i className="bi bi-pencil me-1"></i> Modificar Consumo
                    </Button>
                </Col>
                <Col xs="auto" className="d-flex justify-content-end">
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setConsumoProductoToDelete(true)}    
                        style={{whiteSpace: "nowrap"}}               
                    >
                        <i className="bi bi-trash3 me-1"></i> Eliminar Consumo
                    </Button>
                </Col>
            </Row>
            <AppTable columns={columns} data={filteredConsumos} />
            <EditarConsumoProductoModal
                show={mostrarModalEditar}
                onHide={() => setMostrarModalEditar(false)}
            />
            <DeleteConsumoProductoModal
                show={consumoProductoToDelete}
                onHide={() => setConsumoProductoToDelete(false)}
                onDeleted={() => mutate("/consumos_productos")}
            />
            
        </Container>
    );
    
}