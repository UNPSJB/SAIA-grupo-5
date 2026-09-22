import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { ConsumoProductoForm } from "../components/ConsumoProductoForm";
import { api } from "../../../libs/axios";
import type { NewConsumoProducto } from "../types";

export function NuevoConsumoProductoPage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el consumo

    const guardarConsumoProducto = async (datos: NewConsumoProducto) => {
        try{
            await api.post("/consumos_productos/", datos);
            await mutate("/consumos_productos/");
            navigate("/consumos_productos");
        } catch (error: any){   // Se modifico esto para poder mostrar el mensaje que tenemos en exceptions
            if(error.response && error.response.data && error.response.data.detail){
                alert(error.response.data.detail);
            } else {
                alert("No se pudo crear el consumo.");       // Esto se puede cambiar porque se ve como la alerta de google que esta fea
            }
                
            console.log(error)
        }
    };
    
    return(
        <>
            <PageHeader title="Registrar nuevo consumo de producto quimico"/>

            <Container>
                <ConsumoProductoForm textoBoton="Registrar Consumo" onSubmit={guardarConsumoProducto}/>     
            </Container>
        </>
    )
}