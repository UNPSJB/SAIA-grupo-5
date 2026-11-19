import { Container, Alert, Col, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { FuenteNutricionalForm } from "../components/FuenteNutricionalForm";
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks/useApi";
import type { FuenteNutricional, NewFuenteNutricional } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import { PageLoading } from "../../../components/PageLoading";

export function EditarFuenteNutricionalPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const { data: fuente, isLoading, error } = useApi<FuenteNutricional>(`/fuentes-nutricionales/${id}`);

    const actualizarFuente = async (datos: NewFuenteNutricional) => {
        try {
            await api.put(`/fuentes-nutricionales/${id}`, datos);
            await mutate("/fuentes-nutricionales/");
            await mutate(`/fuentes-nutricionales/${id}`);
            mostrarAlertaExito("La fuente nutricional se editó correctamente.");
            navigate("/fuentes-nutricionales");
        } catch (error: any) {
            let mensajeFinal = "No se pudo editar la fuente nutricional.";
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        }
    };

    const tituloPagina = "Editar Fuente Nutricional";

    if (isLoading) return <PageLoading title={tituloPagina} />;

    if (!fuente) return (
        <Container>
            <PageHeader title="Fuente nutricional no encontrada" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">La fuente nutricional ingresada no existe.</Alert>
                </Col>
            </Row>
        </Container>
    );

    if (error) return (
        <Container>
            <PageHeader title={tituloPagina} />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar la fuente nutricional.</Alert>
                </Col>
            </Row>
        </Container>
    );

    return (
        <>
            <PageHeader title={tituloPagina} />
            <Container>
                <FuenteNutricionalForm
                    textoBoton="Guardar Cambios"
                    onSubmit={actualizarFuente}
                    valoresIniciales={{
                        nombre: fuente.nombre,
                        descripcion: fuente.descripcion,
                        origen: fuente.origen,
                        licencia_uso: fuente.licencia_uso,
                        formato_uso: fuente.formato_uso,
                        licencia_verificada: fuente.licencia_verificada,
                    }}
                />
            </Container>
        </>
    );
}