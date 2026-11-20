import { useState } from "react";
import { Container, Alert, Row, Col, Card, Button, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import type { Insumo } from "../types";
import type { InfoNutricional, HistorialNutricionalInsumo } from "../../InformacionNutricionalInsumo/types";
import { DATOS_NUTRICIONALES_CAA } from '../../InformacionNutricionalInsumo/types';
import { HistorialNutricionalModal } from "../../InformacionNutricionalInsumo/components/HistorialNutricionalModal";
import { PageLoading } from "../../../components/PageLoading";
import { useAuth } from "../../../hooks";

export function VerInsumoPage() {
    const navigate = useNavigate();
    const { id } = useParams(); 
    const { currentUser } = useAuth();
    const [showHistorialModal, setShowHistorialModal] = useState(false);

    const { data: insumo, isLoading, error } = useApi<Insumo>(`/insumos/${id}`);
    const { data: infoNutricional } = useApi<InfoNutricional>(id ? `/informaciones-nutricionales/insumo/${id}` : null);
    const { data: historial } = useApi<HistorialNutricionalInsumo[]>(infoNutricional ? `/historial-nutricional/info-nutricional/${infoNutricional.id}` : null);

    const tituloPagina = "Detalle del Insumo";

    if (isLoading) return  <PageLoading title={tituloPagina} />;

    if (!insumo || error) return (
        <Container>
            <PageHeader title="Insumo no encontrado." />
            <Row className="justify-content-center mt-4">
                <Col md={6}>
                    <Alert variant="danger" className="text-center shadow-sm">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error ? "Ocurrio un error al cargar los datos." : "El Insumo ingresado no existe."}
                    </Alert>
                </Col>
            </Row>
        </Container>
    );

    return (
        <Container>
            <PageHeader title={tituloPagina} />

            <Row className="justify-content-center mt-3">
                <Col md={8}>
                    <Card className="shadow-sm border-0 rounded-3">
                        <Card.Body className="p-4">
                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Nombre</Col>
                                <Col sm={8} className="fs-5">{insumo.nombre}</Col>
                            </Row>
                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Marca</Col>
                                <Col sm={8} className="fs-6">{insumo.marca}</Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Unidad de Medida</Col>
                                <Col sm={8}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div
                                            style={{
                                            padding: '4px 12px',
                                            borderRadius: '16px',
                                            background: '#dbeafe',
                                            color: '#1d4ed8',
                                            fontWeight: 700,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {insumo.unidad_medida.nombre}
                                    </div>
                                </div>
                                </Col>
                            </Row>

                            <Row className="mb-3 border-bottom pb-3">
                                <Col sm={4} className="fw-bold text-secondary"> Información nutricional <div className="small fw-normal">cada 100 g o ml</div></Col>
                                <Col sm={8}>
                                    {!infoNutricional ? (
                                        <span className="text-muted fst-italic">Sin información nutricional cargada</span>
                                    ) : (
                                        <>
                                            <div className="mb-2 p-2 rounded bg-light border small">
                                                <div><strong>Fuente:</strong> {infoNutricional.fuente_nutricional?.nombre}</div>
                                                <div><strong>Referencia:</strong> {infoNutricional.referencia_fuente || "-"}</div>
                                                <div>
                                                    <strong>Cargada por:</strong> {infoNutricional.cargada_por?.nombre} {infoNutricional.cargada_por?.apellido} ({new Date(infoNutricional.fecha_carga).toLocaleDateString("es-AR")})
                                                </div>
                                                {infoNutricional.modificado && (
                                                    <div className="text-warning-emphasis mt-1">
                                                        <i className="bi bi-pencil-square me-1"></i>
                                                        Dato modificado
                                                        {infoNutricional.modificada_por
                                                            ? ` por ${infoNutricional.modificada_por.nombre} ${infoNutricional.modificada_por.apellido}`
                                                            : ""}
                                                        {infoNutricional.fecha_modificacion
                                                            ? ` el ${new Date(infoNutricional.fecha_modificacion).toLocaleDateString("es-AR")}`
                                                            : ""}
                                                    </div>
                                                )}
                                            </div>

                                            <Table size="sm" bordered className="mb-0">
                                                <tbody>
                                                    {DATOS_NUTRICIONALES_CAA.map(({ dato, etiqueta, unidad }) => (
                                                        <tr key={dato}>
                                                            <td>{etiqueta}</td>
                                                            <td className="text-end fw-semibold">
                                                                {infoNutricional[dato] ?? "-"} {unidad}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>

                                            <div className="mt-3">
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={() => setShowHistorialModal(true)}
                                                >
                                                    <i className="bi bi-clock-history me-1"></i>
                                                    Ver historial de cambios {historial && historial.length > 0 ? ` (${historial.length})` : ""}
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </Col>
                            </Row>
                            <Row className="mb-2 align-items-center">
                                <Col sm={4} className="fw-bold text-secondary">Estado Actual</Col>
                                <Col sm={8}>
                                    <div
                                        style={{
                                            padding: '6px 16px',
                                            borderRadius: '20px',
                                            background: insumo.activo ? '#dcfce7' : '#fee2e2',
                                            color: insumo.activo ? '#166534' : '#991b1b',
                                            fontWeight: 700,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <i className={`bi ${insumo.activo ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-2`}></i>
                                        {insumo.activo ? 'Activo' : 'Inactivo'}
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>

                        <Card.Footer className="bg-light border-top p-3 d-flex justify-content-start gap-2">
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => navigate('/insumos')}
                            >
                                <i className="bi bi-arrow-left me-1"></i>Volver a la lista
                            </Button>
                            {currentUser?.administrar && (
                                <Button 
                                    variant="primary" 
                                    disabled={!insumo.activo}
                                    onClick={() => navigate(`/insumos/${insumo.id}/edit`)}
                                >
                                    <i className="bi bi-pencil me-1"></i>Editar Insumo   

                                </Button>
                            )}
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
            <HistorialNutricionalModal
                show={showHistorialModal}
                onHide={() => setShowHistorialModal(false)}
                historial={historial ?? []}
            />
        </Container>
    );
}



