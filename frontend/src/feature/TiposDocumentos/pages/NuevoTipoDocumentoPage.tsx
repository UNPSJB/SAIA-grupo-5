import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { TipoDocumentoForm } from "../components/TipoDocumentoForm";
import { api } from "../../../libs/axios";
import type { NewTipoDocumento } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

export function NuevoTipoDocumentoPage() {
    const navigate = useNavigate();

    const guardarTipoDocumento = async (datos: NewTipoDocumento) => {
        try{
            await api.post("/tipos-documentos/", datos);
            await mutate("/tipos-documentos/");
            mostrarAlertaExito("El tipo documento se creo correctamente.");     
            navigate("/tipos-documentos");
        } catch (error: any){  
            let mensajeFinal = "No se pudo crear el tipo documento.";       
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
            <PageHeader title="Crear nuevo Tipo de Documento" />

            <Container>
                <TipoDocumentoForm textoBoton="Crear Tipo Documento" onSubmit={guardarTipoDocumento}/>     
            </Container>
        </>
    );
}

