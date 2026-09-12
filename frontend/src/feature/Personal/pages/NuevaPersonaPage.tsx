import { Container } from "react-bootstrap";
import { mutate } from 'swr'
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { PersonaForm } from "../components/PersonaForm";
import { api } from "../../../libs/axios";
import type { NewPersona } from "../types";

export function NuevaPersonaPage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el insumo

    const guardarPersona = async (datos: NewPersona) => {
        try{
            await api.post("/personal", datos);
            await mutate('/personal/')
            navigate("/personal");
        } catch (error: any){
            if(error.response && error.response.data && error.response.data.detail){
                alert(error.response.data.detail);
            } else {
                alert("No se pudo registrar el personal.");
            }
            console.log(error)
        }
    };
    
// Como valoresIniciales tiene el ? no es necesario enviarlo 
    return(
        <>
            <PageHeader title="Agregar personal"/>

            <Container>
                <PersonaForm textoBoton="Registrar persona" 
                onSubmit={guardarPersona}/>     
            </Container>
        </>
    )
}