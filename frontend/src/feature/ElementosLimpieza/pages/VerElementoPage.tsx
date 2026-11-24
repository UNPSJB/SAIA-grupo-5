import { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { Container, Spinner, Alert, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { Dato } from "../../../components/Dato";
import { EstadoBadge, type TonoEstado } from "../../../components/EstadoBadge";
import { useApi } from "../../../hooks/useApi";
import type { ElementoLimpieza } from "../types";
import type { TipoElementoLimpieza } from "../../TiposElementoLimpieza/types";
import type { RecambioElementoLimpieza } from "../../RecambiosElementosLimpieza/types";
import { HistorialRecambiosModal } from "../../RecambiosElementosLimpieza/components/HistorialRecambioModal";

export function VerElementoPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { currentUser } = useAuth();
    const [mostrarHistorial, setMostrarHistorial] = useState(false);
    const location = useLocation();
    const origen = location.state?.origen;
    const volverA = origen === "vencimiento"
        ? "/vencimientos?default=elementos"
        : "/elementos-limpieza/";

    const { data: elementoLimpieza, isLoading, error } = useApi<ElementoLimpieza>(`/elementos-limpieza/${id}`);
    const { data: recambios } = useApi<RecambioElementoLimpieza[]>(`/recambios-elementos-limpieza/elemento/${id}`);
    const { data: tipos } = useApi<TipoElementoLimpieza[]>("/elementos-limpieza/tipos");

    const nombreTipo = tipos?.find(tipo => tipo.id === elementoLimpieza?.tipo_id)?.nombre ?? "-";

    if (isLoading) return (
        <>
            <PageHeader title="Detalle del Elemento de Limpieza" />
            <Spinner animation="border" role="status" className="d-block mx-auto mt-5 text-primary">
                <span className="visually-hidden">Cargando...</span>
            </Spinner>
        </>
    );

    if (!elementoLimpieza || error) return (
        <Container>
            <PageHeader title="Elemento de Limpieza no encontrado." />
            <Row className="justify-content-center mt-4">
                <Col md={6}>
                    <Alert variant="danger" className="text-center shadow-sm">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error ? "Ocurrió un error al cargar los datos." : "El Elemento de Limpieza ingresado no existe."}
                    </Alert>
                </Col>
            </Row>
        </Container>
    );

    const dias = elementoLimpieza.dias_restantes;
    const recambio: { tono: TonoEstado; texto: string } | null = dias === null
        ? null
        : dias < 0
            ? { tono: "danger", texto: "Vencido" }
            : dias === 0
                ? { tono: "warning", texto: "Recambio hoy" }
                : { tono: "success", texto: `${dias} ${dias === 1 ? "día" : "días"}` };

    return (
        <Container>
            <PageHeader title="Detalle del Elemento de Limpieza" />

            <Card className="shadow-sm border-0 rounded-3 mb-4 mt-3 text-start">
                <Card.Body className="p-4">
                    <h6 className="detalle-seccion-titulo">Datos del elemento</h6>
                    <Row className="g-3 mb-4">
                        <Dato etiqueta="Código" md={6} lg={3}>
                            <span className="fw-bold">{elementoLimpieza.codigo}</span>
                        </Dato>
                        <Dato etiqueta="Nombre" md={6} lg={3}>
                            <span className="fw-semibold">{elementoLimpieza.nombre}</span>
                        </Dato>
                        <Dato etiqueta="Tipo" md={6} lg={3}>{nombreTipo}</Dato>
                        <Dato etiqueta="Estado Actual" md={6} lg={3}>
                            <EstadoBadge
                                tono={elementoLimpieza.estado ? "success" : "danger"}
                                icono={elementoLimpieza.estado ? "bi-check-circle-fill" : "bi-x-circle-fill"}
                            >
                                {elementoLimpieza.estado ? "Activo" : "Inactivo"}
                            </EstadoBadge>
                        </Dato>
                        <Dato etiqueta="Material" md={6}>{elementoLimpieza.material ?? "-"}</Dato>
                        <Dato etiqueta="Ubicación" md={6}>{elementoLimpieza.ubicacion ?? "-"}</Dato>
                    </Row>

                    <h6 className="detalle-seccion-titulo d-flex justify-content-between align-items-center gap-2">
                        <span>Recambio</span>
                        <Button variant="outline-primary" size="sm" onClick={() => setMostrarHistorial(true)}>
                            <i className="bi bi-clock-history me-1"></i>
                            Historial de Recambios{recambios && recambios.length > 0 ? ` (${recambios.length})` : ""}
                        </Button>
                    </h6>
                    <Row className="g-3">
                        <Dato etiqueta="Frecuencia de recambio" md={6}>
                            {elementoLimpieza.frecuencia_recambio
                                ? `${elementoLimpieza.frecuencia_recambio} días`
                                : <span className="text-muted fst-italic">Sin definir</span>}
                        </Dato>
                        <Dato etiqueta="Días para recambio" md={6}>
                            {recambio
                                ? <EstadoBadge tono={recambio.tono}>{recambio.texto}</EstadoBadge>
                                : <span className="text-muted fst-italic">Sin definir</span>}
                        </Dato>
                    </Row>
                </Card.Body>
            </Card>

            <div className="d-flex flex-wrap justify-content-start gap-2 mb-4">
                <Button variant="outline-secondary" onClick={() => navigate(volverA)}>
                    <i className="bi bi-arrow-left me-1"></i>
                    Volver a la lista
                </Button>
                {currentUser?.administrar && elementoLimpieza.estado && (
                    <Button
                        variant="success"
                        onClick={() => navigate(`/recambios-elementos-limpieza/new/${elementoLimpieza.id}`)}
                    >
                        <i className="bi bi-arrow-repeat me-1"></i>
                        Registrar Recambio
                    </Button>
                )}
                {currentUser?.administrar && (
                    <Button
                        variant="primary"
                        disabled={!elementoLimpieza.estado}
                        onClick={() => navigate(`/elementos-limpieza/${elementoLimpieza.id}/edit`)}
                    >
                        <i className="bi bi-pencil me-1"></i>
                        Editar Elemento
                    </Button>
                )}
            </div>

            <HistorialRecambiosModal
                show={mostrarHistorial}
                onHide={() => setMostrarHistorial(false)}
                recambios={recambios ?? []}
            />
        </Container>
    );
}
