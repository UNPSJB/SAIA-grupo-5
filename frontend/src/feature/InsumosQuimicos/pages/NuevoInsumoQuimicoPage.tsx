import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { InsumoQuimicoForm } from "../components/InsumoQuimicoForm";
import { api } from "../../../libs/axios";
import type { NewInsumoQuimico } from "../types";

export function NuevoInsumoQuimicoPage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el insumo

    const guardarInsumoQuimico = async (datos: NewInsumoQuimico) => {
        try{
            await api.post("/insumos-quimicos/", datos);
            await mutate("/insumos-quimicos/");
            navigate("/insumos-quimicos");
        } catch (error: any){   // Se modifico esto para poder mostrar el mensaje que tenemos en exceptions
            if(error.response && error.response.data && error.response.data.detail){
                alert(error.response.data.detail);
            } else {
                alert("No se pudo crear el insumo.");       // Esto se puede cambiar porque se ve como la alerta de google que esta fea
            }
                
            console.log(error)
        }
    };
    
    return(
        <>
            <PageHeader title="Crear nuevo Insumo Quimico"/>

            <Container>
                <InsumoQuimicoForm textoBoton="Crear Insumo Quimico" onSubmit={guardarInsumoQuimico}/>     
            </Container>
        </>
    )
}