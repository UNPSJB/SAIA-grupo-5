import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { TipoQuimicoForm } from "../components/TipoQuimicoForm";
import { api } from "../../../libs/axios";
import type { NewTipoQuimico } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

export function NuevoTipoQuimicoPage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el insumo

    const guardarTipoQuimico = async (datos: NewTipoQuimico) => {
        try{
            await api.post("/tipos-quimicos/", datos);
            await mutate("/tipos-quimicos/");
            mostrarAlertaExito("El tipo químico se creo correctamente.");     // Muestra la alerta de SweetAlert con tema de Bootstrap 5
            navigate("/tipos-quimicos");
        } catch (error: any){   // Se modifico esto para poder mostrar el mensaje que tenemos en exceptions
            let mensajeFinal = "No se pudo crear el tipo químico.";        // Si falla el servidor por alguna razon, creamos este mensaje predeterminado
            if (error.response?.data?.detail){      // Se le pregunta a Axios si el error tiene una respuesta del backend
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        }
    };
    
    return(
        <>
            <PageHeader title="Crear nuevo Tipo Químico"/>

            <Container>
                <TipoQuimicoForm textoBoton="Crear Tipo Químico" onSubmit={guardarTipoQuimico}/>     
            </Container>
        </>
    )
}