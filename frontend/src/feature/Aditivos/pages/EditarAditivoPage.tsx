import { Alert, Col, Container, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { mutate } from "swr";
import { isAxiosError } from "axios";
import { PageHeader } from "../../../components/PageHeader";
import { PageLoading } from "../../../components/PageLoading";
import { AditivoForm } from "../components/AditivoForm";
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks/useApi";
import type { Aditivo, NewAditivo } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

export function EditarAditivoPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { data: aditivo, isLoading, error } = useApi<Aditivo>(`/aditivos/${id}`);

    const actualizarAditivo = async (datos: NewAditivo) => {
        try {
            await api.put(`/aditivos/${id}`, datos);
            await mutate("/aditivos/");
            await mutate(`/aditivos/${id}`);
            mostrarAlertaExito("El aditivo se editó correctamente.");
            navigate("/aditivos");
        } catch (error) {
            let mensajeFinal = "No se pudo editar el aditivo.";
            const detail = isAxiosError(error) ? error.response?.data?.detail : undefined;
            if (detail) {
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        }
    };

    const tituloPagina = "Editar Aditivo";

    if (isLoading) return <PageLoading title={tituloPagina} />;

    if (!aditivo || error) return (
        <Container>
            <PageHeader title={tituloPagina} />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">{error ? "Ocurrió un error al cargar el aditivo." : "El aditivo ingresado no existe."}</Alert>
                </Col>
            </Row>
        </Container>
    );

    if (!aditivo.activo) return (
        <Container>
            <PageHeader title={tituloPagina} />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="warning">No se puede editar un aditivo dado de baja.</Alert>
                </Col>
            </Row>
        </Container>
    );

    return (
        <>
            <PageHeader title={tituloPagina} />

            <Container>
                <AditivoForm
                    textoBoton="Editar Aditivo"
                    onSubmit={actualizarAditivo}
                    valoresIniciales={{
                        clase_funcional: aditivo.clase_funcional,
                        nombre: aditivo.nombre,
                        numero_ins: aditivo.numero_ins,
                    }}
                />
            </Container>
        </>
    );
}
