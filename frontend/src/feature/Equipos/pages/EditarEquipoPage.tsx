import { Container, Spinner, Alert, Col, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { EquipoForm } from "../components/EquipoForm";
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks/useApi";
import type { Equipo, NewEquipo } from "../types";

export function EditarEquipoPage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el equipo
    const { id } = useParams();         // 

    const { data: equipo, isLoading, error } = useApi<Equipo>(`/equipos/${id}`);

    const actualizarEquipo = async (datos: NewEquipo) => {
        try{
            await api.put(`/equipos/${id}`, datos);
            await mutate("/equipos");
            await mutate('/equipos/${id}');
            navigate("/equipos");
        } catch (error){
            alert("No se pudo editar el equipo.");       // Esto se puede cambiar porque se ve como la alerta de google que esta fea
            console.log(error)
        }
    };

    if (isLoading) return (
        <>
            <PageHeader title="Editar Equipo" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </>
    )
    if (!equipo) return (
        <Container>
            <PageHeader title="Equipo no encontrado" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">El equipo ingresado no existe</Alert>
                </Col>
            </Row>
        </Container>
    )

    if (error) return (
        <Container>
            <PageHeader title="Editar Equipo" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar el Equipo</Alert>
                </Col>
            </Row>
        </Container>
    )


    return(
        <>
            <PageHeader title="Editar Equipo"/>

            <Container>
                <EquipoForm textoBoton="Editar Equipo"
                    onSubmit={actualizarEquipo}
                    valoresIniciales={{ nombre: equipo.nombre, categoria: equipo.categoria, ubicacion: equipo.ubicacion}}/>
            </Container>
        </>
    )
}