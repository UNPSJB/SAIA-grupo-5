import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { IncidenteForm } from "../components/IncidenteForm";
import { api } from "../../../libs/axios";
import type { NewIncidente } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

export function NuevoIncidentePage() {
    const navigate = useNavigate();

    const guardarIncidente = async (datos: NewIncidente) => {
        try{
            await api.post("/incidentes/", datos);
            await mutate("/incidentes/");
            mostrarAlertaExito("El nuevo incidente se creo correctamente.");     
            navigate("/incidentes/");
        } catch (error: any){  
            let mensajeFinal = "No se pudo crear el nuevo incidente.";       
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
            <PageHeader title="Crear nuevo Incidente" />

            <Container>
                <IncidenteForm textoBoton="Crear Incidente" onSubmit={guardarIncidente}/>     
            </Container>
        </>
    );
}
