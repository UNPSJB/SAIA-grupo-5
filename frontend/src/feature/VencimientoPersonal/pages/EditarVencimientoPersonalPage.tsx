import { Container, Alert, Col, Row } from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { VencimientoPersonalForm } from "../components/VencimientoPersonalForm";
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks/useApi";
import type { VencimientoPersonal, NewVencimientoPersonal } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import { PageLoading } from "../../../components/PageLoading";

export function EditarVencimientoPersonalPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const { data: vencimiento, isLoading, error } = useApi<VencimientoPersonal>(`/vencimiento-personal/${id}`);
    
    const locacion = useLocation();
    const rutaVolver = locacion.state?.rutaVolver || `/personal/${vencimiento?.persona_id}/vencimientos`;

    const actualizarVencimiento = async (datos: NewVencimientoPersonal) => {
        try {
            await api.put(`/vencimiento-personal/${id}`, datos);
            if (vencimiento) {
                await mutate(`/vencimiento-personal/persona/${vencimiento.persona_id}`);
            }
            await mutate(`/vencimiento-personal/`);
            await mutate(`/vencimiento-personal/${id}`);
            mostrarAlertaExito("El vencimiento se edito correctamente.");
            navigate(rutaVolver);
        } catch (error: any) {
            let mensajeFinal = "No se pudo editar el vencimiento.";
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        }
    };

    const tituloPagina = "Editar Vencimiento";

    if (isLoading) return <PageLoading title={tituloPagina} />;

    if (!vencimiento) return (
        <Container>
            <PageHeader title="Vencimiento no encontrado" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">El Vencimiento ingresado no existe.</Alert>
                </Col>
            </Row>
        </Container>
    );

    if (error) return (
        <Container>
            <PageHeader title={tituloPagina} />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar el Vencimiento.</Alert>
                </Col>
            </Row>
        </Container>
    );

    return (
        <>
            <PageHeader title={tituloPagina} />
            <Container>
                <VencimientoPersonalForm
                    textoBoton="Editar Vencimiento"
                    esEdicion={true}
                    rutaCancelar={rutaVolver}
                    onSubmit={actualizarVencimiento}
                    valoresIniciales={{
                        tipo_vencimiento_id: vencimiento.tipo_vencimiento_id,
                        fecha_desde: vencimiento.fecha_desde,
                        fecha_hasta: vencimiento.fecha_hasta,
                        observacion: vencimiento.observacion || "",
                        archivo_adjunto: vencimiento.archivo_adjunto,
                    }}
                />
            </Container>
        </>
    );
}