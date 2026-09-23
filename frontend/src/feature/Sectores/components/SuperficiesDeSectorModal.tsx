import { Alert, ListGroup, Modal, Spinner } from "react-bootstrap";
import { useApi } from "../../../hooks/useApi";
import type { Superficie } from "../../Superficies/types";
import type { Sector } from "../types";

interface SuperficiesDeSectorModalProps {
    sector: Sector | null;
    onHide: () => void;
}

export function SuperficiesDeSectorModal({ sector, onHide }: SuperficiesDeSectorModalProps) {
    // Se pasa null como key mientras no haya sector seleccionado, para no traer superficies hasta que se abra el modal
    const { data: superficies, isLoading, error } = useApi<Superficie[]>(
        sector ? `/sectores/${sector.id}/superficies` : null
    );

    return (
        <Modal show={sector !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Superficies de {sector?.nombre}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {isLoading && (
                    <div className="text-center py-3">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </Spinner>
                    </div>
                )}
                {error && (
                    <Alert variant="danger" className="mb-0">
                        Ocurrió un error al cargar las superficies del sector.
                    </Alert>
                )}
                {!isLoading && !error && (
                    superficies && superficies.length > 0 ? (
                        <ListGroup numbered variant="flush">
                            {superficies.map((superficie) => (
                                <ListGroup.Item
                                    variant="primary"
                                    disabled
                                    key={superficie.id}>
                                        {superficie.nombre}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    ) : (
                        <p className="text-muted mb-0">
                            Este sector no tiene superficies asociadas todavía.
                        </p>
                    )
                )}
            </Modal.Body>
        </Modal>
    );
}
