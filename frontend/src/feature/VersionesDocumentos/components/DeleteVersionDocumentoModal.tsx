import { ConfirmarModal } from "../../../components/ConfirmarModal";
import { api } from "../../../libs/axios";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import { getErrorMessage } from "../../../libs/errors";
import type { VersionDocumento } from "../types";

interface DeleteVersionDocumentoModalProps {
    version: VersionDocumento | null;
    onHide: () => void;
    onDeleted: () => void | Promise<unknown>;
}

export function DeleteVersionDocumentoModal({ version, onHide, onDeleted }: DeleteVersionDocumentoModalProps) {
    const estaActivo = version?.activo ?? true;
    const accion = estaActivo ? "dar de baja" : "dar de alta";

    const handleCambiarEstado = async () => {
        if (!version) return;

        try {
            await api.patch<VersionDocumento>(`/versiones-documentos/${version.id}/estado`);
            mostrarAlertaExito(
                `La versión '${version.version}' se dio de ${estaActivo ? "baja" : "alta"} correctamente.`
            );
        } catch (error: any) {
            mostrarAlertaError(
                getErrorMessage(
                    error,
                    `No se pudo ${accion} la versión '${version.version}'.`
                )
            );
            console.log(error);
            return; // el modal se cierra igual y no se recarga nada
        }

        await onDeleted();
    };

    return (
        <ConfirmarModal
            show={version !== null}
            title={`${estaActivo ? "Dar de baja" : "Dar de alta"} versión`}
            confirmLabel={estaActivo ? "Dar de baja" : "Dar de alta"}
            loadingLabel={estaActivo ? "Dando de baja..." : "Dando de alta..."}
            variant={estaActivo ? "danger" : "success"}
            onHide={onHide}
            onConfirm={handleCambiarEstado}
        >
            ¿Estás seguro que querés {accion} la versión <strong>{version?.version}</strong>?
        </ConfirmarModal>
    );
}