import { Container, Spinner, Alert, Col, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { InsumoForm } from "../components/InsumoForm";
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks/useApi";
import type { Insumo, NewInsumo } from "../types";

export function EditarInsumoPage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el insumo
    const { id } = useParams();         //

    const { data: insumo, isLoading, error } = useApi<Insumo>(`/insumos/${id}`);

    const actualizarInsumo = async (datos: NewInsumo) => {
        try{
            await api.put(`/insumos/${id}`, datos);
            await mutate("/insumos/");
            await mutate(`/insumos/${id}`);     // Se agrego esto ya que habia un bug en el editar
            navigate("/insumos");
        } catch (error){
            alert("No se pudo editar el insumo.");       // Esto se puede cambiar porque se ve como la alerta de google que esta fea
            console.log(error)
        }
    };

    if (isLoading) return (
        <>
            <PageHeader title="Editar Insumo" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </>
    )
    if (!insumo) return (
        <Container>
            <PageHeader title="Insumo no encontrado" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">El insumo ingresado no existe</Alert>
                </Col>
            </Row>
        </Container>
    )

    if (error) return (
        <Container>
            <PageHeader title="Editar Insumo" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar el Insumo</Alert>
                </Col>
            </Row>
        </Container>
    )


    return(
        <>
            <PageHeader title="Editar Insumo"/>

            <Container>
                <InsumoForm textoBoton="Editar Insumo"
                    onSubmit={actualizarInsumo}
                    valoresIniciales={{ nombre: insumo.nombre, unidad_medida: insumo.unidad_medida}}/>
            </Container>
        </>
    )
}