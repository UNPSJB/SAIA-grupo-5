import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { PlanLimpiezaForm } from "../components/PlanLimpiezaForm";
import { api } from "../../../libs/axios";
import { getErrorMessage } from "../../../libs/errors";
import type { NewPlanLimpieza } from "../types";

export function NuevoPlanLimpiezaPage(){
    const navigate = useNavigate();

    const guardarPlan = async (datos: NewPlanLimpieza) => {
        try{
            await api.post("/planes-limpieza/", datos);
            await mutate("/planes-limpieza/");
            navigate("/planes-limpieza");
        } catch (error: any){
            alert(getErrorMessage(error, "No se pudo crear el plan de limpieza."));
            console.log(error)
        }
    };

    return(
        <>
            <PageHeader title="Crear nuevo Plan de Limpieza"/>

            <Container>
                <PlanLimpiezaForm textoBoton="Crear Plan de Limpieza" onSubmit={guardarPlan}/>
            </Container>
        </>
    )
}
