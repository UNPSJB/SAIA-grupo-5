import { Container, Spinner, Alert, Col, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { VersionDocumentoForm } from "../components/VersionDocumentoForm"; 
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks/useApi";
import type { VersionDocumento, NewVersionDocumento } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

export function EditarVersionDocumentoPage(){
    const navigate = useNavigate();    
    const { id } = useParams();         

    const { data: version, isLoading, error } = useApi<VersionDocumento>(`/versiones-documentos/${id}`);

    const actualizarVersionDocumento = async (datos: NewVersionDocumento) => {
        try{
            await mutate(`/versiones-documentos/documento/${version.documento_id}`);
            await mutate(`/versiones-documentos/${id}`);
            mostrarAlertaExito("La versión del documento se edito correctamente.");
            navigate(`/versiones-documentos/documento/${version.documento_id}`);

        } catch (error: any){
            let mensajeFinal = "No se pudo editar la versión del documento.";        
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
            <PageHeader title="Editar Versión" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
            </Spinner>
        </>
    )
    if (!version) return (
        <Container>
            <PageHeader title="Versión no encontrada" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">La Version del Documento ingresada no existe.</Alert>
                </Col>
            </Row>
        </Container>
    )

    if (error) return (
        <Container>
            <PageHeader title="Editar Versión" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar la Versión.</Alert>
                </Col>
            </Row>
        </Container>
    )

    return(
        <>
            <PageHeader title="Editar Versión"/>

            <Container>
                <VersionDocumentoForm textoBoton="Editar Versión"
                    onSubmit={actualizarVersionDocumento}
                    valoresIniciales={{ 
                    documento_id: version.documento_id || ""}}/>
            </Container>
        </>
    )
}

