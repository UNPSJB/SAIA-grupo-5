import { ConfirmarModal } from "../../../components/ConfirmarModal";
import { api } from "../../../libs/axios";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import { getErrorMessage } from "../../../libs/errors";
import type { TipoVencimiento } from "../types";

interface DeleteTipoVencimientoModalProps {
    tipoVencimiento: TipoVencimiento | null;
    onHide: () => void;
    onDeleted: () => void | Promise<unknown>;
}

export function DeleteTipoVencimientoModal({ tipoVencimiento, onHide, onDeleted }: DeleteTipoVencimientoModalProps) {
    const estaActivo = tipoVencimiento?.activo ?? true;
    const accion = estaActivo ? "dar de baja" : "dar de alta";

    const handleCambiarEstado = async () => {
        if (!tipoVencimiento) return;

        try {
            await api.patch<TipoVencimiento>(`/tipos-vencimientos/${tipoVencimiento.id}/estado`);
            mostrarAlertaExito(
                `El tipo vencimiento '${tipoVencimiento.nombre}' se dio de ${estaActivo ? "baja" : "alta"} correctamente.`
            );
        } catch (error: any) {
            mostrarAlertaError(
                getErrorMessage(
                    error,
                    `No se pudo ${accion} el tipo vencimiento '${tipoVencimiento.nombre}'.`
                )
            );
            console.log(error);
            return; // el modal se cierra igual y no se recarga nada
        }

        await onDeleted();
    };

    return (
        <ConfirmarModal
            show={tipoVencimiento !== null}
            title={`${estaActivo ? "Dar de baja" : "Dar de alta"} tipo vencimiento`}
            confirmLabel={estaActivo ? "Dar de baja" : "Dar de alta"}
            loadingLabel={estaActivo ? "Dando de baja..." : "Dando de alta..."}
            variant={estaActivo ? "danger" : "success"}
            onHide={onHide}
            onConfirm={handleCambiarEstado}
        >
            ¿Estás seguro que querés {accion} el tipo vencimiento <strong>{tipoVencimiento?.nombre}</strong>?
        </ConfirmarModal>
    );
}