import { useState } from "react";
import { Alert, Badge, Button, Col, Form, ListGroup, Row, Spinner } from "react-bootstrap";
import { isAxiosError } from "axios";
import { mutate } from "swr";
import { useApi } from "../../../hooks/useApi";
import { useAuth } from "../../../hooks/useAuth";
import { api } from "../../../libs/axios";
import { EstadoBadge } from "../../../components/EstadoBadge";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import type { Alergeno, ContaminacionCruzadaItem, DeclaracionAlergenos } from "../types";
import { AppSwitch } from "../../../components/AppSwitch";

interface AlergenosRecetaFormProps {
    recetaId: number;
    recetaVigente?: boolean;
}

const formatearFecha = (fecha: string | null) =>
    fecha ? new Date(fecha).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" }) : "-";

export function AlergenosReceta({ recetaId, recetaVigente = true }: AlergenosRecetaFormProps) {
    const { currentUser } = useAuth();
    const [procesando, setProcesando] = useState(false);
    const [editando, setEditando] = useState(false);
    
    const [cruzada, setCruzada] = useState<ContaminacionCruzadaItem[]>([]);
    const [conservacion, setConservacion] = useState("");

    const endpoint = `/declaracion-alergenos/receta/${recetaId}`; 
    const { data: declaracion, error, isLoading } = useApi<DeclaracionAlergenos>(endpoint);
    const { data: alergenos } = useApi<Alergeno[]>(editando ? "/alergenos/" : null);

    const puedeEditar = Boolean(currentUser?.administrar && recetaVigente);
    const sinDeclaracion = isAxiosError(error) && error.response?.status === 404;

    const esLibreDeGluten = declaracion && !declaracion.contiene_gluten && declaracion.texto_gluten.startsWith("LIBRE DE GLUTEN");

    const manejarError = (err: unknown, mensajePorDefecto: string) => {
        const detail = isAxiosError(err) ? err.response?.data?.detail : undefined;
        mostrarAlertaError(detail ? (Array.isArray(detail) ? detail[0].msg : detail) : mensajePorDefecto);
    };

    const determinarAlergenos = async () => {
        setProcesando(true);
        try {
            const { data } = await api.post<DeclaracionAlergenos>(`/declaracion-alergenos/receta/${recetaId}/new`);
            await mutate(endpoint, data, false);
            mostrarAlertaExito("Se determinaron los alérgenos y la condición de gluten.");
        } catch (err) {
            manejarError(err, "No se pudieron determinar los alérgenos de la receta.");
        } finally {
            setProcesando(false);
        }
    };

    const confirmarDeclaracion = async () => {
        setProcesando(true);
        try {
            const { data } = await api.patch<DeclaracionAlergenos>(`/declaracion-alergenos/receta/${recetaId}/confirmar`);
            await mutate(endpoint, data, false);
            mostrarAlertaExito("Declaración de alérgenos confirmada.");
        } catch (err) {
            manejarError(err, "No se pudo confirmar la declaración.");
        } finally {
            setProcesando(false);
        }
    };

    const iniciarEdicion = () => {
        if (!declaracion) return;
        setCruzada(declaracion.contaminacion_cruzada.map(({ alergeno_id, es_derivado }) => ({ alergeno_id, es_derivado })));
        setConservacion(declaracion.condiciones_conservacion ?? "");
        setEditando(true);
    };

    const guardarEdicion = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcesando(true);
        try {
            const { data } = await api.put<DeclaracionAlergenos>(`/declaracion-alergenos/receta/${recetaId}`, {
                contaminacion_cruzada: cruzada,
                condiciones_conservacion: conservacion.trim() || null,
            });
            await mutate(endpoint, data, false);
            setEditando(false);
            mostrarAlertaExito("Declaración actualizada correctamente.");
        } catch (err) {
            manejarError(err, "No se pudo actualizar la declaración.");
        } finally {
            setProcesando(false);
        }
    };

    const cambiarSeleccionCruzada = (alergenoId: number) =>
        setCruzada((anterior) =>
            anterior.some((item) => item.alergeno_id === alergenoId)
                ? anterior.filter((item) => item.alergeno_id !== alergenoId)
                : [...anterior, { alergeno_id: alergenoId, es_derivado: false }]
        );

    const cambiarDerivadoCruzada = (alergenoId: number) =>
        setCruzada((anterior) =>
            anterior.map((item) => item.alergeno_id === alergenoId ? { ...item, es_derivado: !item.es_derivado } : item)
        );

    if (isLoading) {
        return (
            <div className="d-flex align-items-center gap-2 text-muted py-2">
                <Spinner animation="border" size="sm" /> Cargando declaración de alérgenos…
            </div>
        );
    }

    if (error && !sinDeclaracion) {
        return <Alert variant="danger" className="small text-start">Ocurrió un error al cargar los alérgenos.</Alert>;
    }

    return (
        <div className="text-start">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <div className="d-flex align-items-center gap-2">
                    {declaracion && (
                        <EstadoBadge
                            tono={declaracion.estado === "Confirmada" ? "success" : "warning"}
                            icono={declaracion.estado === "Confirmada" ? "bi-check-circle-fill" : "bi-clock-history"}
                        >
                            {declaracion.estado}
                        </EstadoBadge>
                    )}
                    {declaracion?.confirmada_por && (
                        <span className="text-muted small">
                            Confirmada por {declaracion.confirmada_por.nombre} {declaracion.confirmada_por.apellido} ({formatearFecha(declaracion.fecha_confirmacion)})
                        </span>
                    )}
                </div>

                {puedeEditar && !editando && (
                    <div className="d-flex flex-wrap gap-2">
                        <Button
                            variant={declaracion ? "outline-primary" : "primary"}
                            size="sm"
                            disabled={procesando}
                            onClick={determinarAlergenos}
                        >
                            <i className="bi bi-list-check me-1"></i>
                            {declaracion ? "Redeteminar alérgenos" : "Determinar alérgenos"}
                        </Button>

                        {declaracion && (
                            <>
                                <Button variant="outline-secondary" size="sm" disabled={procesando} onClick={iniciarEdicion}>
                                    <i className="bi bi-pencil me-1"></i> Editar declaración
                                </Button>

                                {declaracion.estado !== "Confirmada" && (
                                    <Button variant="success" size="sm" disabled={procesando} onClick={confirmarDeclaracion}>
                                        <i className="bi bi-check-lg me-1"></i> Confirmar
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {!declaracion ? (
                <Alert variant="secondary" className="small mb-0">
                    <i className="bi bi-info-circle me-1"></i>
                    Esta receta aún no tiene una declaración de alérgenos generada.
                </Alert>
            ) : editando ? (
                <Form onSubmit={guardarEdicion} className="p-3 border rounded bg-light">
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold small">
                            Posible contaminación cruzada ("PUEDE CONTENER...")
                        </Form.Label>
                        <ListGroup style={{ maxHeight: "200px", overflowY: "auto" }}>
                            {(alergenos ?? []).filter((alergeno) => alergeno.activo).map((alergeno) => {
                                const seleccionado = cruzada.find((item) => item.alergeno_id === alergeno.id);
                                return (
                                    <ListGroup.Item
                                        key={alergeno.id}
                                        className="d-flex justify-content-between align-items-center py-2"
                                    >
                                        <Form.Check
                                            type="checkbox"
                                            id={`cc-${alergeno.id}`}
                                            label={alergeno.nombre}
                                            checked={Boolean(seleccionado)}
                                            onChange={() => cambiarSeleccionCruzada(alergeno.id)}
                                        />
                                        {seleccionado && (
                                            <AppSwitch
                                                id={`cc-der-${alergeno.id}`}
                                                label="Derivado"
                                                checked={seleccionado.es_derivado}
                                                onChange={() => cambiarDerivadoCruzada(alergeno.id)}
                                            />
                                        )}
                                    </ListGroup.Item>
                                );
                            })}
                        </ListGroup>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold small">Condiciones de conservación</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            maxLength={500}
                            placeholder="Ej: Conservar en lugar fresco y seco."
                            value={conservacion}
                            onChange={(e) => setConservacion(e.target.value)}
                        />
                    </Form.Group>

                    <div className="d-flex gap-2">
                        <Button variant="secondary" size="sm" type="button" onClick={() => setEditando(false)}>
                            Cancelar
                        </Button>
                        <Button variant="primary" size="sm" type="submit" disabled={procesando}>
                            <i className="bi bi-floppy me-1"></i> Guardar cambios
                        </Button>
                    </div>
                </Form>
            ) : (
                <ListGroup>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div>
                            <div className="text-muted small mb-1">Condición respecto al gluten</div>
                            <EstadoBadge
                                tono={esLibreDeGluten ? "success" : "warning"}
                                icono={esLibreDeGluten ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"}
                            >
                                {declaracion.texto_gluten}
                            </EstadoBadge>
                        </div>
                    </ListGroup.Item>

                    <ListGroup.Item>
                        <Row className="g-3">
                            <Col md={6}>
                                <div className="text-muted small mb-1">Alérgenos en ingredientes</div>
                                {declaracion.alergenos_detectados.length === 0 ? (
                                    <span className="text-muted small fst-italic">Ninguno detectado.</span>
                                ) : (
                                    <div className="d-flex flex-wrap gap-1">
                                        {declaracion.alergenos_detectados.map((alergeno) => (
                                            <Badge key={`${alergeno.alergeno_id}-${alergeno.es_derivado}`} bg="secondary">
                                                {alergeno.nombre}{alergeno.es_derivado ? " (Derivado)" : ""}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </Col>

                            <Col md={6}>
                                <div className="text-muted small mb-1">Posible contaminación cruzada</div>
                                {declaracion.contaminacion_cruzada.length === 0 ? (
                                    <span className="text-muted small fst-italic">Sin trazas declaradas.</span>
                                ) : (
                                    <div className="d-flex flex-wrap gap-1">
                                        {declaracion.contaminacion_cruzada.map((alergeno) => (
                                            <Badge key={`cc-${alergeno.alergeno_id}`} bg="warning" text="dark">
                                                {alergeno.nombre}{alergeno.es_derivado ? " (Derivado)" : ""}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </Col>
                        </Row>
                    </ListGroup.Item>

                    {(declaracion.texto_alergenos || declaracion.texto_contaminacion_cruzada) && (
                        <ListGroup.Item className="bg-light">
                            <div className="text-muted small mb-1">Leyendas obligatorias para el rótulo (CAA)</div>
                            {declaracion.texto_alergenos && (
                                <div className="fw-bold small">{declaracion.texto_alergenos}</div>
                            )}
                            {declaracion.texto_contaminacion_cruzada && (
                                <div className="fw-bold small mt-1">{declaracion.texto_contaminacion_cruzada}</div>
                            )}
                        </ListGroup.Item>
                    )}

                    <ListGroup.Item>
                        <div className="text-muted small mb-1">Condiciones de conservación</div>
                        <div className="small">
                            {declaracion.condiciones_conservacion || (
                                <span className="text-muted fst-italic">Sin especificar.</span>
                            )}
                        </div>
                    </ListGroup.Item>
                </ListGroup>
            )}
        </div>
    );
}