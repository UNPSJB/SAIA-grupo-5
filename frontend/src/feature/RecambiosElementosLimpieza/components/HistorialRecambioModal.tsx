import { Button, Modal, Table } from "react-bootstrap";
import type { RecambioElementoLimpieza } from "../types";

interface HistorialRecambiosModalProps {
    show: boolean;
    onHide: () => void;
    recambios: RecambioElementoLimpieza[];
}

export function HistorialRecambiosModal({ show, onHide, recambios }: HistorialRecambiosModalProps) {
    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="bi bi-clock-history me-2"></i>
                    Historial de Recambios
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ maxHeight: "450px", overflowY: "auto" }}>
                {recambios.length === 0 ? (
                    <p className="text-muted mb-0">
                        Este elemento todavía no tiene recambios registrados.
                    </p>
                ) : (
                    <Table hover responsive className="mb-0">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Observación</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recambios.map((recambio) => (
                                <tr key={recambio.id}>
                                    <td style={{ whiteSpace: "nowrap" }}>
                                        {recambio.fecha}
                                    </td>
                                    <td>
                                        {recambio.observacion ?? "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}