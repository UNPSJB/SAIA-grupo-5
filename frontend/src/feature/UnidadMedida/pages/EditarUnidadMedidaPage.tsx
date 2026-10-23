import { Container, Alert, Col, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { UnidadMedidaForm } from "../components/UnidadMedidaForm";
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks/useApi";
import type { UnidadMedida, NewUnidadMedida } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import { PageLoading } from "../../../components/PageLoading";

export function EditarUnidadMedidaPage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el insumo
    const { id } = useParams();         

    const { data: unidadMedida, isLoading, error } = useApi<UnidadMedida>(`/unidades-medida/${id}`);

    const actualizarUnidadMedida = async (datos: NewUnidadMedida) => {
        try{
            await api.put(`/unidades-medida/${id}`, datos);
            await mutate("/unidades-medida/");
            await mutate(`/unidades-medida/${id}`);     // Se agrego esto ya que habia un bug en el editar
            mostrarAlertaExito("La unidad de medida se edito correctamente.");
            navigate("/unidades-medida");
        } catch (error: any){
            let mensajeFinal = "No se pudo editar la unidad de medida.";        // Si falla el servidor por alguna razon, creamos este mensaje predeterminado
            if (error.response?.data?.detail){      // Se le pregunta a Axios si el error tiene una respuesta del backend
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        }
    };

    const tituloPagina = "Editar Unidad de Medida"

    if (isLoading) return <PageLoading title={tituloPagina} />;

    if (!unidadMedida) return (
        <Container>
            <PageHeader title={tituloPagina} />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">La Unidad de Medida ingresada no existe.</Alert>
                </Col>
            </Row>
        </Container>
    )

    if (error) return (
        <Container>
            <PageHeader title={tituloPagina} />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar la Unidad de Medida.</Alert>
                </Col>
            </Row>
        </Container>
    )


    return(
        <>
            <PageHeader title={tituloPagina}/>

            <Container>
                <UnidadMedidaForm textoBoton="Editar Unidad de Medida"
                    onSubmit={actualizarUnidadMedida}
                    valoresIniciales={{ nombre: unidadMedida.nombre}}/>
            </Container>
        </>
    )
}