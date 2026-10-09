import { ConfirmarModal } from "../../../components/ConfirmarModal";
import { api } from "../../../libs/axios";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import type { Documento } from "../types";

interface DeleteDocumentoModalProps {
    documento: Documento | null;
    onHide: () => void;
    onDeleted: () => void | Promise<unknown>;
}

export function DeleteDocumentoModal({ documento, onHide, onDeleted }: DeleteDocumentoModalProps) {
    const estaActivo = documento?.activo ?? true;
    const accion = estaActivo ? "dar de baja" : "dar de alta";

    const handleCambiarEstado = async () => {
        if (!documento) return;

        try {
            await api.patch<Documento>(`/documentos/${documento.id}/estado`);
            mostrarAlertaExito(
                `El documento '${documento.nombre}' se dio de ${estaActivo ? "baja" : "alta"} correctamente.`
            );
        } catch (error: any) {
            let mensajeFinal = `No se pudo ${accion} el documento '${documento.nombre}'.`;
            const detail = error.response?.data?.detail;
            if (detail) {
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
            return; // el modal se cierra igual y no se recarga nada
        }

        await onDeleted();
    };

    return (
        <ConfirmarModal
            show={documento !== null}
            title={`${estaActivo ? "Dar de baja" : "Dar de alta"} documento`}
            confirmLabel={estaActivo ? "Dar de baja" : "Dar de alta"}
            loadingLabel={estaActivo ? "Dando de baja..." : "Dando de alta..."}
            variant={estaActivo ? "danger" : "success"}
            onHide={onHide}
            onConfirm={handleCambiarEstado}
        >
            ¿Estás seguro que querés {accion} el documento <strong>{documento?.nombre}</strong>?
        </ConfirmarModal>
    );
}