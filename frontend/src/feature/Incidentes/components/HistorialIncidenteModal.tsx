import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import { type ExpanderComponentProps, type TableColumn } from 'react-data-table-component';
import { AppTable } from '../../../components/AppTable';
import { useApi } from '../../../hooks/useApi';
import type { Persona } from '../../Personal/types';
import type { HistorialIncidente, Incidente, TipoEventoHistorial } from '../types';

interface HistorialIncidenteModalProps {
    incidente: Incidente | null;
    onHide: () => void;
}

const TIPO_EVENTO_LABELS: Record<TipoEventoHistorial, string> = {
    CREADO: "Creado",
    CERRADO: "Cerrado",
    REABIERTO: "Reabierto",
};

const TIPO_EVENTO_ESTILOS: Record<TipoEventoHistorial, { background: string; color: string }> = {
    CREADO: { background: "#dbeafe", color: "#1d4ed8" },
    CERRADO: { background: "#dcfce7", color: "#166534" },
    REABIERTO: { background: "#fef3c7", color: "#92400e" },
};

function DescripcionExpandida({ data: row }: ExpanderComponentProps<HistorialIncidente>) {
    return (
        <div style={{ padding: '16px 40px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>Descripción completa</p>
            <p style={{ color: '#6b7280', margin: 0, whiteSpace: 'pre-wrap' }}>{row.descripcion || '-'}</p>
        </div>
    );
}

export function HistorialIncidenteModal({ incidente, onHide }: HistorialIncidenteModalProps) {
    const endpoint = incidente ? `/historial-incidente/?incidente_id=${incidente.id}` : null;

    const { data: historial, isLoading, error } = useApi<HistorialIncidente[]>(endpoint);
    const { data: personal } = useApi<Persona[]>('/personal/');

    const obtenerNombreUsuario = (usuarioId: number) => {
        const persona = personal?.find((p) => p.id === usuarioId);
        return persona ? `${persona.nombre} ${persona.apellido}` : `Usuario #${usuarioId}`;
    };

    const columns: TableColumn<HistorialIncidente>[] = [
        {
            name: 'Fecha',
            selector: (row) => new Date(row.fecha_evento).toLocaleString("es-AR"),
            sortable: true,
            center: true,
            grow: 1.3,
        },
        {
            name: 'Evento',
            center: true,
            cell: (row) => (
                <div
                    style={{
                        padding: '4px 12px',
                        borderRadius: '16px',
                        background: TIPO_EVENTO_ESTILOS[row.tipo_evento].background,
                        color: TIPO_EVENTO_ESTILOS[row.tipo_evento].color,
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                    }}
                >
                    {TIPO_EVENTO_LABELS[row.tipo_evento]}
                </div>
            ),
        },
        {
            name: 'Usuario',
            selector: (row) => obtenerNombreUsuario(row.usuario_id),
            center: true,
            grow: 1.2,
        },
        {
            name: 'Descripción',
            selector: (row) => row.descripcion || '-',
            grow: 2,
        },
    ];

    return (
        <Modal show={!!incidente} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    Historial: {incidente?.nombre}
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
                        Ocurrió un error al cargar el historial del incidente.
                    </Alert>
                )}
                {!isLoading && !error && (
                    <AppTable
                        columns={columns}
                        data={historial ?? []}
                        expandableRows
                        expandableRowsComponent={DescripcionExpandida}
                    />
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
