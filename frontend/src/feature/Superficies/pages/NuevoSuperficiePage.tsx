import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { SuperficieForm } from "../components/SuperficieForm";
import { api } from "../../../libs/axios";
import { getErrorMessage } from "../../../libs/errors";
import type { NewSuperficie } from "../types";

export function NuevaSuperficiePage(){
    const navigate = useNavigate();

    const guardarSuperficie = async (datos: NewSuperficie) => {
        try{
            await api.post("/superficies/", datos);
            await mutate("/superficies/");
            navigate("/superficies");
        } catch (error: any){
            alert(getErrorMessage(error, "No se pudo crear la superficie."));
            console.log(error)
        }
    };

    return(
        <>
            <PageHeader title="Crear nueva Superficie"/>

            <Container>
                <SuperficieForm textoBoton="Crear Superficie" onSubmit={guardarSuperficie}/>
            </Container>
        </>
    )
}
