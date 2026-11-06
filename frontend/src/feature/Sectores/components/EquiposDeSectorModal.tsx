import { ListGroup, Modal } from "react-bootstrap";
import { ModalLoading } from "../../../components/ModalLoading";
import { ModalError } from "../../../components/ModalError";
import { useApi } from "../../../hooks/useApi";
import type { Equipo } from "../../Equipos/types";
import type { Sector } from "../types";

interface EquiposDeSectorModalProps {
    sector: Sector | null;
    onHide: () => void;
}

export function EquiposDeSectorModal({ sector, onHide }: EquiposDeSectorModalProps) {
    // Se pasa null como key mientras no haya sector seleccionado, para no traer equipos hasta que se abra el modal
    const { data: equipos, isLoading, error } = useApi<Equipo[]>(
        sector ? `/sectores/${sector.id}/equipos` : null
    );

    return (
        <Modal show={sector !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Equipos de {sector?.nombre}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {isLoading && <ModalLoading />}
                {error && (
                    <ModalError message="Ocurrió un error al cargar los equipos del sector." />
                )}
                {!isLoading && !error && (
                    equipos && equipos.length > 0 ? (
                        <ListGroup numbered variant="flush">
                            {equipos.map((equipo) => (
                                <ListGroup.Item 
                                    variant="primary" 
                                    disabled 
                                    key={equipo.id}>
                                        {equipo.nombre}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    ) : (
                        <p className="text-muted mb-0">
                            Este sector no tiene equipos asociados todavía.
                        </p>
                    )
                )}
            </Modal.Body>
        </Modal>
    );
}
