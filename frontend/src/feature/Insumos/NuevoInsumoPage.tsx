import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { PeageHeader } from "../../components/PageHeader";
import { InsumoForm } from "./InsumoForm";
import { api } from "../../libs/axios";

export function NuevoInsumoPage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el insumo

    const guardarInsumo = async (datos: {nombre: string, unidad_medida: string}) => {
        try{
            await api.post("/insumos", datos);
            navigate("/insumos");
        } catch (error){
            alert("No se pudo crear el insumo.");       // Esto se puede cambiar porque se ve como la alerta de google que esta fea
            console.log(error)
        }
    };

    return(
        <>
            <PeageHeader title="Crear nuevo Insumo"/>

            <Container>
                <InsumoForm textoBoton="Crear Insumo" onSubmit={guardarInsumo}/>
            </Container>
        </>
    )
}