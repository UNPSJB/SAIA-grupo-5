import { Alert, Modal, Spinner } from "react-bootstrap";
import { useApi } from "../../../hooks/useApi";
import type { PlanLimpieza } from "../../PlanesLimpieza/types";
import type { Equipo } from "../types";

interface VerPlanLimpiezaModalProps {
    equipo: Equipo | null;
    onHide: () => void;
}

export function VerPlanLimpiezaModal({ equipo, onHide }: VerPlanLimpiezaModalProps) {
    // Se pasa null como key mientras no haya equipo con plan asignado, para no traer el detalle hasta que se abra el modal
    const { data: plan, isLoading, error } = useApi<PlanLimpieza>(
        equipo?.plan_limpieza ? `/planes-limpieza/${equipo.plan_limpieza.id}` : null
    );

    return (
        <Modal show={equipo !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Plan de limpieza de {equipo?.nombre}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {!equipo?.plan_limpieza ? (
                    <p className="text-muted mb-0">
                        Este equipo no tiene un plan de limpieza asignado todavía.
                    </p>
                ) : (
                    <>
                        {isLoading && (
                            <div className="text-center py-3">
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </Spinner>
                            </div>
                        )}
                        {error && (
                            <Alert variant="danger" className="mb-0">
                                Ocurrió un error al cargar el plan de limpieza.
                            </Alert>
                        )}
                        {!isLoading && !error && plan && (
                            <>
                                <h6 className="fw-bold">{plan.nombre}</h6>
                                <p className="mb-0">
                                    {plan.descripcion || "Sin descripción."}
                                </p>
                            </>
                        )}
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
}
