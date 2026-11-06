import { Container } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { VencimientoPersonalForm } from "../components/VencimientoPersonalForm";
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks";
import type { Persona } from "../../Personal/types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import type { NewVencimientoPersonal } from "../types";


export function NuevoVencimientoPersonalPage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el insumo
    const { personaId } = useParams();
    const {data: persona } = useApi<Persona>(`/personal/${personaId}`);

    const rutaListadoPersona = `/personal/${personaId}/vencimientos`;

    const guardarVencimiento = async (datos: NewVencimientoPersonal) => {
        try{
            await api.post("/vencimiento-personal/", {...datos, persona_id: Number(personaId)});
            await mutate(`/vencimiento-personal/persona/${personaId}`);
            await mutate("/vencimiento-personal/");
            mostrarAlertaExito("El vencimiento se creo correctamente.");     // Muestra la alerta de SweetAlert con tema de Bootstrap 5
            navigate(`/personal/${personaId}/vencimientos`);
        } catch (error: any){   // Se modifico esto para poder mostrar el mensaje que tenemos en exceptions
            let mensajeFinal = "No se pudo crear el vencimiento.";        // Si falla el servidor por alguna razon, creamos este mensaje predeterminado
            if (error.response?.data?.detail){      // Se le pregunta a Axios si el error tiene una respuesta del backend
                    const detail = error.response.data.detail;
                    mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        }
    };

    const titulo = persona ? `Crear Vencimiento para ${persona.nombre} ${persona.apellido}` : "Crear nuevo Vencimiento";
    
    return(
        <>
            <PageHeader title={titulo}/>

            <Container>
                <VencimientoPersonalForm 
                    textoBoton="Crear Vencimiento" 
                    rutaCancelar={rutaListadoPersona}
                    onSubmit={guardarVencimiento}
                />     
            </Container>
        </>
    )
}