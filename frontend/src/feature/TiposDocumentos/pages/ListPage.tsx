import React, { useState, useMemo } from 'react';
import { mutate } from 'swr';
import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { type TableColumn } from 'react-data-table-component';
import { PageLoading } from "../../../components/PageLoading";

import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/useAuth';

import { DeleteTipoDocumentoModal } from '../components/DeleteTipoDocumentoModal'; 
import type { TipoDocumento } from '../types';


export function ListPage() {
    const navigate = useNavigate();     
    const { currentUser } = useAuth();
    const [search, setSearch] = useState('');
    const { data: tiposDocumentos, error, isLoading } = useApi<TipoDocumento[]>("/tipos-documentos/")    
    const [tipoDocumentoToDelete, setTipoDocumentoToDelete] = useState<TipoDocumento | null>(null);

    const filteredTiposDocumentos = useMemo(() => {
        if (!Array.isArray(tiposDocumentos)) return [];     
        return (tiposDocumentos ?? []).filter((tipoDocumento) => {
            return (
                tipoDocumento.nombre.toLowerCase().includes(search.toLowerCase())
            );
        });
    }, [search, tiposDocumentos]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                type="text"
                placeholder="Buscar tipo documento..."
                className=" mr-sm-2"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
        );
    }, [search]);

    if (isLoading) return <PageLoading title="Listado de Tipos Documentos" />;

    if (!tiposDocumentos || error) return (
        <Container>
            <PageHeader title="Listado de Tipos Documentos" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar Tipos Documentos</Alert>
                </Col>
            </Row>
        </Container>
    )

    const columns: TableColumn<TipoDocumento>[] = [
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
                    <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => navigate(`/tipos-documentos/${row.id}`)}
                    >
                        <i className="bi bi-eye me-1"></i>Ver
                    </Button>

                    {currentUser?.administrar && (
                        <>
                            <Button
                                variant="outline-primary"
                                size="sm"
                                disabled={!row.activo}      // Si no esta activo se muestra en gris y no se puede editar
                                onClick={() => navigate(`/tipos-documentos/${row.id}/edit`)}
                            >
                                <i className="bi bi-pencil me-1"></i>Editar
                            </Button>
                            <Button
                                variant={row.activo ? 'outline-danger' : 'outline-success'}
                                size="sm"
                                onClick={() => setTipoDocumentoToDelete(row)}
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
                    <PageHeader title="Listado de Tipos Documentos" />
                </Col>
                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>
                {currentUser?.administrar &&(
                    <Col xs="auto" className="d-flex justify-content-end">
                        <Button
                            variant="primary"
                            size='sm'
                            onClick={() => navigate("/tipos-documentos/new")}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            + Nuevo Tipo Documento
                        </Button>
                    </Col>
                )}

            </Row>
            <AppTable columns={columns} data={filteredTiposDocumentos} />
            <DeleteTipoDocumentoModal
                tipoDocumento={tipoDocumentoToDelete}
                onHide={() => setTipoDocumentoToDelete(null)}
                onDeleted={() => mutate("/tipos-documentos/")}
            />
        </Container>
    );
}