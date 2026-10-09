import { ConfirmarModal } from "../../../components/ConfirmarModal";
import { api } from "../../../libs/axios";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import { getErrorMessage } from "../../../libs/errors";
import type { TipoElementoLimpieza } from "../types";

interface EstadoTipoElementoModalProps {
    tipoElementoLimpieza: TipoElementoLimpieza | null;
    onHide: () => void;
    onDeleted: () => void | Promise<unknown>;
}

export function EstadoTipoElementoModal({ tipoElementoLimpieza, onHide, onDeleted }: EstadoTipoElementoModalProps) {
    const estaActivo = tipoElementoLimpieza?.estado ?? true;
    const accion = estaActivo ? "dar de baja" : "dar de alta";

    const cambiarEstado = async () => {
        if (!tipoElementoLimpieza) return;

        try {
            await api.patch<TipoElementoLimpieza>(
                `/elementos-limpieza/tipos/${tipoElementoLimpieza.id}/estado`
            );
            mostrarAlertaExito(
                `El tipo de elemento '${tipoElementoLimpieza.nombre}' se ${estaActivo ? "dio de baja" : "dio de alta"} correctamente.`
            );
        } catch (error: any) {
            mostrarAlertaError(
                getErrorMessage(
                    error,
                    `No se pudo ${accion} el tipo de elemento '${tipoElementoLimpieza.nombre}'.`
                )
            );
            console.log(error);
            return; // el modal se cierra igual y no se recarga nada
        }

        await onDeleted();
    };

    return (
        <ConfirmarModal
            show={tipoElementoLimpieza !== null}
            title={`${estaActivo ? "Dar de baja" : "Dar de alta"} tipo de elemento`}
            confirmLabel={estaActivo ? "Dar de baja" : "Dar de alta"}
            loadingLabel={estaActivo ? "Dando de baja..." : "Dando de alta..."}
            variant={estaActivo ? "danger" : "success"}
            onHide={onHide}
            onConfirm={cambiarEstado}
        >
            ¿Estás seguro que querés {accion} el tipo de elemento <strong>{tipoElementoLimpieza?.nombre}</strong>?
        </ConfirmarModal>
    );
}