import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { ElementoLimpiezaForm } from "../components/ElementoLimpiezaForm";
import { api } from "../../../libs/axios";
import type { NewElementoLimpieza } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import { getErrorMessage } from "../../../libs/errors";

export function NuevoElementoPage(){
    const navigate = useNavigate();

    const guardarElementoLimpieza = async (datos: NewElementoLimpieza) => {
        try{
            await api.post("/elementos-limpieza/", datos);
            await mutate("/elementos-limpieza/");
            mostrarAlertaExito("El elemento de limpieza se creó correctamente.");
            navigate("/elementos-limpieza");
        } catch (error: any){
            mostrarAlertaError(
                getErrorMessage(error, "No se pudo crear el elemento de limpieza.")
            );
            console.log(error);
        }
    };
    
    return(
        <>
            <PageHeader title="Crear nuevo Elemento de Limpieza"/>

            <Container>
                <ElementoLimpiezaForm textoBoton="Crear Elemento" onSubmit={guardarElementoLimpieza}/>
            </Container>
        </>
    )
}