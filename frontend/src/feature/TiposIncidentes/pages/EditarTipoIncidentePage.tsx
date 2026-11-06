import { Container, Alert, Col, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { TipoIncidenteForm } from "../components/TipoIncidenteForm"; 
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks/useApi";
import type { TipoIncidente, NewTipoIncidente } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import { PageLoading } from "../../../components/PageLoading";


export function EditarTipoIncidentePage(){
    const navigate = useNavigate();    
    const { id } = useParams();         

    const { data: tipoIncidente, isLoading, error } = useApi<TipoIncidente>(`/tipos-incidentes/${id}`);

    const actualizarTipoIncidente = async (datos: NewTipoIncidente) => {
        try{
            await api.put(`/tipos-incidentes/${id}`, datos);
            await mutate("/tipos-incidentes/");
            await mutate(`/tipos-incidentes/${id}`);     
            mostrarAlertaExito("El tipo incidente se edito correctamente.");
            navigate("/tipos-incidentes");
        } catch (error: any){
            let mensajeFinal = "No se pudo editar el tipo incidente.";        
            if (error.response?.data?.detail){      
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        }
    };

    if (isLoading) return <PageLoading title="Editar Tipo Incidente" />;

    if (!tipoIncidente) return (
        <Container>
            <PageHeader title="Tipo Incidente no encontrado" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">El Tipo Incidente ingresado no existe.</Alert>
                </Col>
            </Row>
        </Container>
    )

    if (error) return (
        <Container>
            <PageHeader title="Editar Tipo Incidente" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar el Tipo Incidente.</Alert>
                </Col>
            </Row>
        </Container>
    )


    return(
        <>
            <PageHeader title="Editar Tipo Incidente"/>

            <Container>
                <TipoIncidenteForm textoBoton="Editar Tipo Incidente"
                    onSubmit={actualizarTipoIncidente}
                    valoresIniciales={{ nombre: tipoIncidente.nombre, 
                    descripcion: tipoIncidente.descripcion || ""}}/>
            </Container>
        </>
    )
}

