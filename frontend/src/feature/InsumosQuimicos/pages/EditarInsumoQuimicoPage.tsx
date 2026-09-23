import { Container, Spinner, Alert, Col, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { InsumoQuimicoForm } from "../components/InsumoQuimicoForm"; 
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks/useApi";
import type { InsumoQuimico, NewInsumoQuimico } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

export function EditarInsumoQuimicoPage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el insumo
    const { id } = useParams();         //

    const { data: insumoQuimico, isLoading, error } = useApi<InsumoQuimico>(`/insumos-quimicos/${id}`);

    const actualizarInsumoQuimico = async (datos: NewInsumoQuimico) => {
        try{
            await api.put(`/insumos-quimicos/${id}`, datos);
            await mutate("/insumos-quimicos/");
            await mutate(`/insumos-quimicos/${id}`);     // Se agrego esto ya que habia un bug en el editar
            mostrarAlertaExito("El insumo químico se edito correctamente.");
            navigate("/insumos-quimicos");
        } catch (error: any){
            let mensaje = "No se pudo editar el insumo químico.";        // Si falla el servidor por alguna razon, creamos este mensaje predeterminado
            if (error.response?.data?.detail){      // Se le pregunta a Axios si el error tiene una respuesta del backend
                if (Array.isArray(error.response.data.detail)) {        // Puede pasar que FastAPI mande el detail como un arreglo
                    mensaje = error.response.data.detail[0].msg;        // Si es un arreglo metemos en mensaje eel primer error de la lista y solamente nos quedamos con el mensaje en si por eso usamos al final .msg
                } else {
                    mensaje = error.response.data.detail;   // Si paso por el else el detail es un texto normal y es el texto de las excepciones creadas por nosotros en el backend
                }
            }
            mostrarAlertaError(mensaje);
            console.log(error);
        }
    };

    if (isLoading) return (
        <>
            <PageHeader title="Editar Insumo Químico" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
            </Spinner>
        </>
    )
    if (!insumoQuimico) return (
        <Container>
            <PageHeader title="Insumo químico no encontrado" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">El insumo químico ingresado no existe</Alert>
                </Col>
            </Row>
        </Container>
    )

    if (error) return (
        <Container>
            <PageHeader title="Editar Insumo Químico" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar el Insumo Químico</Alert>
                </Col>
            </Row>
        </Container>
    )


    return(
        <>
            <PageHeader title="Editar Insumo Químico"/>

            <Container>
                <InsumoQuimicoForm textoBoton="Editar Insumo Químico"
                    onSubmit={actualizarInsumoQuimico}
                    valoresIniciales={{ nombre: insumoQuimico.nombre, 
                    unidad_medida: insumoQuimico.unidad_medida, 
                    tipo_quimico_id: insumoQuimico.tipo?.id || insumoQuimico.tipo_quimico_id}}/>
            </Container>
        </>
    )
}