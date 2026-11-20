import { Button, Modal } from "react-bootstrap";
import { type TableColumn } from "react-data-table-component";
import { AppTable } from "../../../components/AppTable";
import {
    formatearValorHistorial,
    obtenerInfoDatoHistorial,
    type HistorialNutricionalInsumo,
} from "../types";

interface HistorialNutricionalModalProps {
    show: boolean;
    onHide: () => void;
    historial: HistorialNutricionalInsumo[];
}

export function HistorialNutricionalModal({
    show,
    onHide,
    historial,
}: HistorialNutricionalModalProps) {
    const columns: TableColumn<HistorialNutricionalInsumo>[] = [
        {
            name: "Fecha",
            selector: (item) =>
                new Date(item.fecha_modificacion).toLocaleString("es-AR", {
                    dateStyle: "short",
                    timeStyle: "short",
                }),
            sortable: true,
            minWidth: "145px",
        },
        {
            name: "Dato",
            selector: (item) => obtenerInfoDatoHistorial(item.dato_modificado).etiqueta,
            sortable: true,
            minWidth: "160px",
        },
        {
            name: "Valor anterior",
            selector: (item) => {
                const { unidad } = obtenerInfoDatoHistorial(item.dato_modificado);
                return formatearValorHistorial(item.valor_anterior, unidad);
            },
            center: true,
            minWidth: "120px",
        },
        {
            name: "Valor nuevo",
            selector: (item) => {
                const { unidad } = obtenerInfoDatoHistorial(item.dato_modificado);
                return formatearValorHistorial(item.valor_nuevo, unidad);
            },
            center: true,
            minWidth: "120px",
        },
        {
            name: "Modificado por",
            selector: (item) =>
                item.modificada_por
                    ? `${item.modificada_por.nombre} ${item.modificada_por.apellido}`
                    : "-",
            sortable: true,
            minWidth: "150px",
        },
        {
            name: "Motivo",
            selector: (item) => item.motivo ?? "-",
            wrap: true,
            grow: 1.5,
        },
    ];

    return (
        <Modal show={show} onHide={onHide} centered size="xl">
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="bi bi-clock-history me-2"></i>
                    Historial de Modificaciones Nutricionales
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ maxHeight: "480px", overflowY: "auto" }}>
                {historial.length === 0 ? (
                    <p className="text-muted mb-0">
                        Esta información nutricional todavía no tiene modificaciones registradas.
                    </p>
                ) : (
                    <AppTable columns={columns} data={historial} pagination={false} />
                )}
            </Modal.Body>

            <Modal.Footer className="justify-content-start">
                <Button variant="secondary" onClick={onHide}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}