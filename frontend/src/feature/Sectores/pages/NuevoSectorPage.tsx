import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { SectorForm } from "../components/SectorForm";
import { api } from "../../../libs/axios";
import type { NewSector } from "../types";

export function NuevoSectorPage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el sector

    const guardarSector = async (datos: NewSector) => {
        try{
            await api.post("/sectores/", datos);
            await mutate("/sectores/");
            navigate("/sectores");
        } catch (error: any){   // Se modifico esto para poder mostrar el mensaje que tenemos en exceptions
            if(error.response && error.response.data && error.response.data.detail){
                alert(error.response.data.detail);
            } else {
                alert("No se pudo crear el sector.");       // Esto se puede cambiar porque se ve como la alerta de google que esta fea
            }

            console.log(error)
        }
    };

    return(
        <>
            <PageHeader title="Crear nuevo Sector"/>

            <Container>
                <SectorForm textoBoton="Crear Sector" onSubmit={guardarSector}/>
            </Container>
        </>
    )
}
