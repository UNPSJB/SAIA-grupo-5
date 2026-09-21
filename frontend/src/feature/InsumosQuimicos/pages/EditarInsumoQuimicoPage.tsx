import { Container, Spinner, Alert, Col, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { InsumoQuimicoForm } from "../components/InsumoQuimicoForm"; 
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks/useApi";
import type { InsumoQuimico, NewInsumoQuimico } from "../types";

export function EditarInsumoQuimicoPage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el insumo
    const { id } = useParams();         //

    const { data: insumoQuimico, isLoading, error } = useApi<InsumoQuimico>(`/insumos-quimicos/${id}`);

    const actualizarInsumoQuimico = async (datos: NewInsumoQuimico) => {
        try{
            await api.put(`/insumos-quimicos/${id}`, datos);
            await mutate("/insumos-quimicos/");
            await mutate(`/insumos-quimicos/${id}`);     // Se agrego esto ya que habia un bug en el editar
            navigate("/insumos-quimicos");
        } catch (error){
            alert("No se pudo editar el insumo quimico.");       // Esto se puede cambiar porque se ve como la alerta de google que esta fea
            console.log(error)
        }
    };

    if (isLoading) return (
        <>
            <PageHeader title="Editar Insumo Quimico" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
            </Spinner>
        </>
    )
    if (!insumoQuimico) return (
        <Container>
            <PageHeader title="Insumo quimico no encontrado" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">El insumo quimico ingresado no existe</Alert>
                </Col>
            </Row>
        </Container>
    )

    if (error) return (
        <Container>
            <PageHeader title="Editar Insumo Quimico" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar el Insumo Quimico</Alert>
                </Col>
            </Row>
        </Container>
    )


    return(
        <>
            <PageHeader title="Editar Insumo Quimico"/>

            <Container>
                <InsumoQuimicoForm textoBoton="Editar Insumo Quimico"
                    onSubmit={actualizarInsumoQuimico}
                    valoresIniciales={{ nombre: insumoQuimico.nombre, 
                    unidad_medida: insumoQuimico.unidad_medida, 
                    tipo_quimico_id: insumoQuimico.tipo?.id || insumoQuimico.tipo_quimico_id}}/>
            </Container>
        </>
    )
}