import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { SectorForm } from "../components/SectorForm";
import { api } from "../../../libs/axios";
import { getErrorMessage } from "../../../libs/errors";
import type { NewSector } from "../types";

export function NuevoSectorPage(){
    const navigate = useNavigate();

    const guardarSector = async (datos: NewSector) => {
        try{
            await api.post("/sectores/", datos);
            await mutate("/sectores/");
            navigate("/sectores");
        } catch (error: any){
            alert(getErrorMessage(error, "No se pudo crear el sector."));
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
