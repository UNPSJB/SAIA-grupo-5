import { ConfirmarModal } from "../../../components/ConfirmarModal";
import { api } from "../../../libs/axios";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import { getErrorMessage } from "../../../libs/errors";
import type { ElementoLimpieza } from "../types";

interface EstadoElementoLimpiezaModalProps {
    elementoLimpieza: ElementoLimpieza | null;
    onHide: () => void;
    onDeleted: () => void | Promise<unknown>;
}

export function EstadoElementoLimpiezaModal({ elementoLimpieza, onHide, onDeleted }: EstadoElementoLimpiezaModalProps) {
    const estaActivo = elementoLimpieza?.estado ?? true;
    const accion = estaActivo ? "dar de baja" : "dar de alta";

    const cambiarEstado = async () => {
        if (!elementoLimpieza) return;

        try {
            await api.patch<ElementoLimpieza>(`/elementos-limpieza/${elementoLimpieza.id}/estado`);
            mostrarAlertaExito(
                `El elemento de limpieza '${elementoLimpieza.nombre}' se ${estaActivo ? "dio de baja" : "dio de alta"} correctamente.`
            );
        } catch (error: any) {
            mostrarAlertaError(
                getErrorMessage(
                    error,
                    `No se pudo ${accion} el elemento de limpieza '${elementoLimpieza.nombre}'.`
                )
            );
            console.log(error);
            return; // el modal se cierra igual y no se recarga nada
        }

        await onDeleted();
    };

    return (
        <ConfirmarModal
            show={elementoLimpieza !== null}
            title={`${estaActivo ? "Dar de baja" : "Dar de alta"} elemento de limpieza`}
            confirmLabel={estaActivo ? "Dar de baja" : "Dar de alta"}
            loadingLabel={estaActivo ? "Dando de baja..." : "Dando de alta..."}
            variant={estaActivo ? "danger" : "success"}
            onHide={onHide}
            onConfirm={cambiarEstado}
        >
            ¿Estás seguro que querés {accion} el elemento de limpieza <strong>{elementoLimpieza?.nombre}</strong>?
        </ConfirmarModal>
    );
}