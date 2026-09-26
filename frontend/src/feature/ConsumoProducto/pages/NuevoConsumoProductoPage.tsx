import { Container } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { ConsumoProductoForm } from "../components/ConsumoProductoForm";
import { api } from "../../../libs/axios";
import type { NewConsumoProducto } from "../types";

export function NuevoConsumoProductoPage(){
    const navigate = useNavigate();   
    const [searchParams] = useSearchParams();
    const id = searchParams.get("tareaId");

    const guardarConsumoProducto = async (datos: NewConsumoProducto) => {
        try{
            await api.post("/consumos-productos/", {
                ...datos, 
                tarea_id: Number(id), });
            await mutate(`/consumos-productos/tarea/${id}`);
            navigate(`/consumos-productos/tarea/${id}`);
        } catch (error: any){  
            if(error.response && error.response.data && error.response.data.detail){
                alert(error.response.data.detail);
            } else {
                alert("No se pudo crear el consumo.");     
            }
                
            console.log(error)
        }
    };
    
    return(
        <>
            <PageHeader title="Registrar nuevo consumo de producto quimico"/>

            <Container>
                <ConsumoProductoForm textoBoton="Registrar Consumo" 
                onSubmit={guardarConsumoProducto} 
                />     
            </Container>
        </>
    )
}