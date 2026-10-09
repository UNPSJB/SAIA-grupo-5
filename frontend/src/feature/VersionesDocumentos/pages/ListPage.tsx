import React, { useState, useMemo } from 'react';
import { mutate } from 'swr';
import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { type TableColumn } from 'react-data-table-component';
import { PageLoading } from "../../../components/PageLoading";

import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/useAuth';

import { DeleteVersionDocumentoModal } from '../components/DeleteVersionDocumentoModal'; 
import type { VersionDocumento } from '../types';

export function ListPage() {
    const navigate = useNavigate();  
    const { documentoId } = useParams();
    const { currentUser } = useAuth();
    const [search, setSearch] = useState('');
    const { data: versiones, error, isLoading } = useApi<VersionDocumento[]>(`/versiones-documentos/documento/${documentoId}`)
    const [versionDocumentoToDelete, setVersionDocumentoToDelete] = useState<VersionDocumento | null>(null);
    
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

    if (isLoading) return <PageLoading title="Listado de Versiones" />;

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
            name: 'Vigente',
            selector: row => row.vigente ? 'Vigente' : 'No vigente',
            sortable: true,
            center: true,
            cell: row => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10}}>
                    <div
                        style={{
                            padding: '4px 12px',
                            borderRadius: '16px',
                            background: row.vigente ? '#dcf2fc' : '#fee2e2',
                            color: row.vigente ? '#163b65' : '#991b1b',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {row.vigente ? 'Vigente' : 'No vigente'}
                    </div>
                </div>
            )
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
                    <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => navigate(`/versiones-documentos/version/${row.id}`)}
                    >
                        <i className="bi bi-eye me-1"></i>Ver
                    </Button>

                    {currentUser?.administrar && (
                        <>
                            <Button
                                variant="outline-primary"
                                size="sm"
                                disabled={!row.activo}      // Si no esta activo se muestra en gris y no se puede editar
                                onClick={() => navigate(`/versiones-documentos/version/${row.id}/edit`)}
                            >
                                <i className="bi bi-pencil me-1"></i>Editar
                            </Button>
                            <Button
                                variant={row.activo ? 'outline-danger' : 'outline-success'}
                                size="sm"
                                onClick={() => setVersionDocumentoToDelete(row)}
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
                    <PageHeader title="Listado de Versiones" />
                </Col>
                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
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
                onDeleted={() => mutate(`/versiones-documentos/documento/${documentoId}`)}
            />
        </Container>
    );
}