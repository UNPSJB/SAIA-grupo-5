import { useState } from "react";
import { Alert, Badge, Card, Collapse, Spinner, Table } from "react-bootstrap";
import { useVencimientosPersonal } from "../hooks/useVencimientosPersonal";

function formatearFecha(fecha: string): string {
    return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-AR");
}

function textoVencimiento(diasRestantes: number): string {
    const dias = Math.abs(diasRestantes);
    if (diasRestantes < 0) return `Vencido hace ${dias} día${dias === 1 ? "" : "s"}`;
    if (diasRestantes === 0) return "Vence hoy";
    return `Vence en ${dias} día${dias === 1 ? "" : "s"}`;
}

export function AlertasVencimientosPersonal() {
    const { vencimientos, error, isLoading } = useVencimientosPersonal();
    const [open, setOpen] = useState(true);

    if (isLoading) {
        return (
            <Card className="mb-4 shadow-sm">
                <Card.Header className="fw-bold">
                    <i className="bi bi-bell-fill me-2"></i>Vencimientos de Personal
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
                Ocurrió un error al cargar las alertas de vencimientos de personal.
            </Alert>
        );
    }

    if (vencimientos.length === 0) {
        return null;
    }

    return (
        <Card className="mb-4 shadow-sm text-start">
            <Card.Header
                className="fw-bold"
                role="button"
                style={{ cursor: "pointer" }}
                onClick={() => setOpen((prev) => !prev)}
                aria-controls="alertas-vencimientos-personal"
                aria-expanded={open}
            >
                <i className={`bi ${open ? "bi-chevron-down" : "bi-chevron-right"} me-2`}></i>
                <i className="bi bi-bell-fill me-2"></i>Vencimientos de Personal
                <Badge bg="secondary" className="ms-2">{vencimientos.length}</Badge>
            </Card.Header>
            <Collapse in={open}>
                <div id="alertas-vencimientos-personal">
                    <Table responsive hover className="mb-0 align-middle">
                        <thead>
                            <tr>
                                <th>Persona</th>
                                <th>Tipo de Vencimiento</th>
                                <th>Fecha de Vencimiento</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vencimientos.map((vencimiento) => {
                                const vencido = vencimiento.estado === "Vencido";
                                return (
                                    <tr key={vencimiento.id} className={vencido ? "table-danger" : "table-warning"}>
                                        <td>{vencimiento.persona.nombre} {vencimiento.persona.apellido}</td>
                                        <td>{vencimiento.tipo_vencimiento.nombre}</td>
                                        <td>{formatearFecha(vencimiento.fecha_hasta)}</td>
                                        <td>
                                            <Badge bg={vencido ? "danger" : "warning"} text={vencido ? undefined : "dark"}>
                                                {textoVencimiento(vencimiento.diasRestantes)}
                                            </Badge>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </div>
            </Collapse>
        </Card>
    );
}
