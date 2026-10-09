import { ConfirmarModal } from "../../../components/ConfirmarModal";
import { api } from "../../../libs/axios";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import { getErrorMessage } from "../../../libs/errors";
import type { TipoQuimico } from "../types";

interface DeleteTipoQuimicoModalProps {
    tipoQuimico: TipoQuimico | null;
    onHide: () => void;
    onDeleted: () => void | Promise<unknown>;
}

export function DeleteTipoQuimicoModal({ tipoQuimico, onHide, onDeleted }: DeleteTipoQuimicoModalProps) {
    const estaActivo = tipoQuimico?.activo ?? true;
    const accion = estaActivo ? "dar de baja" : "dar de alta";

    const handleCambiarEstado = async () => {
        if (!tipoQuimico) return;

        try {
            await api.patch<TipoQuimico>(`/tipos-quimicos/${tipoQuimico.id}/estado`);
            mostrarAlertaExito(
                `El tipo químico '${tipoQuimico.nombre}' se dio de ${estaActivo ? "baja" : "alta"} correctamente.`
            );
        } catch (error: any) {
            mostrarAlertaError(
                getErrorMessage(
                    error,
                    `No se pudo ${accion} el tipo químico '${tipoQuimico.nombre}'.`
                )
            );
            console.log(error);
            return; // el modal se cierra igual y no se recarga nada
        }

        await onDeleted();
    };

    return (
        <ConfirmarModal
            show={tipoQuimico !== null}
            title={`${estaActivo ? "Dar de baja" : "Dar de alta"} tipo químico`}
            confirmLabel={estaActivo ? "Dar de baja" : "Dar de alta"}
            loadingLabel={estaActivo ? "Dando de baja..." : "Dando de alta..."}
            variant={estaActivo ? "danger" : "success"}
            onHide={onHide}
            onConfirm={handleCambiarEstado}
        >
            ¿Estás seguro que querés {accion} el tipo químico <strong>{tipoQuimico?.nombre}</strong>?
        </ConfirmarModal>
    );
}