import { Container, Alert, Col, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { LoteProduccionForm } from "../components/LoteProduccionForm";
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks/useApi";
import type { LoteProduccion, NewLoteProduccion } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import { PageLoading } from "../../../components/PageLoading";

export function EditarLoteProduccionPage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el insumo
    const { id } = useParams();         //

    const { data: lote, isLoading, error } = useApi<LoteProduccion>(`/lotes-produccion/${id}`);

    const actualizarLoteProduccion = async (datos: NewLoteProduccion) => {
        try{
            await api.put(`/lotes-produccion/${id}`, datos);
            await mutate("/lotes-produccion/");
            await mutate(`/lotes-produccion/${id}`);     // Se agrego esto ya que habia un bug en el editar
            mostrarAlertaExito("El lote de produccion se edito correctamente.");
            navigate("/lotes-produccion");
        } catch (error: any){
            let mensajeFinal = "No se pudo editar el lote de produccion.";        // Si falla el servidor por alguna razon, creamos este mensaje predeterminado
            if (error.response?.data?.detail){      // Se le pregunta a Axios si el error tiene una respuesta del backend
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        }
    };

    const tituloPagina = "Editar Lote de Produccion";

    if (isLoading) return <PageLoading title={tituloPagina} />;

    if (!lote) return (
        <Container>
            <PageHeader title="Lote de Produccion no encontrado" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">El lote de produccion ingresado no existe</Alert>
                </Col>
            </Row>
        </Container>
    )

    if (error) return (
        <Container>
            <PageHeader title={tituloPagina} />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar el Lote de Produccion</Alert>
                </Col>
            </Row>
        </Container>
    )

    if (!lote.activo) return (
        <Container>
            <PageHeader title={tituloPagina} />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="warning">No se puede editar un lote de produccion dado de baja.</Alert>
                </Col>
            </Row>
        </Container>
    )


    return(
        <>
            <PageHeader title={tituloPagina}/>

            <Container>
                <LoteProduccionForm textoBoton="Editar Producto"
                    onSubmit={actualizarLoteProduccion}
                    valoresIniciales={{ producto_id: lote.producto_id,
                                        fecha_produccion: lote.fecha_produccion,
                                        fecha_vencimiento: lote.fecha_vencimiento,
                                        cantidad_producida: lote.cantidad_producida
                    }}/>
            </Container>
        </>
    )
}