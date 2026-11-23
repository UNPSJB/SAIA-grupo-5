import { useState } from "react";
import { Container, Alert, Row, Col, Card, Button, Form, Tab } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { type TableColumn } from "react-data-table-component";
import { AppTable } from "../../../components/AppTable";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import { useAuth } from "../../../hooks/useAuth";
import type { AlimentoReferencia, FuenteNutricional } from "../types";
import { PageLoading } from "../../../components/PageLoading";
import { AppTabs } from "../../../components/AppTabs";
import { Dato } from "../../../components/Dato";
import { EstadoBadge } from "../../../components/EstadoBadge";
import { ImportarCsvFuenteModal } from "../components/ImportarCsvFuenteNutricionalModal";

export function VerFuenteNutricionalPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { currentUser } = useAuth();

    const [busquedaAlimento, setBusquedaAlimento] = useState("");
    const [mostrarModalCsv, setMostrarModalCsv] = useState(false);

    const { data: fuente, isLoading, error } = useApi<FuenteNutricional>(`/fuentes-nutricionales/${id}`);

    const urlAlimentos = id
        ? `/fuentes-nutricionales/alimentos-referencia/?fuente_id=${id}${busquedaAlimento.trim() ? `&q=${encodeURIComponent(busquedaAlimento.trim())}` : ""}`
        : null;
    const { data: alimentos, isLoading: cargandoAlimentos } = useApi<AlimentoReferencia[]>(urlAlimentos);

    const tituloPagina = "Detalle de Fuente Nutricional";

    if (isLoading) return <PageLoading title={tituloPagina} />;

    if (!fuente || error) return (
        <Container>
            <PageHeader title="Fuente nutricional no encontrada." />
            <Row className="justify-content-center mt-4">
                <Col md={6}>
                    <Alert variant="danger" className="text-center shadow-sm">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error ? "Ocurrió un error al cargar los datos." : "La fuente nutricional ingresada no existe."}
                    </Alert>
                </Col>
            </Row>
        </Container>
    );

    const puedeImportar = currentUser?.administrar && fuente.activo && fuente.licencia_verificada;

    const columnsAlimentos: TableColumn<AlimentoReferencia>[] = [
        {
            name: "Código",
            selector: (row) => row.codigo_externo || "-",
            sortable: true,
            center: true,
            width: "110px",
        },
        {
            name: "Alimento",
            selector: (row) => row.nombre,
            sortable: true,
            wrap: true,
            grow: 2.5,
            cell: (row) => <span className="fw-semibold">{row.nombre}</span>,
        },
        {
            name: "Energía (kcal)",
            selector: (row) => row.valor_energetico ?? -1,
            sortable: true,
            right: true,
            cell: (row) => row.valor_energetico ?? "-",
        },
        {
            name: "Carboh. (g)",
            selector: (row) => row.carbohidratos ?? -1,
            sortable: true,
            right: true,
            cell: (row) => row.carbohidratos ?? "-",
        },
        {
            name: "Proteínas (g)",
            selector: (row) => row.proteinas ?? -1,
            sortable: true,
            right: true,
            cell: (row) => row.proteinas ?? "-",
        },
        {
            name: "Grasas Tot. (g)",
            selector: (row) => row.grasas_totales ?? -1,
            sortable: true,
            right: true,
            cell: (row) => row.grasas_totales ?? "-",
        },
        {
            name: "Sodio (mg)",
            selector: (row) => row.sodio ?? -1,
            sortable: true,
            right: true,
            cell: (row) => row.sodio ?? "-",
        },
    ]
    return (
        <Container>
            <PageHeader title={tituloPagina} />

            <AppTabs defaultActiveKey="general" id="secciones-fuente-nutricional" className="mb-3 mt-3" mountOnEnter>
                <Tab eventKey="general" title="Información general">
                    <Card className="shadow-sm border-0 rounded-3 mb-4 text-start">
                        <Card.Body className="p-4">
                            <h6 className="detalle-seccion-titulo">Datos de la fuente</h6>
                            <Row className="g-3 mb-4">
                                <Dato etiqueta="Nombre" md={6} lg={4}>
                                    <span className="fw-semibold">{fuente.nombre}</span>
                                </Dato>
                                <Dato etiqueta="Origen" md={6} lg={4}>
                                    {fuente.origen || <span className="text-muted fst-italic">Sin especificar</span>}
                                </Dato>
                                <Dato etiqueta="Estado" md={6} lg={4}>
                                    <EstadoBadge
                                        tono={fuente.activo ? 'success' : 'danger'}
                                        icono={fuente.activo ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}
                                    >
                                        {fuente.activo ? 'Activo' : 'Inactivo'}
                                    </EstadoBadge>
                                </Dato>
                                <Dato etiqueta="Licencia de Uso" md={6}>{fuente.licencia_uso}</Dato>
                                <Dato etiqueta="Formato de Uso" md={6}>{fuente.formato_uso}</Dato>
                                <Dato etiqueta="Descripción">
                                    {fuente.descripcion || <span className="text-muted fst-italic">Sin descripción</span>}
                                </Dato>
                            </Row>

                            <h6 className="detalle-seccion-titulo">Verificación de licencia</h6>
                            <Row className="g-3">
                                <Dato etiqueta="Estado de verificación" md={4}>
                                    <EstadoBadge tono={fuente.licencia_verificada ? 'success' : 'warning'}>
                                        {fuente.licencia_verificada ? 'Verificada' : 'Pendiente de verificación'}
                                    </EstadoBadge>
                                </Dato>
                                <Dato etiqueta="Verificada por" md={4}>
                                    {fuente.verificada_por
                                        ? `${fuente.verificada_por.nombre} ${fuente.verificada_por.apellido}`
                                        : <span className="text-muted fst-italic">Sin registrar</span>}
                                </Dato>
                                <Dato etiqueta="Fecha de Verificación" md={4}>
                                    {fuente.fecha_verificacion
                                        ? new Date(fuente.fecha_verificacion).toLocaleString("es-AR")
                                        : <span className="text-muted fst-italic">Sin registrar</span>}
                                </Dato>
                            </Row>
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="alimentos" title="Alimentos de referencia">
                    <Card className="shadow-sm border-0 rounded-3 mb-4 text-start">
                        <Card.Body className="p-4">
                            <div className="d-flex flex-wrap justify-content-end align-items-center gap-2 mb-3">
                                <Form.Control
                                    type="text"
                                    size="sm"
                                    placeholder="Buscar alimento..."
                                    value={busquedaAlimento}
                                    onChange={(e) => setBusquedaAlimento(e.target.value)}
                                    style={{ width: "230px" }}
                                />
                                {puedeImportar && (
                                    <Button
                                        variant="outline-success"
                                        size="sm"
                                        onClick={() => setMostrarModalCsv(true)}
                                        style={{ whiteSpace: "nowrap" }}
                                    >
                                        <i className="bi bi-upload me-1"></i>Importar CSV
                                    </Button>
                                )}
                            </div>

                            {cargandoAlimentos ? (
                                <p className="text-muted mb-0">Cargando alimentos de referencia...</p>
                            ) : !alimentos || alimentos.length === 0 ? (
                                <p className="text-muted mb-0">
                                    No se encontraron alimentos de referencia cargados para esta fuente.
                                </p>
                            ) : (
                                <AppTable columns={columnsAlimentos} data={alimentos} />
                            )}
                        </Card.Body>
                    </Card>
                </Tab>
            </AppTabs>

            <div className="d-flex flex-wrap justify-content-start gap-2 mb-4">
                <Button variant="outline-secondary" onClick={() => navigate('/fuentes-nutricionales')}>
                    <i className="bi bi-arrow-left me-1"></i>Volver a la lista
                </Button>
                {currentUser?.administrar && (
                    <Button
                        variant="primary"
                        disabled={!fuente.activo}
                        onClick={() => navigate(`/fuentes-nutricionales/${fuente.id}/edit`)}
                    >
                        <i className="bi bi-pencil me-1"></i>Editar Fuente
                    </Button>
                )}
            </div>

            {mostrarModalCsv && (
                <ImportarCsvFuenteModal
                    fuente={fuente}
                    onHide={() => setMostrarModalCsv(false)}
                    onImportado={() => {
                        if (urlAlimentos) mutate(urlAlimentos);
                    }}
                />
            )}
        </Container>
    );
}
