import { Container } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { VersionDocumentoForm } from "../components/VersionDocumentoForm";
import { api } from "../../../libs/axios";
import type { NewVersionDocumento } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

export function NuevaVersionDocumentoPage() {
    const navigate = useNavigate();
    const { documentoId } = useParams();


    const guardarVersionDocumento = async (datos: NewVersionDocumento) => {
        try{
            await api.post("/versiones-documentos/", datos);
            await mutate(`/versiones-documentos/documento/${documentoId}`);
            mostrarAlertaExito("La nueva versión del documento se creo correctamente.");     
            navigate(`/versiones-documentos/documento/${documentoId}`);
        } catch (error: any){  
            let mensajeFinal = "No se pudo crear la nueva versón del documento.";       
            if (error.response?.data?.detail){    
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        }
    };

    return (
        <>
            <PageHeader title="Crear nueva Versión" />

            <Container>
                <VersionDocumentoForm textoBoton="Crear Versión" onSubmit={guardarVersionDocumento}/>     
            </Container>
        </>
    );
}




