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
            let mensajeFinal = "No se pudo crear el insumo químico.";        // Si falla el servidor por alguna razon, creamos este mensaje predeterminado
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
            <PageHeader title="Crear nuevo Insumo Químico"/>

            <Container>
                <InsumoQuimicoForm textoBoton="Crear Insumo Químico" onSubmit={guardarInsumoQuimico}/>     
            </Container>
        </>
    )
}