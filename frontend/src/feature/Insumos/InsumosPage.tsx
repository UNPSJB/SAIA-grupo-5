import { Alert, Col, Container, Row, Spinner, Table } from "react-bootstrap";
import { PeageHeader } from "../../components/PageHeader";
import { useApi } from "../../hooks/useApi";
import type { Insumo } from "./types";

export function InsumosPage() {
    const { data, error, isLoading } = useApi<Insumo[]>("/insumos")

    if (isLoading) return (
        <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
        </Spinner>
    )
    if (error) return (
        <Container>
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar Insumos</Alert>
                </Col>
            </Row>
        </Container>
    )

    console.log(data)

    return (
        <>
            <PeageHeader title="Listado de Insumos" />
            <Container >
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Nombre</th>
                            <th scope="col">Unidad de medida</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.map((insumo: Insumo, i) => (
                            <tr key={insumo.id}>
                                <th scope="row">{i + 1}</th>
                                <td>{insumo.nombre}</td>
                                <td>{insumo.unidad_medida}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Container>
        </>
    )
}