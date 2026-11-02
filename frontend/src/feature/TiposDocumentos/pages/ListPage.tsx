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
    const { data: tiposDocumentos, error, isLoading } = useApi<TipoDocumento[]>("/tipos-documentos/")    
    const [tipoDocumentoToDelete, setTipoDocumentoToDelete] = useState<TipoDocumento | null>(null);
    const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>("todos");

    const filteredTiposDocumentos = useMemo(() => {
        if (!Array.isArray(tiposDocumentos)) return [];

        return tiposDocumentos.filter((tipoDocumento) => {
            const coincideBusqueda = tipoDocumento.nombre
                .toLowerCase()
                .includes(search.toLowerCase());

            const coincideEstado =
                estadoFiltro === "todos" ||
                (estadoFiltro === "activo" && tipoDocumento.activo) ||
                (estadoFiltro === "inactivo" && !tipoDocumento.activo);

            return coincideBusqueda && coincideEstado;
        });
    }, [search, estadoFiltro, tiposDocumentos]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                data-tour="buscador-tipos-documentos"
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
                        data-tour="estado-tipo-documento"
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
                    <span data-tour="btn-ver-tipo-documento">
                        <ActionButton
                            variant="outline-info"
                            size="sm"
                            tooltip="Ver"
                            icon="bi-eye"
                            onClick={() => navigate(`/tipos-documentos/${row.id}`)}
                        />
                    </span>

                    {currentUser?.administrar && (
                        <>
                            <span data-tour="btn-editar-tipo-documento">
                                <ActionButton
                                    variant="outline-primary"
                                    size="sm"
                                    tooltip="Editar"
                                    icon="bi-pencil"
                                    disabled={!row.activo}
                                    onClick={() => navigate(`/tipos-documentos/${row.id}/edit`)}
                                />
                            </span>
                            <span data-tour="btn-baja-tipo-documento">

                                <ActionButton
                                    variant={row.activo ? "outline-danger" : "outline-success"}
                                    size="sm"
                                    tooltip={row.activo ? "Dar de baja" : "Dar de alta"}
                                    icon={row.activo ? "bi-dash-circle" : "bi-check-circle"}
                                    onClick={() => setTipoDocumentoToDelete(row)}
                                />
                            </span>
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
                        title="Listado de Tipos Documentos"
                        subtitle="Revisá el Listado de Tipos Documentos creados hasta la fecha."
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
                            data-tour="btn-nuevo-tipo-documento"
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
            <div data-tour="tabla-tipos-documentos">
                <AppTable columns={columns} data={filteredTiposDocumentos} />
            </div>
            <DeleteTipoDocumentoModal
                tipoDocumento={tipoDocumentoToDelete}
                onHide={() => setTipoDocumentoToDelete(null)}
                onDeleted={() => mutate("/tipos-documentos/")}
            />
        </Container>
    );
}