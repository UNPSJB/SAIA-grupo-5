import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { EquipoForm } from "../components/EquipoForm";
import { api } from "../../../libs/axios";
import { getErrorMessage } from "../../../libs/errors";
import type { NewEquipo } from "../types";

export function NuevoEquipoPage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el equipo

    const guardarEquipo = async (datos: NewEquipo) => {
        try{
            await api.post("/equipos", datos);
            navigate("/equipos");
        } catch (error: any){
            alert(getErrorMessage(error, "No se pudo crear el equipo."));
            console.log(error)
        }
    };
    
// Como valoresIniciales tiene el ? no es necesario enviarlo 
    return(
        <>
            <PageHeader title="Crear nuevo Equipo"/>

            <Container>
                <EquipoForm textoBoton="Crear Equipo" onSubmit={guardarEquipo}/>     
            </Container>
        </>
    )
}