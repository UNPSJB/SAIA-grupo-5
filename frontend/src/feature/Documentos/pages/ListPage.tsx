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

import { DeleteDocumentoModal } from '../components/DeleteDocumentoModal'; 
import type { Documento } from '../types';
import { ListFilter } from "../../../components/ListFilter";
import { ActionButton } from "../../../components/ActionButton";

type EstadoFiltro = "todos" | "activo" | "inactivo";

const ESTADO_FILTRO_LABELS: Record<EstadoFiltro, string> = {
    todos: "Todos",
    activo: "Activos",
    inactivo: "Inactivos",
};

export function ListPage() {
    const navigate = useNavigate();     
    const { currentUser } = useAuth();
    const [search, setSearch] = useState('');
    const { data: documentos, error, isLoading } = useApi<Documento[]>("/documentos/")    
    const [documentoToDelete, setDocumentoToDelete] = useState<Documento | null>(null);
    const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>("todos");

    const filteredDocumentos = useMemo(() => {
        if (!Array.isArray(documentos)) return [];

        return documentos.filter((documento) => {
            const coincideBusqueda = documento.nombre
                .toLowerCase()
                .includes(search.toLowerCase());

            const coincideEstado =
                estadoFiltro === "todos" ||
                (estadoFiltro === "activo" && documento.activo) ||
                (estadoFiltro === "inactivo" && !documento.activo);

            return coincideBusqueda && coincideEstado;
        });
    }, [search, estadoFiltro, documentos]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                type="text"
                placeholder="Buscar documento..."
                className=" mr-sm-2"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
        );
    }, [search]);

    if (isLoading) return <PageLoading title="Listado de Documentos" />;

    if (!documentos || error) return (
        <Container>
            <PageHeader title="Listado de Documentos" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar Documentos</Alert>
                </Col>
            </Row>
        </Container>
    )

    const columns: TableColumn<Documento>[] = [
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
            minWidth: "180px",
            cell: (row) => (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <ActionButton
                        variant="outline-info"
                        size="sm"
                        tooltip="Ver"
                        icon="bi-eye"
                        onClick={() => navigate(`/documentos/${row.id}`)}
                    />

                    {currentUser?.administrar && (
                        <>
                            <ActionButton
                                variant="outline-primary"
                                size="sm"
                                tooltip="Editar"
                                icon="bi-pencil"
                                disabled={!row.activo}
                                onClick={() => navigate(`/documentos/${row.id}/edit`)}
                            />

                            <ActionButton
                                variant={row.activo ? "outline-danger" : "outline-success"}
                                size="sm"
                                tooltip={row.activo ? "Dar de baja" : "Dar de alta"}
                                icon={row.activo ? "bi-dash-circle" : "bi-check-circle"}
                                onClick={() => setDocumentoToDelete(row)}
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
                        eyebrow="GESTIÓN"
                        title="Listado de Documentos"
                        subtitle="Revisá el Listado de Documentos creados hasta la fecha."
                    />
                </Col>
                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>
                <Col xs="auto" className="align-self-center">
                    <ListFilter
                        value={estadoFiltro}
                        options={ESTADO_FILTRO_LABELS}
                        onChange={(value) => setEstadoFiltro(value as EstadoFiltro)}
                    />
                </Col>
                {currentUser?.administrar &&(
                    <Col xs="auto" className="d-flex justify-content-end">
                        <Button
                            variant="primary"
                            size='sm'
                            onClick={() => navigate("/documentos/new")}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            + Nuevo Documento
                        </Button>
                    </Col>
                )}

            </Row>
            <AppTable columns={columns} data={filteredDocumentos} />
            <DeleteDocumentoModal
                documento={documentoToDelete}
                onHide={() => setDocumentoToDelete(null)}
                onDeleted={() => mutate("/documentos/")}
            />
        </Container>
    );
}