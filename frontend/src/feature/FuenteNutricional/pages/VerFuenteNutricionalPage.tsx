import { useState } from "react";
import { Container, Alert, Row, Col, Card, Button, Table, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { type TableColumn } from "react-data-table-component";
import { AppTable } from "../../../components/AppTable";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import { useAuth } from "../../../hooks/useAuth";
import type { AlimentoReferencia, FuenteNutricional } from "../types";
import { PageLoading } from "../../../components/PageLoading";
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

            <Row className="justify-content-center mt-3">
                <Col md={10}>
                    <Card className="shadow-sm border-0 rounded-3">
                        <Card.Body className="p-4">
                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Nombre</Col>
                                <Col sm={8} className="fs-6 fw-semibold">{fuente.nombre}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Origen</Col>
                                <Col sm={8}>{fuente.origen || <span className="text-muted fst-italic">Sin especificar</span>}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Licencia de Uso</Col>
                                <Col sm={8}>{fuente.licencia_uso}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Formato de Uso</Col>
                                <Col sm={8}>{fuente.formato_uso}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-start">
                                <Col sm={4} className="fw-bold text-secondary">Descripción</Col>
                                <Col sm={8}>{fuente.descripcion || <span className="text-muted fst-italic">Sin descripción</span>}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Estado</Col>
                                <Col sm={8}>
                                    <div
                                        style={{
                                            padding: '6px 16px',
                                            borderRadius: '20px',
                                            background: fuente.activo ? '#dcfce7' : '#fee2e2',
                                            color: fuente.activo ? '#166534' : '#991b1b',
                                            fontWeight: 700,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <i className={`bi ${fuente.activo ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-2`}></i>
                                        {fuente.activo ? 'Activo' : 'Inactivo'}
                                    </div>
                                </Col>
                            </Row>

                            <div className="p-3 rounded border mt-4 bg-white shadow-sm border-secondary-subtle">
                                <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                                    <h6 className="fw-bold text-primary mb-0">
                                        <i className="bi bi-patch-check me-2"></i>Verificación de Licencia
                                    </h6>
                                    <span className={`badge ${fuente.licencia_verificada ? "bg-success" : "bg-warning text-dark"}`}>
                                        {fuente.licencia_verificada ? "Verificada" : "Pendiente de verificación"}
                                    </span>
                                </div>

                                <Row className="mb-2 align-items-center">
                                    <Col sm={4} className="fw-bold text-secondary">Verificada por</Col>
                                    <Col sm={8}>
                                        {fuente.verificada_por
                                            ? `${fuente.verificada_por.nombre} ${fuente.verificada_por.apellido}`
                                            : <span className="text-muted fst-italic">Sin registrar</span>}
                                    </Col>
                                </Row>

                                <Row className="align-items-center">
                                    <Col sm={4} className="fw-bold text-secondary">Fecha de Verificación</Col>
                                    <Col sm={8}>
                                        {fuente.fecha_verificacion
                                            ? new Date(fuente.fecha_verificacion).toLocaleString("es-AR")
                                            : <span className="text-muted fst-italic">Sin registrar</span>}
                                    </Col>
                                </Row>
                            </div>

                            <hr className="my-4" />

                            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                                <h5 className="mb-0">
                                    <i className="bi bi-table me-2"></i>Alimentos de Referencia
                                </h5>

                                <div className="d-flex gap-2 align-items-center">
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

                        <Card.Footer className="bg-light border-top p-3 d-flex justify-content-start gap-2">
                            <Button
                                variant="outline-secondary"
                                onClick={() => navigate('/fuentes-nutricionales')}
                            >
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
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>

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