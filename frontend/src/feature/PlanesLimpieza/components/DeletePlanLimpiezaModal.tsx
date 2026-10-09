import { ConfirmarModal } from "../../../components/ConfirmarModal";
import { api } from "../../../libs/axios";
import { getErrorMessage } from "../../../libs/errors";
import { mostrarAlertaExito, mostrarAlertaError } from "../../../libs/alertas";
import type { PlanLimpieza } from "../types";

interface DeletePlanLimpiezaModalProps {
    plan: PlanLimpieza | null;
    onHide: () => void;
    onDeleted: () => void | Promise<unknown>;
}

export function DeletePlanLimpiezaModal({ plan, onHide, onDeleted }: DeletePlanLimpiezaModalProps) {
    const handleDelete = async () => {
        if (!plan) return;

        try {
            await api.delete(`/planes-limpieza/${plan.id}`);
            mostrarAlertaExito("El plan de limpieza se dio de baja correctamente.");
        } catch (error: any) {
            mostrarAlertaError(
                getErrorMessage(error, "No se pudo dar de baja el plan de limpieza.")
            );
            console.log(error);
            return; // el modal se cierra igual y no se recarga nada
        }

        await onDeleted();
    };

    return (
        <ConfirmarModal
            show={plan !== null}
            title="Dar de baja plan de limpieza"
            confirmLabel="Dar de baja"
            loadingLabel="Dando de baja..."
            variant="danger"
            onHide={onHide}
            onConfirm={handleDelete}
        >
            ¿Estás seguro que querés dar de baja el plan de limpieza <strong>{plan?.nombre}</strong>?
        </ConfirmarModal>
    );
}