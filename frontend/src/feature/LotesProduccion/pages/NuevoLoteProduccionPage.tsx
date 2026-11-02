import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { LoteProduccionForm } from "../components/LoteProduccionForm";
import { api } from "../../../libs/axios";
import type { NewLoteProduccion } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

export function NuevoLoteProduccionPage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el insumo

    const guardarLoteProduccion = async (datos: NewLoteProduccion) => {
        try{
            await api.post("/lotes-produccion/", datos);
            await mutate("/lotes-produccion/");
            mostrarAlertaExito("El lote de produccion se creo correctamente.");     // Muestra la alerta de SweetAlert con tema de Bootstrap 5
            navigate("/lotes-produccion");
        } catch (error: any){   // Se modifico esto para poder mostrar el mensaje que tenemos en exceptions
            let mensajeFinal = "No se pudo crear el lote de produccion.";        // Si falla el servidor por alguna razon, creamos este mensaje predeterminado
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
            <PageHeader title="Crear nuevo Lote de Produccion"/>

            <Container>
                <LoteProduccionForm
                    textoBoton="Crear Lote de Produccion" 
                    onSubmit={guardarLoteProduccion}/>     
            </Container>
        </>
    )
}