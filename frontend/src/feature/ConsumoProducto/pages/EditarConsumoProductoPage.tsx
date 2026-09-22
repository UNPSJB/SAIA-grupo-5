import { Container, Spinner, Alert, Col, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { ConsumoProductoForm } from "../components/ConsumoProductoForm";
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks/useApi";
import type { ConsumoProducto, NewConsumoProducto } from "../types";

export function EditarConsumoProductoPage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el insumo
    const { id } = useParams();         //

    const { data: consumo, isLoading, error } = useApi<ConsumoProducto>(`/consumos_productos/${id}`);

    const actualizarConsumoProducto = async (datos: NewConsumoProducto) => {
        try{
            await api.put(`/consumos_productos/${id}`, datos);
            await mutate("/consumos_productos/");
            await mutate(`/consumos_productos/${id}`);     // Se agrego esto ya que habia un bug en el editar
            navigate("/consumos_productos");
        } catch (error){
            alert("No se pudo editar el consumo.");       // Esto se puede cambiar porque se ve como la alerta de google que esta fea
            console.log(error)
        }
    };

    if (isLoading) return (
        <>
            <PageHeader title="Editar Consumo de Insumo Químico" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </>
    )
    if (!consumo) return (
        <Container>
            <PageHeader title="Consumo no encontrado" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">El consumo ingresado no existe</Alert>
                </Col>
            </Row>
        </Container>
    )

    if (error) return (
        <Container>
            <PageHeader title="Editar Consumo de Insumo Químico" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar el Consumo</Alert>
                </Col>
            </Row>
        </Container>
    )


    return(
        <>
            <PageHeader title="Editar Consumo"/>

            <Container>
                <ConsumoProductoForm textoBoton="Editar Consumo"
                    onSubmit={actualizarConsumoProducto}
                    valoresIniciales={{ tarea_id: consumo.tarea_id, insumo_quimico_id: consumo.insumo_quimico_id, 
                        cantidad_aproximada: consumo.cantidad_aproximada, unidad_medida: consumo.unidad_medida}}/>
            </Container>
        </>
    )
}