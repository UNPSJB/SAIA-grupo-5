import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { UnidadMedidaForm } from "../components/UnidadMedidaForm";
import { api } from "../../../libs/axios";
import type { NewUnidadMedida } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

export function NuevaUnidadMedidaPage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el insumo

    const guardarUnidadMedida = async (datos: NewUnidadMedida) => {
        try{
            await api.post("/unidades-medida/", datos);
            await mutate("/unidades-medida/");
            mostrarAlertaExito("La unidad de medida se creo correctamente.");     // Muestra la alerta de SweetAlert con tema de Bootstrap 5
            navigate("/unidades-medida");
        } catch (error: any){   // Se modifico esto para poder mostrar el mensaje que tenemos en exceptions
            let mensajeFinal = "No se pudo crear la unidad de medida.";        // Si falla el servidor por alguna razon, creamos este mensaje predeterminado
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
            <PageHeader title="Crear nueva Unidad de Medida"/>

            <Container>
                <UnidadMedidaForm textoBoton="Crear Unidad de Medida" onSubmit={guardarUnidadMedida}/>     
            </Container>
        </>
    )
}