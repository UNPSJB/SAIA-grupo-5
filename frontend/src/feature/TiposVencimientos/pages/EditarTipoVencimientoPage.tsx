import { Container, Spinner, Alert, Col, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { TipoVencimientoForm } from "../components/TipoVencimientoForm";
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks/useApi";
import type { TipoVencimiento, NewTipoVencimiento } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

export function EditarTipoVencimientoPage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el insumo
    const { id } = useParams();         

    const { data: tipoVencimiento, isLoading, error } = useApi<TipoVencimiento>(`/tipos-vencimientos/${id}`);

    const actualizarTipoVencimiento = async (datos: NewTipoVencimiento) => {
        try{
            await api.put(`/tipos-vencimientos/${id}`, datos);
            await mutate("/tipos-vencimientos/");
            await mutate(`/tipos-vencimientos/${id}`);     // Se agrego esto ya que habia un bug en el editar
            mostrarAlertaExito("El tipo vencimiento se edito correctamente.");
            navigate("/tipos-vencimientos");
        } catch (error: any){
            let mensajeFinal = "No se pudo editar el tipo vencimiento.";        // Si falla el servidor por alguna razon, creamos este mensaje predeterminado
            if (error.response?.data?.detail){      // Se le pregunta a Axios si el error tiene una respuesta del backend
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        }
    };

    if (isLoading) return (
        <>
            <PageHeader title="Editar Tipo Vencimiento" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
            </Spinner>
        </>
    )
    if (!tipoVencimiento) return (
        <Container>
            <PageHeader title="Tipo Vencimiento no encontrado" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">El Tipo Vencimiento ingresado no existe.</Alert>
                </Col>
            </Row>
        </Container>
    )

    if (error) return (
        <Container>
            <PageHeader title="Editar Tipo Vencimiento" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar el Tipo Vencimiento.</Alert>
                </Col>
            </Row>
        </Container>
    )


    return(
        <>
            <PageHeader title="Editar Tipo Vencimiento"/>

            <Container>
                <TipoVencimientoForm textoBoton="Editar Tipo Vencimiento"
                    onSubmit={actualizarTipoVencimiento}
                    valoresIniciales={{ nombre: tipoVencimiento.nombre, 
                    descripcion: tipoVencimiento.descripcion || ""}}/>
            </Container>
        </>
    )
}