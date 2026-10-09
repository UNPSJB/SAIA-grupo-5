import React, { useState, useMemo } from 'react';
import { mutate } from 'swr';
import { Alert, Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { type TableColumn } from 'react-data-table-component';
import { ActionButton } from '../../../components/ActionButton';

import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader'; 
import { useApi } from '../../../hooks'; 
import { useAuth } from '../../../hooks';

import { DeleteTipoVencimientoModal } from '../components/DeleteTipoVencimientoModal';
import type { TipoVencimiento } from '../types';


export function ListPage() {
    const navigate = useNavigate();     
    const { currentUser } = useAuth();
    const [search, setSearch] = useState('');
    const { data: tiposVencimientos, error, isLoading } = useApi<TipoVencimiento[]>("/tipos-vencimientos/")    
    const [tipoVencimientoToDelete, setTipoVencimientoToDelete] = useState<TipoVencimiento | null>(null);


    const filteredTiposVencimientos = useMemo(() => {
        if (!Array.isArray(tiposVencimientos)) return [];     
        return (tiposVencimientos ?? []).filter((tipoVencimiento) => {
            return (
                tipoVencimiento.nombre.toLowerCase().includes(search.toLowerCase())
            );
        });
    }, [search, tiposVencimientos]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                type="text"
                placeholder="Buscar tipo vencimiento..."
                className=" mr-sm-2"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
        );
    }, [search]);

    if (isLoading) return (
        <>
            <PageHeader title="Listado de Tipos Vencimientos" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
            </Spinner>
        </>
    )
    if (!tiposVencimientos || error) return (
        <Container>
            <PageHeader title="Listado de Tipos Vencimientos" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar Tipos Vencimientos</Alert>
                </Col>
            </Row>
        </Container>
    )

    const columns: TableColumn<TipoVencimiento>[] = [
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
                        icon="bi bi-eye"
                        onClick={() => navigate(`/tipos-vencimientos/${row.id}`)}
                    />

                    {currentUser?.administrar && (
                        <>
                            <ActionButton
                                variant="outline-primary"
                                size="sm"
                                tooltip="Editar"
                                icon="bi bi-pencil"
                                disabled={!row.activo}      // Si no esta activo se muestra en gris y no se puede editar
                                onClick={() => navigate(`/tipos-vencimientos/${row.id}/edit`)}
                            />
                            <ActionButton
                                variant={row.activo ? 'outline-danger' : 'outline-success'}
                                size="sm"
                                tooltip={row.activo ? 'Dar de baja' : 'Dar de alta'}
                                icon={row.activo ? 'bi-dash-circle' : 'bi-check-circle'}
                                onClick={() => setTipoVencimientoToDelete(row)}
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
                    <PageHeader title="Listado de Tipos Vencimientos" />
                </Col>
                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>
                {currentUser?.administrar &&(
                    <Col xs="auto" className="d-flex justify-content-end">
                        <Button
                            variant="primary"
                            size='sm'
                            onClick={() => navigate("/tipos-vencimientos/new")}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            + Nuevo Tipo Vencimiento
                        </Button>
                    </Col>
                )}

            </Row>
            <AppTable columns={columns} data={filteredTiposVencimientos} />
            <DeleteTipoVencimientoModal
                tipoVencimiento={tipoVencimientoToDelete}
                onHide={() => setTipoVencimientoToDelete(null)}
                onDeleted={() => mutate("/tipos-vencimientos/")}
            />
        </Container>
    );
}