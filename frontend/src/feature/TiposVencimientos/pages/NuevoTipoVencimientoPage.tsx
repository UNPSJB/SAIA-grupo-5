import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { TipoVencimientoForm } from "../components/TipoVencimientoForm";
import { api } from "../../../libs/axios";
import type { NewTipoVencimiento } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

export function NuevoTipoVencimientoPage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el insumo

    const guardarTipoVencimiento = async (datos: NewTipoVencimiento) => {
        try{
            await api.post("/tipos-vencimientos/", datos);
            await mutate("/tipos-vencimientos/");
            mostrarAlertaExito("El tipo vencimiento se creo correctamente.");     // Muestra la alerta de SweetAlert con tema de Bootstrap 5
            navigate("/tipos-vencimientos");
        } catch (error: any){   // Se modifico esto para poder mostrar el mensaje que tenemos en exceptions
            let mensajeFinal = "No se pudo crear el tipo vencimiento.";        // Si falla el servidor por alguna razon, creamos este mensaje predeterminado
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
            <PageHeader title="Crear nuevo Tipo Vencimiento"/>

            <Container>
                <TipoVencimientoForm textoBoton="Crear Tipo Vencimiento" onSubmit={guardarTipoVencimiento}/>     
            </Container>
        </>
    )
}