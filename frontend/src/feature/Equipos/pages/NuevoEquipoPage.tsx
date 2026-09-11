import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { EquipoForm } from "../components/EquipoForm";
import { api } from "../../../libs/axios";
import type { NewEquipo } from "../types";

export function NuevoEquipoPage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el equipo

    const guardarEquipo = async (datos: NewEquipo) => {
        try{
            await api.post("/equipos/", datos);
            await mutate("/equipos/");
            navigate("/equipos");
        } catch (error){
            if(error.response && error.response.data && error.response.data.detail){
                alert(error.response.data.detail);
            } else {
                alert("No se pudo crear el equipo.");       // Esto se puede cambiar porque se ve como la alerta de google que esta fea
            }
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
