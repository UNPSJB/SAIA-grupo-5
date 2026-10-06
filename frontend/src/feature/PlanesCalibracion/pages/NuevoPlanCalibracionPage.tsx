import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { PlanCalibracionForm } from "../components/PlanCalibracionForm";
import { api } from "../../../libs/axios";
import type { NewPlanCalibracion } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import { getErrorMessage } from "../../../libs/errors";

export function NuevoPlanCalibracionPage(){
    const navigate = useNavigate();

    const guardarPlanCalibracion = async (datos: NewPlanCalibracion) => {
        try{
            await api.post("/planes-calibracion/", datos);
            await mutate("/planes-calibracion");
            mostrarAlertaExito("El plan de calibración se creó correctamente.");
            navigate("/planes-calibracion");
        } catch (error: any){
            mostrarAlertaError(
                getErrorMessage(error, "No se pudo crear el plan de calibración.")
            );
            console.log(error);
        }
    };

    return(
        <>
            <PageHeader title="Crear nuevo Plan de Calibración"/>

            <Container>
                <PlanCalibracionForm
                    textoBoton="Crear Plan"
                    onSubmit={guardarPlanCalibracion}
                />
            </Container>
        </>
    )
}