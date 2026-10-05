import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { DocumentoForm } from "../components/DocumentoForm";
import { api } from "../../../libs/axios";
import type { NewDocumento } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

export function NuevoDocumentoPage() {
    const navigate = useNavigate();

    const guardarDocumento = async (datos: NewDocumento) => {
        try{
            await api.post("/documentos/", datos);
            await mutate("/documentos/");
            mostrarAlertaExito("El documento se creo correctamente.");     
            navigate("/documentos");
        } catch (error: any){  
            let mensajeFinal = "No se pudo crear el documento.";       
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
            <PageHeader title="Crear nuevo Documento" />

            <Container>
                <DocumentoForm textoBoton="Crear Documento" onSubmit={guardarDocumento}/>     
            </Container>
        </>
    );
}

