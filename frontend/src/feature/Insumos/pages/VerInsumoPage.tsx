import { useState } from "react";
import { Container, Alert, Row, Col, Card, Button, Table, Badge, Tab } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import type { Insumo } from "../types";
import type { InfoNutricional, HistorialNutricionalInsumo } from "../../InformacionNutricionalInsumo/types";
import { DATOS_NUTRICIONALES_CAA } from '../../InformacionNutricionalInsumo/types';
import { HistorialNutricionalModal } from "../../InformacionNutricionalInsumo/components/HistorialNutricionalModal";
import type { InsumoAlergenos } from "../../Alergenos/types";
import { PageLoading } from "../../../components/PageLoading";
import { useAuth } from "../../../hooks";
import { AppTabs } from "../../../components/AppTabs";
import { Dato } from "../../../components/Dato";
import { EstadoBadge } from "../../../components/EstadoBadge";

export function VerInsumoPage() {
    const navigate = useNavigate();
    const { id } = useParams(); 
    const { currentUser } = useAuth();
    const [showHistorialModal, setShowHistorialModal] = useState(false);

    const { data: insumo, isLoading, error } = useApi<Insumo>(`/insumos/${id}`);
    const { data: infoNutricional } = useApi<InfoNutricional>(id ? `/informaciones-nutricionales/insumo/${id}` : null);
    const { data: infoAlergenos } = useApi<InsumoAlergenos>(id ? `/alergenos/insumo/${id}` : null);
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

    const contieneGluten = infoAlergenos?.contiene_gluten ?? false;
    const listaAlergenos = infoAlergenos?.alergenos ?? [];

    return (
        <Container>
            <PageHeader title={tituloPagina} />

            <AppTabs defaultActiveKey="general" id="secciones-insumo" className="mb-3 mt-3" mountOnEnter>
                <Tab eventKey="general" title="Información general">
                    <Card className="shadow-sm border-0 rounded-3 mb-4 text-start">
                        <Card.Body className="p-4">
                            <h6 className="detalle-seccion-titulo">Datos del insumo</h6>
                            <Row className="g-3 mb-4">
                                <Dato etiqueta="Nombre" md={6} lg={3}>
                                    <span className="fw-semibold">{insumo.nombre}</span>
                                </Dato>
                                <Dato etiqueta="Marca" md={6} lg={3}>{insumo.marca}</Dato>
                                <Dato etiqueta="Unidad de Medida" md={6} lg={3}>
                                    <EstadoBadge tono="info">{insumo.unidad_medida.nombre}</EstadoBadge>
                                </Dato>
                                <Dato etiqueta="Estado Actual" md={6} lg={3}>
                                    <EstadoBadge
                                        tono={insumo.activo ? "success" : "danger"}
                                        icono={insumo.activo ? "bi-check-circle-fill" : "bi-x-circle-fill"}
                                    >
                                        {insumo.activo ? "Activo" : "Inactivo"}
                                    </EstadoBadge>
                                </Dato>
                            </Row>

                            <h6 className="detalle-seccion-titulo">Alérgenos y Gluten</h6>
                            <Row className="g-3">
                                <Dato etiqueta="Gluten" md={4}>
                                    {contieneGluten ? (
                                        <EstadoBadge tono="warning" icono="bi-exclamation-triangle-fill">Contiene Gluten (Con TACC)</EstadoBadge>
                                    ) : (
                                        <EstadoBadge tono="success" icono="bi-check-circle-fill">Sin Gluten (Sin TACC)</EstadoBadge>
                                    )}
                                </Dato>
                                <Dato etiqueta="Alérgenos declarados" md={8}>
                                    {listaAlergenos.length === 0 ? (
                                        <span className="text-muted fst-italic">Sin alérgenos declarados</span>
                                    ) : (
                                        <div className="d-flex flex-wrap gap-2">
                                            {listaAlergenos.map((item) => (
                                                <Badge
                                                    key={item.id}
                                                    bg="light"
                                                    text="dark"
                                                    className="border px-2 py-1 fw-normal"
                                                >
                                                    <strong>{item.alergeno.nombre}</strong>
                                                    {item.es_derivado ? " (Derivado)" : ""}
                                                    {item.alergeno.es_tacc ? " • TACC" : ""}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </Dato>
                            </Row>
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="nutricional" title="Información nutricional">
                    <Card className="shadow-sm border-0 rounded-3 mb-4 text-start">
                        <Card.Body className="p-4">
                            {!infoNutricional ? (
                                <span className="text-muted fst-italic">Sin información nutricional cargada</span>
                            ) : (
                                <>
                                    <h6 className="detalle-seccion-titulo">Origen del dato</h6>
                                    <Row className="g-3 mb-4">
                                        <Dato etiqueta="Fuente" md={6} lg={4}>{infoNutricional.fuente_nutricional?.nombre}</Dato>
                                        <Dato etiqueta="Referencia" md={6} lg={4}>{infoNutricional.referencia_fuente || "-"}</Dato>
                                        <Dato etiqueta="Cargada por" md={6} lg={4}>
                                            {infoNutricional.cargada_por?.nombre} {infoNutricional.cargada_por?.apellido}
                                            <div className="text-muted small">{new Date(infoNutricional.fecha_carga).toLocaleDateString("es-AR")}</div>
                                        </Dato>
                                        {infoNutricional.modificado && (
                                            <Dato etiqueta="Última modificación">
                                                <span className="text-warning-emphasis">
                                                    <i className="bi bi-pencil-square me-1"></i>
                                                    Dato modificado
                                                    {infoNutricional.modificada_por
                                                        ? ` por ${infoNutricional.modificada_por.nombre} ${infoNutricional.modificada_por.apellido}`
                                                        : ""}
                                                    {infoNutricional.fecha_modificacion
                                                        ? ` el ${new Date(infoNutricional.fecha_modificacion).toLocaleDateString("es-AR")}`
                                                        : ""}
                                                </span>
                                            </Dato>
                                        )}
                                    </Row>

                                    <h6 className="detalle-seccion-titulo d-flex justify-content-between align-items-center gap-2">
                                        <span>Valores cada 100 g o ml</span>
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={() => setShowHistorialModal(true)}
                                        >
                                            <i className="bi bi-clock-history me-1"></i>
                                            Ver historial de cambios{historial && historial.length > 0 ? ` (${historial.length})` : ""}
                                        </Button>
                                    </h6>
                                    <Table size="sm" bordered hover className="mb-0">
                                        <tbody>
                                            {DATOS_NUTRICIONALES_CAA.map(({ dato, etiqueta, unidad }) => (
                                                <tr key={dato}>
                                                    <td className="px-3 py-2">{etiqueta}</td>
                                                    <td className="text-end fw-semibold px-3 py-2">
                                                        {infoNutricional[dato] ?? "-"} {unidad}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Tab>
            </AppTabs>

            <div className="d-flex flex-wrap justify-content-start gap-2 mb-4">
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
            </div>

            <HistorialNutricionalModal
                show={showHistorialModal}
                onHide={() => setShowHistorialModal(false)}
                historial={historial ?? []}
            />
        </Container>
    );
}
