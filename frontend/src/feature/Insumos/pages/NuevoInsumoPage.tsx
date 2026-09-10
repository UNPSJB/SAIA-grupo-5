import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { InsumoForm } from "../components/InsumoForm";
import { api } from "../../../libs/axios";
import type { NewInsumo } from "../types";

export function NuevoInsumoPage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el insumo

    const guardarInsumo = async (datos: NewInsumo) => {
        try{
            await api.post("/insumos/", datos);
            await mutate("/insumos/");
            navigate("/insumos");
        } catch (error: any){   // Se modifico esto para poder mostrar el mensaje que tenemos en exceptions
            if(error.response && error.response.data && error.response.data.detail){
                alert(error.response.data.detail);
            } else {
                alert("No se pudo crear el insumo.");       // Esto se puede cambiar porque se ve como la alerta de google que esta fea
            }
                
            console.log(error)
        }
    };
    
// Como valoresIniciales tiene el ? no es necesario enviarlo 
    return(
        <>
            <PageHeader title="Crear nuevo Insumo"/>

            <Container>
                <InsumoForm textoBoton="Crear Insumo" onSubmit={guardarInsumo}/>     
            </Container>
        </>
    )
}