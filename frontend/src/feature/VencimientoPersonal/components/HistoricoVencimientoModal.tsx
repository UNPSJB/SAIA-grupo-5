import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import { type TableColumn } from 'react-data-table-component';
import { AppTable } from '../../../components/AppTable';
import { useApi } from '../../../hooks/useApi';
import type { VencimientoPersonal } from '../types';

interface HistoricoVencimientoModalProps {
    vencimiento: VencimientoPersonal | null;
    onHide: () => void;
}

export function HistoricoVencimientoModal({ vencimiento, onHide }: HistoricoVencimientoModalProps) {
    const endpoint = vencimiento ? `/vencimiento-personal/persona/${vencimiento.persona_id}/historico/${vencimiento.tipo_vencimiento_id}`: null;     // Se usa pq si todavia no apretaste el boton de historico de cualquier fila, te tira un error 422 pq busca el historico de un undifined

    const { data: historico, isLoading, error } = useApi<VencimientoPersonal[]>(endpoint);

    const columns: TableColumn<VencimientoPersonal>[] = [
        {
            name: 'Fecha Carga',
            selector: (row) => new Date(row.fecha_carga).toLocaleString("es-AR"),      // Esto transforma la fecha al formato de Argentina
            sortable: true,
            center: true,
            grow: 1.4,
        },
        {
            name: 'Desde',
            selector: (row) => row.fecha_desde.split("-").reverse().join("/"),
            sortable: true,
            center: true,
        },
        {
            name: 'Hasta',
            selector: (row) => row.fecha_hasta.split("-").reverse().join("/"),
            sortable: true,
            center: true,
        },
        {
            name: 'Observacion',
            selector: (row) => row.observacion || '-',
            center: true,
        },
        {
            name: 'Vigencia',
            center: true,
            cell: (row) => (
                <div
                    style={{
                        padding: '4px 12px',
                        borderRadius: '16px',
                        background: row.es_actual ? '#dcfce7' : '#e5e7eb',
                        color: row.es_actual ? '#166534' : '#374151',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                    }}
                >
                    {row.es_actual ? 'Actual' : 'Historico'}
                </div>
            ),
        },
        {
            name: 'Archivo',
            center: true,
            grow: 1.1,
            cell: (row) =>
                row.archivo_adjunto ? (
                    <a
                        href={row.archivo_adjunto}
                        download={`comprobante_${row.id}`}
                        className="btn btn-outline-primary btn-sm"
                    >
                        <i className="bi bi-download me-1"></i>Descargar
                    </a>
                ) : (
                    <span>-</span>
                ),
        },
    ];

    return (
        <Modal show={!!vencimiento} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    Historico: {vencimiento?.tipo_vencimiento.nombre} - {vencimiento?.persona.nombre} {vencimiento?.persona.apellido}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {isLoading && (
                    <div className="text-center p-4">
                        <Spinner animation="border" role="status" />
                    </div>
                )}
                {error && (
                    <Alert variant="danger">
                        Ocurrió un error al cargar el historico de renovaciones.
                    </Alert>
                )}
                {!isLoading && !error && (
                    <AppTable columns={columns} data={historico ?? []} />
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    <i className="bi bi-x-circle me-1"></i>Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}