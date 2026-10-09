import { ConfirmarModal } from "../../../components/ConfirmarModal";
import { api } from "../../../libs/axios";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import { getErrorMessage } from "../../../libs/errors";
import type { TipoDocumento } from "../types";

interface DeleteTipoDocumentoModalProps {
    tipoDocumento: TipoDocumento | null;
    onHide: () => void;
    onDeleted: () => void | Promise<unknown>;
}

export function DeleteTipoDocumentoModal({ tipoDocumento, onHide, onDeleted }: DeleteTipoDocumentoModalProps) {
    const estaActivo = tipoDocumento?.activo ?? true;
    const accion = estaActivo ? "dar de baja" : "dar de alta";

    const handleCambiarEstado = async () => {
        if (!tipoDocumento) return;

        try {
            await api.patch<TipoDocumento>(`/tipos-documentos/${tipoDocumento.id}/estado`);
            mostrarAlertaExito(
                `El tipo documento '${tipoDocumento.nombre}' se dio de ${estaActivo ? "baja" : "alta"} correctamente.`
            );
        } catch (error: any) {
            mostrarAlertaError(
                getErrorMessage(
                    error,
                    `No se pudo ${accion} el tipo documento '${tipoDocumento.nombre}'.`
                )
            );
            console.log(error);
            return; // el modal se cierra igual y no se recarga nada
        }

        await onDeleted();
    };

    return (
        <ConfirmarModal
            show={tipoDocumento !== null}
            title={`${estaActivo ? "Dar de baja" : "Dar de alta"} tipo documento`}
            confirmLabel={estaActivo ? "Dar de baja" : "Dar de alta"}
            loadingLabel={estaActivo ? "Dando de baja..." : "Dando de alta..."}
            variant={estaActivo ? "danger" : "success"}
            onHide={onHide}
            onConfirm={handleCambiarEstado}
        >
            ¿Estás seguro que querés {accion} el tipo documento <strong>{tipoDocumento?.nombre}</strong>?
        </ConfirmarModal>
    );
}