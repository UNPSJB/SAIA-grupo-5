import React, { useState, useMemo } from 'react';
import { mutate } from 'swr';
import { Alert, Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { type TableColumn } from 'react-data-table-component';

import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/useAuth';

import { DeleteInsumoModal } from '../components/DeleteInsumoModal';
import type { Insumo } from '../types';

export function ListPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [search, setSearch] = useState('');
    const { data: insumos, error, isLoading } = useApi<Insumo[]>("/insumos/");
    const [insumoToDelete, setInsumoToDelete] = useState<Insumo | null>(null);

    const filteredInsumos = useMemo(() => {
        if (!Array.isArray(insumos)) return [];
        return (insumos ?? []).filter((insumo) => {
            return (
                insumo.nombre.toLowerCase().includes(search.toLowerCase()) ||
                insumo.unidad_medida.toLowerCase().includes(search.toLowerCase())
            );
        });
    }, [search, insumos]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                type="text"
                placeholder="Buscar insumo..."
                className="mr-sm-2"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
        );
    }, []);

    if (isLoading) return (
        <>
            <PageHeader title="Listado de Insumos" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </>
    );

    if (!insumos || error) return (
        <Container>
            <PageHeader title="Listado de Insumos" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar Insumos</Alert>
                </Col>
            </Row>
        </Container>
    );

    const baseColumns: TableColumn<Insumo>[] = [
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
                            padding: '4px 12px',
                            borderRadius: '16px',
                            background: '#dbeafe',
                            color: '#1d4ed8',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            whiteSpace: 'nowrap',
                        }}
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
    ];

    const columns: TableColumn<Insumo>[] = currentUser?.administrar
        ? [
            ...baseColumns,
            {
                name: "Acciones",
                center: true,
                cell: (row) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            disabled={!row.activo}
                            onClick={() => navigate(`/insumos/${row.id}/edit`)}
                        >
                            <i className="bi bi-pencil me-1"></i>Editar
                        </Button>
                        {row.activo && (
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => setInsumoToDelete(row)}
                            >
                                <i className="bi bi-trash3 me-1"></i>Eliminar
                            </Button>
                        )}
                    </div>
                )
            }
        ]
        : baseColumns;

    return (
        <Container>
            <Row className="p-2 align-items-center">
                <Col>
                    <PageHeader title="Listado de Insumos" />
                </Col>
                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>
                {currentUser?.administrar && (
                    <Col xs="auto" className="d-flex justify-content-end">
                        <Button
                            variant="primary"
                            size='sm'
                            onClick={() => navigate("/insumos/new")}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            + Nuevo Insumo
                        </Button>
                    </Col>
                )}
            </Row>
            <AppTable columns={columns} data={filteredInsumos} />
            <DeleteInsumoModal
                insumo={insumoToDelete}
                onHide={() => setInsumoToDelete(null)}
                onDeleted={() => mutate("/insumos/")}
            />
        </Container>
    );
}