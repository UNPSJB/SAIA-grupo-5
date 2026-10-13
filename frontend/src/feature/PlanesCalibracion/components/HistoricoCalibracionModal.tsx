import { Modal, Button } from 'react-bootstrap';
import { type TableColumn } from 'react-data-table-component';
import { AppTable } from '../../../components/AppTable';
import { ModalLoading } from '../../../components/ModalLoading';
import { ModalError } from '../../../components/ModalError';
import { useApi } from '../../../hooks/useApi';
import { ActionButton } from '../../../components/ActionButton';
import type { PlanCalibracion, RegistroCalibracion } from '../types';


interface HistoricoCalibracionModalProps {
    plan: PlanCalibracion | null;
    onHide: () => void;
}


export function HistoricoCalibracionModal({ plan, onHide }: HistoricoCalibracionModalProps) {
    const endpoint = plan ? `/registros-calibracion/plan/${plan.id}` : null;

    const { data: historico, isLoading, error } = useApi<RegistroCalibracion[]>(endpoint);


    const columns: TableColumn<RegistroCalibracion>[] = [
        {
            name: 'Fecha',
            selector: (row) => row.fecha.split("-").reverse().join("/"),
            sortable: true,
            center: true,
        },
        {
            name: 'Observación',
            cell: (row) => (
                <div
                    style={{
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        padding: '8px 0',
                        width: '100%&',
                    }}
                >
                    {row.observacion || '-'}
                </div>
            ),
        },
        {
            name: 'Certificado',
            center: true,
            grow: 1,
            cell: (row) =>
                row.certificado ? (
                    <ActionButton
                        variant="outline-primary"
                        size="sm"
                        tooltip="Descargar certificado"
                        icon="bi-download"
                        href={row.certificado}
                        download={`certificado_calibracion_${row.fecha}`}
                    />
                ) : (
                    <>-</>
                ),
        },
    ];


    return (
        <Modal show={!!plan} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Histórico de Calibraciones</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {isLoading && <ModalLoading />}

                {error && (
                    <ModalError message="Ocurrió un error al cargar el histórico de calibraciones." />
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