import { Button, Modal } from "react-bootstrap";
import { type TableColumn } from "react-data-table-component";
import { AppTable } from "../../../components/AppTable";
import type { RecambioElementoLimpieza } from "../types";

interface HistorialRecambiosModalProps {
    show: boolean;
    onHide: () => void;
    recambios: RecambioElementoLimpieza[];
}

export function HistorialRecambiosModal({ show, onHide, recambios }: HistorialRecambiosModalProps) {
    const columns: TableColumn<RecambioElementoLimpieza>[] = [
        {
            name: "Fecha",
            selector: (recambio) => recambio.fecha,
            sortable: true,
            minWidth: "160px",
        },
        {
            name: "Observación",
            selector: (recambio) => recambio.observacion ?? "-",
            wrap: true,
        },
    ];

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
                    <AppTable columns={columns} data={recambios} pagination={false} />
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