import { ConfirmarModal } from "../../../components/ConfirmarModal";
import { api } from "../../../libs/axios";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import { getErrorMessage } from "../../../libs/errors";
import type { InsumoQuimico } from "../types";

interface DeleteInsumoQuimicoModalProps {
    insumoQuimico: InsumoQuimico | null;
    onHide: () => void;
    onDeleted: () => void | Promise<unknown>;
}

export function DeleteInsumoQuimicoModal({ insumoQuimico, onHide, onDeleted }: DeleteInsumoQuimicoModalProps) {
    const estaActivo = insumoQuimico?.activo ?? true;
    const accion = estaActivo ? "dar de baja" : "dar de alta";

    const handleCambiarEstado = async () => {
        if (!insumoQuimico) return;

        try {
            await api.patch<InsumoQuimico>(`/insumos-quimicos/${insumoQuimico.id}/estado`);
            mostrarAlertaExito(
                `El insumo químico '${insumoQuimico.nombre}' se dio de ${estaActivo ? "baja" : "alta"} correctamente.`
            );
        } catch (error: any) {
            mostrarAlertaError(
                getErrorMessage(
                    error,
                    `No se pudo ${accion} el insumo químico '${insumoQuimico.nombre}'.`
                )
            );
            console.log(error);
            return; // el modal se cierra igual y no se recarga nada
        }

        await onDeleted();
    };

    return (
        <ConfirmarModal
            show={insumoQuimico !== null}
            title={`${estaActivo ? "Dar de baja" : "Dar de alta"} insumo químico`}
            confirmLabel={estaActivo ? "Dar de baja" : "Dar de alta"}
            loadingLabel={estaActivo ? "Dando de baja..." : "Dando de alta..."}
            variant={estaActivo ? "danger" : "success"}
            onHide={onHide}
            onConfirm={handleCambiarEstado}
        >
            ¿Estás seguro que querés {accion} el insumo químico <strong>{insumoQuimico?.nombre}</strong>?
        </ConfirmarModal>
    );
}