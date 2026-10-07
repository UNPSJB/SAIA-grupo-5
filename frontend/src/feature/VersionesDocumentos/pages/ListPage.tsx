import React, { useState, useMemo } from 'react';
import { mutate } from 'swr';
import { Alert, Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { type TableColumn } from 'react-data-table-component';

import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/useAuth';

import { DeleteVersionDocumentoModal } from '../components/DeleteVersionDocumentoModal'; 
import { MarcarVigenteModal } from '../components/MarcarVigenteModal';
import type { VersionDocumento } from '../types';
import { ActionButton } from '../../../components/ActionButton';

export function ListPage() {
    const navigate = useNavigate();  
    const { documentoId } = useParams();
    const { currentUser } = useAuth();
    const [search, setSearch] = useState('');
    const [incluirHistoricas, setIncluirHistoricas] = useState(false);
    const urlBase = `/versiones-documentos/documento/${documentoId}`;
    const { data: versiones, error, isLoading } = useApi<VersionDocumento[]>(
        incluirHistoricas ? `${urlBase}?incluir_historicas=true` : urlBase
    );
    const [versionDocumentoToDelete, setVersionDocumentoToDelete] = useState<VersionDocumento | null>(null);
    const [versionAMarcar, setVersionAMarcar] = useState<VersionDocumento | null>(null);
    const recargar = () => Promise.all([
        mutate(urlBase),
        mutate(`${urlBase}?incluir_historicas=true`),
    ]);
    const filteredVersionesDocumentos = useMemo(() => {
        if (!Array.isArray(versiones)) return [];     
        return (versiones ?? []).filter((version) => {
            return (
                version.version.toString().toLowerCase().includes(search.toLowerCase())
            );
        });
    }, [search, versiones]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                type="text"
                placeholder="Buscar version..."
                className=" mr-sm-2"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
        );
    }, [search]);

    if (isLoading) return (
        <>
            <PageHeader title="Listado de Versiones" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
            </Spinner>
        </>
    )
    if (!versiones || error) return (
        <Container>
            <PageHeader title="Listado de Versiones" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar Versiones</Alert>
                </Col>
            </Row>
        </Container>
    )

    const columns: TableColumn<VersionDocumento>[] = [
        {
            name: 'Version',
            selector: row => row.version,
            sortable: true,
            center: true,
            minWidth: '120px',
        },
        {
            name: 'Fecha de carga',
            selector: row => row.fecha_subida,
            sortable: true,
            center: true,
            minWidth: '160px',
        },
        {
            name: 'Vigencia',
            selector: row => row.vigente ? 'Vigente' : row.fecha_hasta_vigencia ? 'Histórica' : 'Sin vigencia',
            sortable: true,
            center: true,
            cell: row => {
                const estado = row.vigente
                    ? { label: 'Vigente',      fondo: '#dcf2fc', texto: '#163b65' }
                    : row.fecha_hasta_vigencia
                        ? { label: 'Histórica',    fondo: '#e5e7eb', texto: '#374151' }
                        : { label: 'Sin vigencia', fondo: '#fef3c7', texto: '#92400e' };
                return (
                    <div style={{
                        padding: '4px 12px', borderRadius: '16px', background: estado.fondo,
                        color: estado.texto, fontWeight: 700, whiteSpace: 'nowrap',
                    }}>
                        {estado.label}
                    </div>
                );
            },
        },
        {
            name: 'Vigente desde',
            selector: row => row.fecha_desde_vigencia ?? '',
            sortable: true,
            center: true,
            minWidth: '170px',
            cell: row => row.fecha_desde_vigencia
                ? new Date(row.fecha_desde_vigencia).toLocaleString('es-AR')
                : '-',
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
            minWidth: '260px',
            cell: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ActionButton
                        variant="outline-info"
                        size="sm"
                        tooltip="Ver"
                        icon = "bi-eye"
                        onClick={() => navigate(`/versiones-documentos/version/${row.id}`)}
                    >
                    </ActionButton>

                    {currentUser?.administrar && (
                        <>
                        {!row.fecha_hasta_vigencia &&(
                            <ActionButton
                                variant="outline-primary"
                                size="sm"
                                tooltip="Editar"
                                icon = "bi-pencil"
                                disabled={!row.activo}      // Si no esta activo se muestra en gris y no se puede editar
                                onClick={() => navigate(`/versiones-documentos/version/${row.id}/edit`)}
                            >
                            </ActionButton>
                        )}
                            {row.activo && !row.vigente && !row.fecha_hasta_vigencia &&(
                                <ActionButton
                                    variant="outline-success"
                                    size="sm"
                                    tooltip="Marcar vigente"
                                    icon="bi-patch-check"
                                    onClick={() => setVersionAMarcar(row)}
                                >
                                </ActionButton>
                            )}
                            {!row.fecha_hasta_vigencia &&(
                            <ActionButton
                                variant={row.activo ? 'outline-danger' : 'outline-success'}
                                size="sm"
                                tooltip={row.activo ? 'Dar de baja' : 'Dar de alta'}
                                icon={row.activo ? 'bi-dash-circle' : 'bi-check-circle'}
                                disabled={row.vigente && row.activo}
                                onClick={() => setVersionDocumentoToDelete(row)}
                            >
                            </ActionButton>
                            )}
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
                    <PageHeader title="Listado de Versiones" />
                </Col>
                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>
                <Col xs="auto" className="align-self-center">
                    <Form.Check
                        type="switch"
                        id="switch-historicas"
                        label="Ver históricas"
                        checked={incluirHistoricas}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIncluirHistoricas(e.target.checked)}
                    />
                </Col>
                <Col xs="auto" className="d-flex justify-content-end">
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => navigate('/documentos')}
                    >
                        <i className="bi bi-arrow-left me-1"></i>
                        Volver a Documentos
                    </Button>
                </Col>
                {currentUser?.administrar &&(
                    <Col xs="auto" className="d-flex justify-content-end">
                        <Button
                            variant="primary"
                            size='sm'
                            onClick={() => navigate(`/versiones-documentos/documento/${documentoId}/new`)}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            + Nueva Version
                        </Button>
                    </Col>
                )}

            </Row>
            <AppTable columns={columns} data={filteredVersionesDocumentos} />
            <DeleteVersionDocumentoModal
                version={versionDocumentoToDelete}
                onHide={() => setVersionDocumentoToDelete(null)}
                onDeleted={recargar}
            />
            <MarcarVigenteModal
                version={versionAMarcar}
                versionVigenteActual={versiones.find(v => v.vigente)}
                onHide={() => setVersionAMarcar(null)}
                onMarked={recargar}
            />
        </Container>
    );
}