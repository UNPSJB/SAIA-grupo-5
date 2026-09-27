import { Container, Spinner, Alert, Col, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { SectorForm } from "../components/SectorForm";
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks/useApi";
import type { Sector, NewSector } from "../types";

export function EditarSectorPage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el sector
    const { id } = useParams();

    const { data: sector, isLoading, error } = useApi<Sector>(`/sectores/${id}`);

    const actualizarSector = async (datos: NewSector) => {
        try{
            await api.put(`/sectores/${id}`, datos);
            await mutate("/sectores/");
            await mutate(`/sectores/${id}`);
            navigate("/sectores");
        } catch (error){
            alert("No se pudo editar el sector.");       // Esto se puede cambiar porque se ve como la alerta de google que esta fea
            console.log(error)
        }
    };

    if (isLoading) return (
        <>
            <PageHeader title="Editar Sector" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </>
    )
    if (!sector) return (
        <Container>
            <PageHeader title="Sector no encontrado" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">El sector ingresado no existe</Alert>
                </Col>
            </Row>
        </Container>
    )

    if (error) return (
        <Container>
            <PageHeader title="Editar Sector" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar el Sector</Alert>
                </Col>
            </Row>
        </Container>
    )


    return(
        <>
            <PageHeader title="Editar Sector"/>

            <Container>
                <SectorForm textoBoton="Editar Sector"
                    onSubmit={actualizarSector}
                    valoresIniciales={{ nombre: sector.nombre }}/>
            </Container>
        </>
    )
}
