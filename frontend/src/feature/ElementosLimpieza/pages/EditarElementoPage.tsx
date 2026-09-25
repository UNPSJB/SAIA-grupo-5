import { Container, Spinner, Alert, Col, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { ElementoLimpiezaForm } from "../components/ElementoLimpiezaForm";
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks/useApi";
import type { ElementoLimpieza, NewElementoLimpieza } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

export function EditarElementoPage(){
    const navigate = useNavigate();
    const { id } = useParams();

    const { data: elementoLimpieza, isLoading, error } = useApi<ElementoLimpieza>(`/elementos-limpieza/${id}`);

    const actualizarElementoLimpieza = async (datos: NewElementoLimpieza) => {
        try{
            await api.put(`/elementos-limpieza/${id}`, datos);
            await mutate("/elementos-limpieza");
            await mutate(`/elementos-limpieza/${id}`);
            mostrarAlertaExito("El elemento de limpieza se editó correctamente.");
            navigate("/elementos-limpieza");
        } catch (error: any){
            let mensaje = "No se pudo editar el elemento de limpieza.";
            if (error.response?.data?.detail){
                if (Array.isArray(error.response.data.detail)) {
                    mensaje = error.response.data.detail[0].msg;
                } else {
                    mensaje = error.response.data.detail;
                }
            }
            mostrarAlertaError(mensaje);
            console.log(error);
        }
    };

    if (isLoading) return (
        <>
            <PageHeader title="Editar Elemento de Limpieza" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
            </Spinner>
        </>
    )

    if (!elementoLimpieza) return (
        <Container>
            <PageHeader title="Elemento de limpieza no encontrado" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">El elemento de limpieza ingresado no existe</Alert>
                </Col>
            </Row>
        </Container>
    )

    if (error) return (
        <Container>
            <PageHeader title="Editar Elemento de Limpieza" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar el Elemento de Limpieza</Alert>
                </Col>
            </Row>
        </Container>
    )

    return(
        <>
            <PageHeader title="Editar Elemento de Limpieza"/>

            <Container>
                <ElementoLimpiezaForm
                    textoBoton="Editar Elemento de Limpieza"
                    onSubmit={actualizarElementoLimpieza}
                    valoresIniciales={{
                        nombre: elementoLimpieza.nombre,
                        tipo_id: elementoLimpieza.tipo_id,
                        material: elementoLimpieza.material,
                        ubicacion: elementoLimpieza.ubicacion,
                        frecuencia_recambio: elementoLimpieza.frecuencia_recambio
                    }}
                />
            </Container>
        </>
    )
}