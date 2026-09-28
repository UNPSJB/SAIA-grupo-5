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
            let mensajeFinal = "No se pudo editar el insumo químico.";        // Si falla el servidor por alguna razon, creamos este mensaje predeterminado
            if (error.response?.data?.detail){      
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
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
                    tipo_quimico_id: insumoQuimico.tipo?.id || insumoQuimico.tipo_quimico_id,
                    dilucion: insumoQuimico.dilucion}}/>
            </Container>
        </>
    )
}