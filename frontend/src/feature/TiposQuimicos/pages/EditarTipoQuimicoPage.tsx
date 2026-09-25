import { Container, Spinner, Alert, Col, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { TipoQuimicoForm } from "../components/TipoQuimicoForm"; 
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks/useApi";
import type { TipoQuimico, NewTipoQuimico } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

export function EditarTipoQuimicoPage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el insumo
    const { id } = useParams();         

    const { data: tipoQuimico, isLoading, error } = useApi<TipoQuimico>(`/tipos-quimicos/${id}`);

    const actualizarTipoQuimico = async (datos: NewTipoQuimico) => {
        try{
            await api.put(`/tipos-quimicos/${id}`, datos);
            await mutate("/tipos-quimicos/");
            await mutate(`/tipos-quimicos/${id}`);     // Se agrego esto ya que habia un bug en el editar
            mostrarAlertaExito("El tipo químico se edito correctamente.");
            navigate("/tipos-quimicos");
        } catch (error: any){
            let mensaje = "No se pudo editar el tipo químico.";        // Si falla el servidor por alguna razon, creamos este mensaje predeterminado
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
            <PageHeader title="Editar Tipo Químico" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
            </Spinner>
        </>
    )
    if (!tipoQuimico) return (
        <Container>
            <PageHeader title="Tipo Químico no encontrado" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">El Tipo Químico ingresado no existe.</Alert>
                </Col>
            </Row>
        </Container>
    )

    if (error) return (
        <Container>
            <PageHeader title="Editar Tipo Químico" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar el Tipo Químico.</Alert>
                </Col>
            </Row>
        </Container>
    )


    return(
        <>
            <PageHeader title="Editar Tipo Químico"/>

            <Container>
                <TipoQuimicoForm textoBoton="Editar Tipo Químico"
                    onSubmit={actualizarTipoQuimico}
                    valoresIniciales={{ nombre: tipoQuimico.nombre, 
                    descripcion: tipoQuimico.descripcion || ""}}/>
            </Container>
        </>
    )
}