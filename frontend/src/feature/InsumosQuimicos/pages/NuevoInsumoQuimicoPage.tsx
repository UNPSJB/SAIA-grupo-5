import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { InsumoQuimicoForm } from "../components/InsumoQuimicoForm";
import { api } from "../../../libs/axios";
import type { NewInsumoQuimico } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

export function NuevoInsumoQuimicoPage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el insumo

    const guardarInsumoQuimico = async (datos: NewInsumoQuimico) => {
        try{
            await api.post("/insumos-quimicos/", datos);
            await mutate("/insumos-quimicos/");
            mostrarAlertaExito("El insumo químico se creo correctamente.");     // Muestra la alerta de SweetAlert con tema de Bootstrap 5
            navigate("/insumos-quimicos");
        } catch (error: any){   // Se modifico esto para poder mostrar el mensaje que tenemos en exceptions
            let mensaje = "No se pudo crear el insumo químico.";        // Si falla el servidor por alguna razon, creamos este mensaje predeterminado
            if (error.response?.data?.detail){      // Se le pregunta a Axios si el error tiene una respuesta del backend
                if (Array.isArray(error.response.data.detail)) {        // Puede pasar que FastAPI mande el detail como un arreglo
                    mensaje = error.response.data.detail[0].msg;        // Si es un arreglo metemos en mensaje eel primer error de la lista y solamente nos quedamos con el mensaje en si por eso usamos al final .msg
                } else {
                    mensaje = error.response.data.detail;   // Si paso por el else el detail es un texto normal y es el texto de las excepciones creadas por nosotros en el backend
                }
            }
            mostrarAlertaError(mensaje);
            console.log(error);
        }
    };
    
    return(
        <>
            <PageHeader title="Crear nuevo Insumo Químico"/>

            <Container>
                <InsumoQuimicoForm textoBoton="Crear Insumo Químico" onSubmit={guardarInsumoQuimico}/>     
            </Container>
        </>
    )
}