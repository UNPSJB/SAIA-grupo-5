import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { SuperficieForm } from "../components/SuperficieForm";
import { api } from "../../../libs/axios";
import type { NewSuperficie } from "../types";

export function NuevaSuperficiePage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree la superficie

    const guardarSuperficie = async (datos: NewSuperficie) => {
        try{
            await api.post("/superficies/", datos);
            await mutate("/superficies/");
            navigate("/superficies");
        } catch (error: any){   // Se modifico esto para poder mostrar el mensaje que tenemos en exceptions
            if(error.response && error.response.data && error.response.data.detail){
                alert(error.response.data.detail);
            } else {
                alert("No se pudo crear la superficie.");
            }

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
