import { Container, Alert, Col, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { TipoDocumentoForm } from "../components/TipoDocumentoForm"; 
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks/useApi";
import type { TipoDocumento, NewTipoDocumento } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import { PageLoading } from "../../../components/PageLoading";


export function EditarTipoDocumentoPage(){
    const navigate = useNavigate();    
    const { id } = useParams();         

    const { data: tipoDocumento, isLoading, error } = useApi<TipoDocumento>(`/tipos-documentos/${id}`);

    const actualizarTipoDocumento = async (datos: NewTipoDocumento) => {
        try{
            await api.put(`/tipos-documentos/${id}`, datos);
            await mutate("/tipos-documentos/");
            await mutate(`/tipos-documentos/${id}`);     
            mostrarAlertaExito("El tipo documento se edito correctamente.");
            navigate("/tipos-documentos");
        } catch (error: any){
            let mensajeFinal = "No se pudo editar el tipo documento.";        
            if (error.response?.data?.detail){      
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        }
    };

    if (isLoading) return <PageLoading title="Editar Tipo Documento" />;

    if (!tipoDocumento) return (
        <Container>
            <PageHeader title="Tipo Documento no encontrado" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">El Tipo Documento ingresado no existe.</Alert>
                </Col>
            </Row>
        </Container>
    )

    if (error) return (
        <Container>
            <PageHeader title="Editar Tipo Documento" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar el Tipo Documento.</Alert>
                </Col>
            </Row>
        </Container>
    )


    return(
        <>
            <PageHeader title="Editar Tipo Documento"/>

            <Container>
                <TipoDocumentoForm textoBoton="Editar Tipo Documento"
                    onSubmit={actualizarTipoDocumento}
                    valoresIniciales={{ nombre: tipoDocumento.nombre, 
                    descripcion: tipoDocumento.descripcion || ""}}/>
            </Container>
        </>
    )
}

