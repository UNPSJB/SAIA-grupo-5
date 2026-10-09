import { ConfirmarModal } from "../../../components/ConfirmarModal";
import { api } from "../../../libs/axios";
import { getErrorMessage } from "../../../libs/errors";
import type { Tarea } from "../types";

interface DeleteTareaModalProps {
    tarea: Tarea | null;
    onHide: () => void;
    onDeleted: () => void | Promise<unknown>;
}

export function DeleteTareaModal({ tarea, onHide, onDeleted }: DeleteTareaModalProps) {
    return (
        <ConfirmarModal
            show={tarea !== null}
            title="Eliminar tarea"
            confirmLabel="Eliminar"
            loadingLabel="Eliminando..."
            variant="danger"
            onHide={onHide}
            onConfirm={async () => {
                if (!tarea) return;
                try {
                    await api.delete(`/tareas/${tarea.id}`);
                } catch (error) {
                    throw new Error(getErrorMessage(error, "No se pudo eliminar la tarea."));
                }
                await onDeleted();
            }}
        >
            ¿Estás seguro que querés eliminar la tarea <strong>{tarea?.nombre}</strong>?
        </ConfirmarModal>
    );
}