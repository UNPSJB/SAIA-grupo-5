import { Container, Alert, Col, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { InsumoForm } from "../components/InsumoForm";
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks/useApi";
import type { Insumo, NewInsumo } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import { PageLoading } from "../../../components/PageLoading";

export function EditarInsumoPage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el insumo
    const { id } = useParams();         //

    const { data: insumo, isLoading, error } = useApi<Insumo>(`/insumos/${id}`);

    const actualizarInsumo = async (datos: NewInsumo) => {
        try{
            await api.put(`/insumos/${id}`, datos);
            await mutate("/insumos/");
            await mutate(`/insumos/${id}`);     // Se agrego esto ya que habia un bug en el editar
            mostrarAlertaExito("El insumo se edito correctamente.");
            navigate("/insumos");
        } catch (error: any){
            let mensajeFinal = "No se pudo editar el insumo.";        // Si falla el servidor por alguna razon, creamos este mensaje predeterminado
            if (error.response?.data?.detail){      // Se le pregunta a Axios si el error tiene una respuesta del backend
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        }
    };

    const tituloPagina = "Editar Insumo";

    if (isLoading) return <PageLoading title={tituloPagina} />;

    if (!insumo) return (
        <Container>
            <PageHeader title="Insumo no encontrado" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">El insumo ingresado no existe</Alert>
                </Col>
            </Row>
        </Container>
    )

    if (error) return (
        <Container>
            <PageHeader title={tituloPagina} />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar el Insumo</Alert>
                </Col>
            </Row>
        </Container>
    )

    if (!insumo.activo) return (
        <Container>
            <PageHeader title={tituloPagina} />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="warning">No se puede editar un insumo dado de baja.</Alert>
                </Col>
            </Row>
        </Container>
    )


    return(
        <>
            <PageHeader title={tituloPagina}/>

            <Container>
                <InsumoForm textoBoton="Editar Insumo"
                    onSubmit={actualizarInsumo}
                    valoresIniciales={{ nombre: insumo.nombre, unidad_medida: insumo.unidad_medida}}/>
            </Container>
        </>
    )
}