import React, { useState, useMemo } from 'react';
import { mutate } from 'swr';
import { Alert, Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { type TableColumn } from 'react-data-table-component';

import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { ActionButton } from '../../../components/ActionButton';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/useAuth';

import { DeleteTipoQuimicoModal } from '../components/DeleteTipoQuimicoModal'; 
import type { TipoQuimico } from '../types';


export function ListPage() {
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el insumo
    const { currentUser } = useAuth();
    const [search, setSearch] = useState('');
    const { data: tiposQuimicos, error, isLoading } = useApi<TipoQuimico[]>("/tipos-quimicos/")    
    const [tipoQuimicoToDelete, setTipoQuimicoToDelete] = useState<TipoQuimico | null>(null);

    // useMemo infiere que retorna un array de tipo Insumo[]
    const filteredTiposQuimicos = useMemo(() => {
        if (!Array.isArray(tiposQuimicos)) return [];     // Se agrego una validacion para preguntar si insumos es un array
        return (tiposQuimicos ?? []).filter((tipoQuimico) => {
            return (
                tipoQuimico.nombre.toLowerCase().includes(search.toLowerCase())
            );
        });
    }, [search, tiposQuimicos]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                type="text"
                placeholder="Buscar tipo químico..."
                className=" mr-sm-2"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
        );
    }, [search]);

    if (isLoading) return (
        <>
            <PageHeader title="Listado de Tipos Químicos" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
            </Spinner>
        </>
    )
    if (!tiposQuimicos || error) return (
        <Container>
            <PageHeader title="Listado de Tipos Químicos" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar Tipos Químicos</Alert>
                </Col>
            </Row>
        </Container>
    )

    const columns: TableColumn<TipoQuimico>[] = [
        {
            name: 'Nombre',
            selector: row => row.nombre,
            sortable: true,
            center: true,
            minWidth: '200px',
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
            cell: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ActionButton
                        variant="outline-info"
                        size="sm"
                        tooltip="Ver"
                        icon="bi-eye"
                        onClick={() => navigate(`/tipos-quimicos/${row.id}`)}
                    />

                    {currentUser?.administrar && (
                        <>
                            <ActionButton
                                variant="outline-primary"
                                size="sm"
                                tooltip="Editar"
                                icon="bi-pencil"
                                disabled={!row.activo}      // Si no esta activo se muestra en gris y no se puede editar
                                onClick={() => navigate(`/tipos-quimicos/${row.id}/edit`)}
                            />
                            <ActionButton
                                variant={row.activo ? 'outline-danger' : 'outline-success'}
                                size="sm"
                                tooltip={row.activo ? 'Dar de baja' : 'Dar de alta'}
                                icon={row.activo ? 'bi-dash-circle' : 'bi-check-circle'}
                                onClick={() => setTipoQuimicoToDelete(row)}
                            />
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
                    <PageHeader title="Listado de Tipos Químicos" />
                </Col>
                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>
                {currentUser?.administrar &&(
                    <Col xs="auto" className="d-flex justify-content-end">
                        <Button
                            variant="primary"
                            size='sm'
                            onClick={() => navigate("/tipos-quimicos/new")}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            + Nuevo Tipo Químico
                        </Button>
                    </Col>
                )}

            </Row>
            <AppTable columns={columns} data={filteredTiposQuimicos} />
            <DeleteTipoQuimicoModal
                tipoQuimico={tipoQuimicoToDelete}
                onHide={() => setTipoQuimicoToDelete(null)}
                onDeleted={() => mutate("/tipos-quimicos/")}
            />
        </Container>
    );
}