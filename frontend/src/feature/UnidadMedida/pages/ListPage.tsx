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

import { DeleteUnidadMedidaModal } from '../components/DeleteUnidadMedidaModal';
import type { UnidadMedida } from '../types';


export function ListPage() {
    const navigate = useNavigate();    
    const { currentUser } = useAuth();
    const [search, setSearch] = useState('');
    const { data: unidadesMedida, error, isLoading } = useApi<UnidadMedida[]>("/unidades-medida/")    
    const [unidadMedidaToDelete, setUnidadMedidaToDelete] = useState<UnidadMedida | null>(null);

    // useMemo infiere que retorna un array de tipo Insumo[]
    const filteredUnidadesMedida = useMemo(() => {
        if (!Array.isArray(unidadesMedida)) return [];     // Se agrego una validacion para preguntar si insumos es un array
        return (unidadesMedida ?? []).filter((unidadMedida) => {
            return (
                unidadMedida.nombre.toLowerCase().includes(search.toLowerCase())
            );
        });
    }, [search, unidadesMedida]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                type="text"
                placeholder="Buscar unidad de medida..."
                className=" mr-sm-2"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
        );
    }, [search]);

    if (isLoading) return <PageLoading title="Listado de Unidades de Medida" />;
    if (!unidadesMedida || error) return (
        <PageError title="Listado de Unidades de Medida" message="Ocurrió un error al cargar Unidades de Medida" />
    );

    const columns: TableColumn<UnidadMedida>[] = [
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
                        onClick={() => navigate(`/unidades-medida/${row.id}`)}
                    />

                    {currentUser?.administrar && (
                        <>
                            <ActionButton
                                variant="outline-primary"
                                size="sm"
                                tooltip="Editar"
                                icon="bi-pencil"
                                disabled={!row.activo}      // Si no esta activo se muestra en gris y no se puede editar
                                onClick={() => navigate(`/unidades-medida/${row.id}/edit`)}
                            />
                            <ActionButton
                                variant={row.activo ? 'outline-danger' : 'outline-success'}
                                size="sm"
                                tooltip={row.activo ? 'Dar de baja' : 'Dar de alta'}
                                icon={row.activo ? 'bi-dash-circle' : 'bi-check-circle'}
                                onClick={() => setUnidadMedidaToDelete(row)}
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
                    <PageHeader
                        eyebrow="DATOS MAESTROS"
                        title="Listado de Unidades de Medida"
                        subtitle="Revisá el Listado de Unidades de Medida creadas hasta la fecha."
                    />
                </Col>
                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>
                {currentUser?.administrar &&(
                    <Col xs="auto" className="d-flex justify-content-end">
                        <Button
                            variant="primary"
                            size='sm'
                            onClick={() => navigate("/unidades-medida/new")}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            + Nueva Unidad de Medida
                        </Button>
                    </Col>
                )}

            </Row>
            <AppTable columns={columns} data={filteredUnidadesMedida} />
            <DeleteUnidadMedidaModal
                unidadMedida={unidadMedidaToDelete}
                onHide={() => setUnidadMedidaToDelete(null)}
                onDeleted={() => mutate("/unidades-medida/")}
            />
        </Container>
    );
}