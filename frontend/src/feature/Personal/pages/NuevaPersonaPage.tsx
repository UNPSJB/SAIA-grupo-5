import { Container } from "react-bootstrap";
import { mutate } from 'swr'
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { PersonaForm } from "../components/PersonaForm";
import { api } from "../../../libs/axios";
import type { NewPersona } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

export function NuevaPersonaPage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el insumo

    const guardarPersona = async (datos: NewPersona) => {
        try{
            await api.post("/personal", datos);
            await mutate('/personal/');
            mostrarAlertaExito("El personal se registro correctamente.");
            navigate("/personal");
        } catch (error: any){
            let mensajeFinal = "No se pudo registrar el personal.";
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        }
    };
    
// Como valoresIniciales tiene el ? no es necesario enviarlo 
    return(
        <>
            <PageHeader title="Agregar personal"/>

            <Container>
                <PersonaForm textoBoton="Registrar persona" 
                onSubmit={guardarPersona}/>     
            </Container>
        </>
    )
}