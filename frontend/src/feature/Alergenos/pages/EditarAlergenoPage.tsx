import { Container, Alert, Col, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { AlergenoForm } from "../components/AlergenoForm";
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks/useApi";
import type { Alergeno, NewAlergeno } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import { PageLoading } from "../../../components/PageLoading";

export function EditarAlergenoPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const { data: alergeno, isLoading, error } = useApi<Alergeno>(`/alergenos/${id}`);

    const actualizarAlergeno = async (datos: NewAlergeno) => {
        try {
            await api.put(`/alergenos/${id}`, datos);
            await mutate("/alergenos/");
            await mutate(`/alergenos/${id}`);
            mostrarAlertaExito("El alérgeno se editó correctamente.");
            navigate("/alergenos");
        } catch (error: any) {
            let mensajeFinal = "No se pudo editar el alérgeno.";
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        }
    };

    const tituloPagina = "Editar Alérgeno";

    if (isLoading) return <PageLoading title={tituloPagina} />;

    if (!alergeno) return (
        <Container>
            <PageHeader title="Alérgeno no encontrado" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">El alérgeno ingresado no existe.</Alert>
                </Col>
            </Row>
        </Container>
    );

    if (error) return (
        <Container>
            <PageHeader title={tituloPagina} />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar el alérgeno.</Alert>
                </Col>
            </Row>
        </Container>
    );

    return (
        <>
            <PageHeader title={tituloPagina} />
            <Container>
                <AlergenoForm
                    textoBoton="Guardar Cambios"
                    onSubmit={actualizarAlergeno}
                    valoresIniciales={{
                        nombre: alergeno.nombre,
                        descripcion: alergeno.descripcion,
                        es_tacc: alergeno.es_tacc,
                    }}
                />
            </Container>
        </>
    );
}