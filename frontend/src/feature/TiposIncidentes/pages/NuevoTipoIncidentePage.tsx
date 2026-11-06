import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { TipoIncidenteForm } from "../components/TipoIncidenteForm";
import { api } from "../../../libs/axios";
import type { NewTipoIncidente } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

export function NuevoTipoIncidentePage() {
    const navigate = useNavigate();

    const guardarTipoIncidente = async (datos: NewTipoIncidente) => {
        try{
            await api.post("/tipos-incidentes/", datos);
            await mutate("/tipos-incidentes/");
            mostrarAlertaExito("El tipo incidente se creo correctamente.");     
            navigate("/tipos-incidentes");
        } catch (error: any){  
            let mensajeFinal = "No se pudo crear el tipo incidente.";       
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
            <PageHeader title="Crear nuevo Tipo de Incidente" />

            <Container>
                <TipoIncidenteForm textoBoton="Crear Tipo Incidente" onSubmit={guardarTipoIncidente}/>     
            </Container>
        </>
    );
}

