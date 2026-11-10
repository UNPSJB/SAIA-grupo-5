import React, { useState, useMemo } from 'react';
import { mutate } from 'swr';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { type TableColumn } from 'react-data-table-component';

import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { PageLoading } from '../../../components/PageLoading';
import { PageError } from '../../../components/PageError';
import { ActionButton } from '../../../components/ActionButton';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/useAuth';
import { CambiarEstadoClienteModal } from '../components/CambiarEstadoClienteModal';
import type { Cliente } from '../types';

export function ListPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [search, setSearch] = useState('');
    const { data: clientes, error, isLoading } = useApi<Cliente[]>("/clientes/");
    const [clienteToChange, setClienteToChange] = useState<Cliente | null>(null);

    const filteredClientes = useMemo(() => {
        if (!Array.isArray(clientes)) return [];

        return clientes.filter((cliente) =>
            cliente.razon_social.toLowerCase().includes(search.toLowerCase()) ||
            cliente.cuit.includes(search)
        ).sort((a, b) => b.id - a.id);
    }, [search, clientes]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                type="text"
                placeholder="Buscar cliente..."
                className="mr-sm-2"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
        );
    }, []);

    if (isLoading) return <PageLoading title="Listado de Clientes" />;

    if (!clientes || error) return (
        <PageError title="Listado de Clientes" message="Ocurrio un error al cargar Clientes" />
    );

    const columns: TableColumn<Cliente>[] = [
        {
            name: 'Razon Social',
            selector: row => row.razon_social,
            sortable: true,
            center: true,
            grow: 1.5,
        },
        {
            name: 'CUIT',
            selector: row => row.cuit,
            sortable: true,
            center: true,
            minWidth: '150px',
            grow: 1,
        },
        {
            name: 'Telefono',
            selector: row => row.telefono || '-',
            sortable: true,
            center: true,
            minWidth: '130px',
            grow: 1,
        },
        {
            name: 'Direcciones',
            selector: row => row.direcciones?.length ?? 0,
            sortable: true,
            center: true,
            minWidth: '120px',
            grow: 0.8,
            cell: row => `${row.direcciones?.length ?? 0} cargadas`,
        },
        {
            name: 'Estado',
            selector: row => (row.activo ? 'Activo' : 'Inactivo'),
            sortable: true,
            center: true,
            minWidth: '130px',
            grow: 1,
            cell: row => (
                <div
                    style={{
                        padding: '4px 12px',
                        borderRadius: '16px',
                        background: row.activo ? '#dcfce7' : '#fee2e2',
                        color: row.activo ? '#166534' : '#991b1b',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                    }}
                >
                    {row.activo ? 'Activo' : 'Inactivo'}
                </div>
            )
        },
        {
            name: "Acciones",
            center: true,
            minWidth: '180px',
            cell: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                    <ActionButton
                        variant="outline-info"
                        size="sm"
                        tooltip="Ver"
                        icon="bi bi-eye"
                        onClick={() => navigate(`/clientes/${row.id}`)}
                    />
                    {currentUser?.administrar && (
                        <>
                            <ActionButton
                                variant="outline-primary"
                                size="sm"
                                tooltip="Editar"
                                icon="bi bi-pencil"
                                disabled={!row.activo}
                                onClick={() => navigate(`/clientes/${row.id}/edit`)}
                            />
                            <ActionButton
                                variant={row.activo ? 'outline-danger' : 'outline-success'}
                                size="sm"
                                tooltip={row.activo ? 'Dar de baja' : 'Reactivar'}
                                icon={row.activo ? 'bi-dash-circle' : 'bi-check-circle'}
                                onClick={() => setClienteToChange(row)}
                            />
                        </>
                    )}
                </div>
            )
        }
    ];

    return (
        <Container>
            <Row className="p-2 align-items-center">
                <Col>
                    <PageHeader
                        eyebrow="GESTIÓN"
                        title="Listado de Clientes"
                        subtitle="Revisa el listado de clientes creados hasta la fecha."
                    />
                </Col>
                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>
                {currentUser?.administrar && (
                    <Col xs="auto" className="d-flex justify-content-end">
                        <Button
                            variant="primary"
                            size='sm'
                            onClick={() => navigate("/clientes/new")}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            + Nuevo Cliente
                        </Button>
                    </Col>
                )}
            </Row>
            <AppTable columns={columns} data={filteredClientes} />
            <CambiarEstadoClienteModal
                cliente={clienteToChange}
                onHide={() => setClienteToChange(null)}
                onChanged={() => mutate("/clientes/")}
            />
        </Container>
    );
}