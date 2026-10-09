import { useEffect, useState } from "react";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { PageLoading } from "../../../components/PageLoading";
import { PageError } from "../../../components/PageError";
import { useApi } from "../../../hooks/useApi";
import { api } from "../../../libs/axios";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import type { ConfiguracionSistema } from "../types";

const CONFIGURACION_URL = "/configuracion-sistema/";

function aHoraMinuto(hora: number, minuto: number): string {
    return `${String(hora).padStart(2, "0")}:${String(minuto).padStart(2, "0")}`;
}

export function ConfiguracionSistemaPage() {
    const { data: configuracion, error, isLoading } = useApi<ConfiguracionSistema>(CONFIGURACION_URL);

    const [diasAntelacion, setDiasAntelacion] = useState(15);
    const [diasAntelacionElementos, setDiasAntelacionElementos] = useState(15);
    const [horaGeneracion, setHoraGeneracion] = useState("07:00");
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        if (!configuracion) return;
        setDiasAntelacion(configuracion.dias_antelacion_vencimiento);
        setDiasAntelacionElementos(configuracion.dias_antelacion_elementos);
        setHoraGeneracion(aHoraMinuto(configuracion.hora_generacion_checklists, configuracion.minuto_generacion_checklists));
    }, [configuracion]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const [hora, minuto] = horaGeneracion.split(":").map(Number);

        setGuardando(true);
        try {
            await api.put(CONFIGURACION_URL, {
                dias_antelacion_vencimiento: diasAntelacion,
                dias_antelacion_elementos: diasAntelacionElementos,
                hora_generacion_checklists: hora,
                minuto_generacion_checklists: minuto,
            });
            await mutate(CONFIGURACION_URL);
            mostrarAlertaExito("La configuración del sistema se guardó correctamente.");
        } catch (err: any) {
            let mensajeFinal = "No se pudo guardar la configuración del sistema.";
            if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(err);
        } finally {
            setGuardando(false);
        }
    };

    if (isLoading) return <PageLoading title="Configuración del Sistema" />;

    if (error || !configuracion) return (
        <PageError title="Configuración del Sistema" message="Ocurrió un error al cargar la configuración del sistema." />
    );

    return (
        <Container>
            <PageHeader title="Configuración del Sistema" />

            <Row className="justify-content-center">
                <Col md={7} lg={6}>
                    <Card className="shadow-sm">
                        <Card.Header className="fw-bold">
                            <i className="bi bi-gear me-2"></i>Parámetros generales
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3 text-start" controlId="formDiasAntelacion">
                                    <Form.Label className="p-1 fw-bold">
                                        Antelación de alerta de vencimientos de personal (días)
                                    </Form.Label>
                                    <Form.Control
                                        required
                                        type="number"
                                        min={0}
                                        value={diasAntelacion}
                                        onChange={(e) => setDiasAntelacion(Number(e.target.value))}
                                    />
                                    <Form.Text className="text-muted">
                                        Con cuántos días de anticipación se avisa que un vencimiento de personal está por vencer.
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3 text-start" controlId="formDiasAntelacion">
                                    <Form.Label className="p-1 fw-bold">
                                        Antelación de alerta de vencimientos de elementos de limpieza (días)
                                    </Form.Label>
                                    <Form.Control
                                        required
                                        type="number"
                                        min={0}
                                        value={diasAntelacionElementos}
                                        onChange={(e) => setDiasAntelacionElementos(Number(e.target.value))}
                                    />
                                    <Form.Text className="text-muted">
                                        Con cuántos días de anticipación se avisa que un vencimiento de elementos está por vencer.
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3 text-start" controlId="formHoraGeneracion">
                                    <Form.Label className="p-1 fw-bold">
                                        Hora de generación de checklists
                                    </Form.Label>
                                    <Form.Control
                                        required
                                        type="time"
                                        value={horaGeneracion}
                                        onChange={(e) => setHoraGeneracion(e.target.value)}
                                    />
                                    <Form.Text className="text-muted">
                                        Hora del día en la que se generan automáticamente las tareas pendientes del checklist diario.
                                    </Form.Text>
                                </Form.Group>

                                <Button variant="primary" type="submit" disabled={guardando}>
                                    <i className="bi bi-floppy me-1"></i>
                                    {guardando ? "Guardando..." : "Guardar cambios"}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
