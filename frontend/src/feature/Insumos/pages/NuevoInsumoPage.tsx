import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { InsumoForm } from "../components/InsumoForm";
import { api } from "../../../libs/axios";
import { getErrorMessage } from "../../../libs/errors";
import type { NewInsumo } from "../types";

export function NuevoInsumoPage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el insumo

    const guardarInsumo = async (datos: NewInsumo) => {
        try{
            await api.post("/insumos/", datos);
            await mutate("/insumos/");
            navigate("/insumos");
        } catch (error: any){
            alert(getErrorMessage(error, "No se pudo crear el insumo."));
            console.log(error)
        }
    };
    
    return(
        <>
            <PageHeader title="Crear nuevo Insumo"/>

            <Container>
                <InsumoForm textoBoton="Crear Insumo" onSubmit={guardarInsumo}/>     
            </Container>
        </>
    )
}