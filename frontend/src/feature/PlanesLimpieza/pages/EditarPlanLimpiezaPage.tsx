import { Container, Spinner, Alert, Col, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { PlanLimpiezaForm } from "../components/PlanLimpiezaForm";
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks/useApi";
import type { PlanLimpieza, NewPlanLimpieza } from "../types";
import { mostrarAlertaExito, mostrarAlertaError } from "../../../libs/alertas";

export function EditarPlanLimpiezaPage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el plan
    const { id } = useParams();

    const { data: plan, isLoading, error } = useApi<PlanLimpieza>(`/planes-limpieza/${id}`);

    const actualizarPlan = async (datos: NewPlanLimpieza) => {
        try{
            await api.put(`/planes-limpieza/${id}`, datos);
            await mutate("/planes-limpieza/");
            await mutate(`/planes-limpieza/${id}`);
            mostrarAlertaExito("El plan de limpieza se edito correctamente.")
            navigate("/planes-limpieza");
        } catch (error: any){
            let mensajeFinal = "No se pudo editar el plan de limpieza"
            if (error.response?.data?.detail){      
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error)
        }
    };

    if (isLoading) return (
        <>
            <PageHeader title="Editar Plan de Limpieza" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </>
    )
    if (!plan) return (
        <Container>
            <PageHeader title="Plan de Limpieza no encontrado" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">El plan de limpieza ingresado no existe</Alert>
                </Col>
            </Row>
        </Container>
    )

    if (error) return (
        <Container>
            <PageHeader title="Editar Plan de Limpieza" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar el Plan de Limpieza</Alert>
                </Col>
            </Row>
        </Container>
    )


    return(
        <>
            <PageHeader title="Editar Plan de Limpieza"/>

            <Container>
                <PlanLimpiezaForm textoBoton="Editar Plan de Limpieza"
                    onSubmit={actualizarPlan}
                    valoresIniciales={{
                        nombre: plan.nombre,
                        descripcion: plan.descripcion,
                    }}/>
            </Container>
        </>
    )
}
