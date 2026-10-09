import { Container, Alert, Col, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { IncidenteForm } from "../components/IncidenteForm"; 
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks/useApi";
import type { Incidente, NewIncidente } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import { PageLoading } from "../../../components/PageLoading";


export function EditarIncidentePage(){
    const navigate = useNavigate();    
    const { id } = useParams();         

    const { data: incidente, isLoading, error } = useApi<Incidente>(`/incidentes/${id}`);

    const actualizarIncidente = async (datos: EditarIncidente) => {
        try{
            await api.put(`/incidentes/${id}`, datos);
            await mutate("/incidentes/");
            await mutate(`/incidentes/${id}`);
            mostrarAlertaExito("El incidente se edito correctamente.");
            navigate("/incidentes/");
        } catch (error: any){
            let mensajeFinal = "No se pudo editar el incidente.";        
            if (error.response?.data?.detail){      
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        }
    };

    if (isLoading) return <PageLoading title="Editar Incidente" />;

    if (!incidente) return (
        <Container>
            <PageHeader title="Incidente no encontrado" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">El Incidente ingresado no existe.</Alert>
                </Col>
            </Row>
        </Container>
    )

    if (error) return (
        <Container>
            <PageHeader title="Editar Incidente" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar el Incidente.</Alert>
                </Col>
            </Row>
        </Container>
    )

    return(
        <>
            <PageHeader title="Editar Incidente"/>

            <Container>
                <IncidenteForm textoBoton="Editar Incidente"
                    onSubmit={actualizarIncidente}
                    valoresIniciales={{
                        nombre: incidente.nombre,
                        descripcion: incidente.descripcion,
                        tipo_id: incidente.tipo_id,
                        sector_id: incidente.sector_id,
                        foto_opcional: incidente.foto_opcional,
                        fecha_abierto: incidente.fecha_abierto,
                        fecha_cierre: incidente.fecha_cierre,
                    }}/>
            </Container>
        </>
    )
}

