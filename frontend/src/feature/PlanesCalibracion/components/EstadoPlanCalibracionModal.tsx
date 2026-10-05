import { Button, Modal } from "react-bootstrap";
import { api } from "../../../libs/axios";
import type { PlanCalibracion } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import { getErrorMessage } from "../../../libs/errors";

interface EstadoPlanCalibracionModalProps {
    planCalibracion: PlanCalibracion | null;
    onHide: () => void;
    onDeleted: () => void;
}

export function EstadoPlanCalibracionModal({ planCalibracion, onHide, onDeleted }: EstadoPlanCalibracionModalProps) {
    const cambiarEstado = async () => {
        if (!planCalibracion) return;

        const accion = planCalibracion.estado ? "dar de baja" : "dar de alta";

        try {
            await api.patch<PlanCalibracion>(`/planes-calibracion/${planCalibracion.id}/estado`);
            mostrarAlertaExito(`El plan de calibración se ${planCalibracion.estado ? "dio de baja" : "dio de alta"} correctamente.`);
            onDeleted();
        } catch (error: any){
            mostrarAlertaError(
                getErrorMessage(
                    error,
                    `No se pudo ${accion} el plan de calibración.`
                )
            );
            console.log(error);
        } finally{
            onHide();
        }
    };

    if (!planCalibracion) return null;

    const estaActivo = planCalibracion.estado;

    return (
        <Modal show={true} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {estaActivo
                        ? "Dar de baja plan de calibración"
                        : "Dar de alta plan de calibración"}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que querés {estaActivo ? "dar de baja" : "dar de alta"} este plan de calibración?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                <Button variant={estaActivo ? "danger" : "success"} onClick={cambiarEstado}>
                    {estaActivo ? "Dar de baja" : "Dar de alta"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}