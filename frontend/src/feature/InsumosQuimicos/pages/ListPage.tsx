import React, { useState, useMemo } from 'react';
import { mutate } from 'swr';
import { Alert, Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { type TableColumn } from 'react-data-table-component';

import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/useAuth';

import { DeleteInsumoQuimicoModal } from '../components/DeleteInsumoQuimicoModal';
import type { InsumoQuimico } from '../types';


export function ListPage() {
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el insumo
    const { currentUser } = useAuth();
    const [search, setSearch] = useState('');
    const { data: insumosQuimicos, error, isLoading } = useApi<InsumoQuimico[]>("/insumos-quimicos/")    
    const [insumoQuimicoToDelete, setInsumoQuimicoToDelete] = useState<InsumoQuimico | null>(null);

    // useMemo infiere que retorna un array de tipo Insumo[]
    const filteredInsumosQuimicos = useMemo(() => {
        if (!Array.isArray(insumosQuimicos)) return [];     // Se agrego una validacion para preguntar si insumos es un array
        return (insumosQuimicos ?? []).filter((insumoQuimico) => {
            return (
                insumoQuimico.nombre.toLowerCase().includes(search.toLowerCase()) ||
                insumoQuimico.unidad_medida.toLowerCase().includes(search.toLowerCase()) ||
                insumoQuimico.tipo.nombre.toLowerCase().includes(search.toLocaleLowerCase())
            );
        });
    }, [search, insumosQuimicos]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                type="text"
                placeholder="Buscar insumo químico..."
                className=" mr-sm-2"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
        );
    }, [search]);

    if (isLoading) return (
        <>
            <PageHeader title="Listado de Insumos Químicos" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
            </Spinner>
        </>
    )
    if (!insumosQuimicos || error) return (
        <Container>
            <PageHeader title="Listado de Insumos Químicos" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar Insumos Químicos</Alert>
                </Col>
            </Row>
        </Container>
    )

    const columns: TableColumn<InsumoQuimico>[] = [
        {
            name: 'Nombre',
            selector: row => row.nombre,
            sortable: true,
            center: true,
            minWidth: '200px',
        },
        {
            name: 'Tipo de Químico',
            selector: row => row.tipo.nombre,
            sortable: true,
            center: true,
            cell: row => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                        style={{
                            padding: '4px 12px',
                            borderRadius: '16px',
                            background: '#d2f8f8',
                            color: '#02a59d',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            whiteSpace: 'nowrap',
                        }}      // Se modifico para poder poner las unidades de medida con los nombres completos y que se vean bien
                    >
                        {row.tipo.nombre}
                    </div>
                </div>
            )
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
            selector: row => row.activo ? 'Activo' : 'Inactivo',
            sortable: true,
            center: true,
            cell: row => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10}}>
                    <div
                        style={{
                            padding: '4px 12px',
                            borderRadius: '16px',
                            background: row.activo ? '#dcfce7' : '#fee2e2',
                            color: row.activo ? '#166534' : '#991b1b',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {row.activo ? 'Activo' : 'Inactivo'}
                    </div>
                </div>
            )
        },
        {
            name: "Acciones",
            center: true,
            grow: 1.25,
            minWidth: '280px',
            cell: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => navigate (`/insumos-quimicos/${row.id}`)}
                    >
                        <i className="bi bi-eye me-1"></i>Ver
                    </Button>
                    {currentUser?.administrar && (
                        <>
                            <Button
                                variant="outline-primary"
                                size="sm"
                                disabled={!row.activo}      // Si no esta activo se muestra en gris y no se puede editar
                                onClick={() => navigate(`/insumos-quimicos/${row.id}/edit`)}
                            >
                                <i className="bi bi-pencil me-1"></i>Editar
                            </Button>
                            <Button
                                variant={row.activo ? 'outline-danger' : 'outline-success'}
                                size="sm"
                                onClick={() => setInsumoQuimicoToDelete(row)}
                            >
                                <i className={`bi ${row.activo ? 'bi-dash-circle' : 'bi-check-circle'} me-1`}></i>
                                {row.activo ? 'Dar de baja' : 'Dar de alta'}
                            </Button>
                        </>
                    )}
                </div>
            )
        },
    ];

    return (
        <Container>
            <Row className="p-2 align-items-center" >
                <Col>
                    <PageHeader title="Listado de Insumos Químicos" />
                </Col>
                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>

                {currentUser?.administrar && (
                    <Col xs="auto" className="d-flex justify-content-end">
                        <Button
                            variant="primary"
                            size='sm'
                            onClick={() => navigate("/insumos-quimicos/new")}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            + Nuevo Insumo Químico
                        </Button>
                    </Col>
                )}

            </Row>
            <AppTable columns={columns} data={filteredInsumosQuimicos} />
            <DeleteInsumoQuimicoModal
                insumoQuimico={insumoQuimicoToDelete}
                onHide={() => setInsumoQuimicoToDelete(null)}
                onDeleted={() => mutate("/insumos-quimicos/")}
            />
        </Container>
    );
}