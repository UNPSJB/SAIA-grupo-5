import React, { useState, useMemo } from 'react';
import { mutate } from 'swr';
import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { type TableColumn } from 'react-data-table-component';
import { ActionButton } from '../../../components/ActionButton';
import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { useApi, useAuth } from '../../../hooks';
import { ListFilter } from "../../../components/ListFilter";
import { DeleteFuenteNutricionalModal } from '../components/DeleteFuenteNutricionalModal';
import { VerificarFuenteNutricionalModal } from '../components/VerificarFuenteNutricionalModal';
import { ImportarCsvFuenteModal } from "../components/ImportarCsvFuenteNutricionalModal";
import type { FuenteNutricional } from '../types';
import { PageLoading } from '../../../components/PageLoading';

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
    const { data: fuentes, error, isLoading } = useApi<FuenteNutricional[]>("/fuentes-nutricionales/");
    const [fuenteToDelete, setFuenteToDelete] = useState<FuenteNutricional | null>(null);
    const [fuenteToVerificar, setFuenteToVerificar] = useState<FuenteNutricional | null>(null);
    const [fuenteToImportar, setFuenteToImportar] = useState<FuenteNutricional | null>(null);
    const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>("todos");

    const filteredFuentes = useMemo(() => {
        if (!Array.isArray(fuentes)) return [];

        return fuentes.filter((fuente) => {
            const coincideBusqueda =
                fuente.nombre.toLowerCase().includes(search.toLowerCase()) ||
                (fuente.origen ?? "").toLowerCase().includes(search.toLowerCase()) ||
                fuente.licencia_uso.toLowerCase().includes(search.toLowerCase());

            const coincideEstado =
                estadoFiltro === "todos" ||
                (estadoFiltro === "activo" && fuente.activo) ||
                (estadoFiltro === "inactivo" && !fuente.activo);

            return coincideBusqueda && coincideEstado;
        });
    }, [search, estadoFiltro, fuentes]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                type="text"
                placeholder="Buscar por nombre, origen o licencia..."
                className="mr-sm-2"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
        );
    }, []);

    const titulo = "Fuentes Nutricionales";

    if (isLoading) return <PageLoading title={titulo} />;

    if (!fuentes || error) return (
        <Container>
            <PageHeader title={titulo} />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar las Fuentes Nutricionales</Alert>
                </Col>
            </Row>
        </Container>
    );

    const columns: TableColumn<FuenteNutricional>[] = [
        {
            name: 'Nombre',
            selector: row => row.nombre,
            sortable: true,
            center: true,
            minWidth: '170px',
        },
        {
            name: 'Origen',
            selector: row => row.origen || '',
            sortable: true,
            center: true,
            minWidth: '170px',
            cell: row => (
                <span className={row.origen ? "" : "text-muted fst-italic"}>
                    {row.origen || "Sin especificar"}
                </span>
            ),
        },
        {
            name: 'Licencia de Uso',
            selector: row => row.licencia_uso,
            sortable: true,
            center: true,
            minWidth: '170px',
        },
        {
            name: 'Verificación',
            selector: row => row.licencia_verificada ? 'Verificada' : 'Pendiente',
            sortable: true,
            center: true,
            minWidth: '140px',
            cell: row => (
                <div
                    style={{
                        padding: '4px 12px',
                        borderRadius: '16px',
                        background: row.licencia_verificada ? '#dcfce7' : '#fef3c7',
                        color: row.licencia_verificada ? '#166534' : '#92400e',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {row.licencia_verificada ? 'Verificada' : 'Pendiente'}
                </div>
            ),
        },
        {
            name: 'Estado',
            selector: row => row.activo ? 'Activo' : 'Inactivo',
            sortable: true,
            center: true,
            minWidth: '95px',
            cell: row => (
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
            ),
        },
        {
            name: "Acciones",
            center: true,
            minWidth: '215px',
            cell: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ActionButton
                        variant="outline-info"
                        size="sm"
                        tooltip="Ver Detalle y Alimentos"
                        icon="bi bi-eye"
                        onClick={() => navigate(`/fuentes-nutricionales/${row.id}`)}
                    />

                    {currentUser?.administrar && (
                        <>
                            <ActionButton
                                variant="outline-primary"
                                size="sm"
                                tooltip="Editar Datos"
                                icon="bi bi-pencil"
                                disabled={!row.activo}
                                onClick={() => navigate(`/fuentes-nutricionales/${row.id}/edit`)}
                            />
                            <ActionButton
                                variant={row.licencia_verificada ? "outline-warning" : "outline-success"}
                                size="sm"
                                tooltip={row.licencia_verificada ? "Quitar verificación" : "Verificar licencia"}
                                icon="bi bi-patch-check"
                                disabled={!row.activo}
                                onClick={() => setFuenteToVerificar(row)}
                            />
                            <ActionButton
                                variant="outline-success"
                                size="sm"
                                tooltip="Importar CSV SARA"
                                icon="bi bi-upload"
                                disabled={!row.activo || !row.licencia_verificada}
                                onClick={() => setFuenteToImportar(row)}
                            />
                            <ActionButton
                                variant={row.activo ? 'outline-danger' : 'outline-success'}
                                size="sm"
                                tooltip={row.activo ? 'Dar de baja' : 'Dar de alta'}
                                icon={row.activo ? 'bi-dash-circle' : 'bi-check-circle'}
                                onClick={() => setFuenteToDelete(row)}
                            />
                        </>
                    )}
                </div>
            ),
        },
    ];

    return (
        <Container>
            <Row className="p-2 align-items-center">
                <Col>
                    <PageHeader
                        eyebrow="DATOS MAESTROS"
                        title={titulo}
                        subtitle="Revisá el Listado de Fuentes Nutricionales creadas hasta la fecha."
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
                {currentUser?.administrar && (
                    <Col xs="auto" className="d-flex justify-content-end">
                        <Button
                            variant="primary"
                            size='sm'
                            onClick={() => navigate("/fuentes-nutricionales/new")}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            + Nueva Fuente
                        </Button>
                    </Col>
                )}
            </Row>

            <AppTable columns={columns} data={filteredFuentes} />

            <DeleteFuenteNutricionalModal
                fuente={fuenteToDelete}
                onHide={() => setFuenteToDelete(null)}
                onDeleted={() => mutate("/fuentes-nutricionales/")}
            />

            <VerificarFuenteNutricionalModal
                fuente={fuenteToVerificar}
                onHide={() => setFuenteToVerificar(null)}
                onVerificada={() => mutate("/fuentes-nutricionales/")}
            />

            <ImportarCsvFuenteModal
                fuente={fuenteToImportar}
                onHide={() => setFuenteToImportar(null)}
                onImportado={() => mutate("/fuentes-nutricionales/")}
            />
        </Container>
    );
}