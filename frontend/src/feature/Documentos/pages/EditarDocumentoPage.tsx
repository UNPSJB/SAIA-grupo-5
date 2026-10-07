import { Container, Spinner, Alert, Col, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { DocumentoForm } from "../components/DocumentoForm"; 
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks/useApi";
import type { Documento, NewDocumento } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

export function EditarDocumentoPage(){
    const navigate = useNavigate();    
    const { id } = useParams();         

    const { data: documento, isLoading, error } = useApi<Documento>(`/documentos/${id}`);

    const actualizarDocumento = async (datos: NewDocumento) => {
        try{
            await api.put(`/documentos/${id}`, datos);
            await mutate("/documentos/");
            await mutate(`/documentos/${id}`);     
            mostrarAlertaExito("El documento se edito correctamente.");
            navigate("/documentos");
        } catch (error: any){
            let mensajeFinal = "No se pudo editar el documento.";        
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
            <PageHeader title="Editar Documento" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
            </Spinner>
        </>
    )
    if (!documento) return (
        <Container>
            <PageHeader title="Documento no encontrado" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">El Documento ingresado no existe.</Alert>
                </Col>
            </Row>
        </Container>
    )

    if (error) return (
        <Container>
            <PageHeader title="Editar Documento" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar el Documento.</Alert>
                </Col>
            </Row>
        </Container>
    )


    return(
        <>
            <PageHeader title="Editar Documento"/>

            <Container>
                <DocumentoForm textoBoton="Editar Documento"
                    onSubmit={actualizarDocumento}
                    valoresIniciales={{ nombre: documento.nombre, 
                    descripcion: documento.descripcion, 
                    tipo_id: documento.tipo_id || ""}}/>
            </Container>
        </>
    )
}

