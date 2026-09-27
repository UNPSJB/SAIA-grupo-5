import { Alert, Badge, Col, Container, Row, Spinner, Table } from "react-bootstrap";
import { PageHeader } from "../../components/PageHeader";
import { useApi } from "../../hooks/useApi";
import { EstadoTareaOcurrencia } from "./types";
import type { TareaOcurrencia } from "./types";


function fechaHoy(): string {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${hoy.getFullYear()}-${mes}-${dia}`;
}
export function ChecklistPage() {
    const { data, error, isLoading } = useApi<TareaOcurrencia[]>("/tareas-ocurrencia/")

    if (isLoading) return (
        <>
            <PageHeader title="Checklist de limpieza" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </>
    )
    if (error) return (
        <Container>
            <PageHeader title="Checklist de limpieza" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar el checklist</Alert>
                </Col>
            </Row>
        </Container>
    )

    const tareasHoy = Array.isArray(data) ? data.filter((tarea) => tarea.fecha === fechaHoy()) : [];

    return (
        <>
            <PageHeader title="Checklist de limpieza" />
            <Container>
                {tareasHoy.length === 0 ? (
                    <Alert variant="info">No hay tareas de limpieza programadas para hoy.</Alert>
                ) : (
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Tarea</th>
                                <th scope="col">Plan</th>
                                <th scope="col">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tareasHoy.map((tarea: TareaOcurrencia, i) => (
                                <tr key={tarea.id}>
                                    <th scope="row">{i + 1}</th>
                                    <td style={{ overflowWrap: 'anywhere' }}>
                                        {tarea.tarea_nombre_snap}
                                        {tarea.tarea_descripcion_snap && (
                                            <div className="text-muted small">{tarea.tarea_descripcion_snap}</div>
                                        )}
                                    </td>
                                    <td>{tarea.plan_nombre_snap}</td>
                                    <td>
                                    <Badge
                                        bg={tarea.estado === EstadoTareaOcurrencia.COMPLETADA ? 'success' : 'warning'}
                                        text={tarea.estado === EstadoTareaOcurrencia.COMPLETADA ? 'white' : 'dark'}
                                    >
                                        {tarea.estado === EstadoTareaOcurrencia.COMPLETADA ? 'Realizada' : 'Pendiente'}
                                    </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Container>
        </>
    )
}