import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { InsumoForm } from "../components/InsumoForm";
import { api } from "../../../libs/axios";
import type { NewInsumo } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

export function NuevoInsumoPage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el insumo

    const guardarInsumo = async (datos: NewInsumo) => {
        try{
            await api.post("/insumos/", datos);
            await mutate("/insumos/");
            mostrarAlertaExito("El insumo se creo correctamente.");     // Muestra la alerta de SweetAlert con tema de Bootstrap 5
            navigate("/insumos");
        } catch (error: any){   // Se modifico esto para poder mostrar el mensaje que tenemos en exceptions
            let mensajeFinal = "No se pudo crear el insumo.";        // Si falla el servidor por alguna razon, creamos este mensaje predeterminado
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
            <PageHeader title="Crear nuevo Insumo"/>

            <Container>
                <InsumoForm textoBoton="Crear Insumo" onSubmit={guardarInsumo}/>     
            </Container>
        </>
    )
}