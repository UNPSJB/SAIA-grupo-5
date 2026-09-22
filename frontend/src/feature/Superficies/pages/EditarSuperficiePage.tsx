import { Container, Spinner, Alert, Col, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { SuperficieForm } from "../components/SuperficieForm";
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks/useApi";
import type { Superficie, NewSuperficie } from "../types";

export function EditarSuperficiePage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree la superficie
    const { id } = useParams();

    const { data: superficie, isLoading, error } = useApi<Superficie>(`/superficies/${id}`);

    const actualizarSuperficie = async (datos: NewSuperficie) => {
        try{
            await api.put(`/superficies/${id}`, datos);
            await mutate("/superficies/");
            await mutate(`/superficies/${id}`);
            navigate("/superficies");
        } catch (error){
            alert("No se pudo editar la superficie.");
            console.log(error)
        }
    };

    if (isLoading) return (
        <>
            <PageHeader title="Editar Superficie" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </>
    )
    if (!superficie) return (
        <Container>
            <PageHeader title="Superficie no encontrada" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">La superficie ingresada no existe</Alert>
                </Col>
            </Row>
        </Container>
    )

    if (error) return (
        <Container>
            <PageHeader title="Editar Superficie" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar la Superficie</Alert>
                </Col>
            </Row>
        </Container>
    )


    return(
        <>
            <PageHeader title="Editar Superficie"/>

            <Container>
                <SuperficieForm textoBoton="Editar Superficie"
                    onSubmit={actualizarSuperficie}
                    valoresIniciales={{
                        nombre: superficie.nombre,
                        tipo_contacto: superficie.tipo_contacto,
                        sector_ids: superficie.sectores.map(s => s.id),
                        plan_limpieza_ids: superficie.planes.map(p => p.id),
                    }}/>
            </Container>
        </>
    )
}
