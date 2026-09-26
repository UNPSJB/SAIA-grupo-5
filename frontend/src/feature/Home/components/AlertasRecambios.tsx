import { Alert, Badge, Button, Card, Spinner, Table } from "react-bootstrap";
import { mutate } from "swr";
import { useApi } from "../../../hooks/useApi";
import { api } from "../../../libs/axios";
import type { ElementoLimpieza } from "../../ElementosLimpieza/types";

const ALERTAS_URL = "/elementos-limpieza/alertas";

function textoVencimiento(diasRestantes: number): string {
    const dias = Math.abs(diasRestantes);
    if (diasRestantes < 0) return `Vencido hace ${dias} día${dias === 1 ? "" : "s"}`;
    if (diasRestantes === 0) return "Vence hoy";
    return `Vence en ${dias} día${dias === 1 ? "" : "s"}`;
}

export function AlertasRecambios() {
    const { data: elementos, error, isLoading } = useApi<ElementoLimpieza[]>(ALERTAS_URL);

    const registrarRecambio = async (elemento: ElementoLimpieza) => {
        try {
            await api.post(`/recambios-elementos-limpieza/elemento/${elemento.id}`, {});
            await mutate(ALERTAS_URL);
        } catch (err: any) {
            const detail = err.response?.data?.detail || `No se pudo registrar el recambio de ${elemento.nombre}.`;
            alert(detail);
            console.log(err);
        }
    };

    if (isLoading) {
        return (
            <Card className="mb-4 shadow-sm">
                <Card.Header className="fw-bold">
                    <i className="bi bi-bell-fill me-2"></i>Notificaciones
                </Card.Header>
                <Card.Body className="text-center">
                    <Spinner animation="border" role="status" size="sm">
                        <span className="visually-hidden">Cargando...</span>
                    </Spinner>
                </Card.Body>
            </Card>
        );
    }

    if (error) {
        return (
            <Alert variant="danger" className="mb-4">
                Ocurrió un error al cargar las alertas de recambio de elementos de limpieza.
            </Alert>
        );
    }

    if (!elementos || elementos.length === 0) {
        return null;
    }

    return (
        <Card className="mb-4 shadow-sm text-start">
            <Card.Header className="fw-bold">
                <i className="bi bi-bell-fill me-2"></i>Notificaciones
                <Badge bg="secondary" className="ms-2">{elementos.length}</Badge>
            </Card.Header>
            <Table responsive hover className="mb-0 align-middle">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Elemento</th>
                        <th>Ubicación</th>
                        <th>Estado</th>
                        <th className="text-end">Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {elementos.map((elemento) => {
                        const dias = elemento.dias_restantes ?? 0;
                        const vencido = dias < 0;
                        return (
                            <tr key={elemento.id}>
                                <td>{elemento.codigo}</td>
                                <td>{elemento.nombre}</td>
                                <td>{elemento.ubicacion || "-"}</td>
                                <td>
                                    <Badge bg={vencido ? "danger" : "warning"} text={vencido ? undefined : "dark"}>
                                        {textoVencimiento(dias)}
                                    </Badge>
                                </td>
                                <td className="text-end">
                                    <Button
                                        variant="outline-success"
                                        size="sm"
                                        onClick={() => registrarRecambio(elemento)}
                                    >
                                        <i className="bi bi-arrow-repeat me-1"></i>Registrar recambio
                                    </Button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        </Card>
    );
}
