import { ConfirmarModal } from "../../../components/ConfirmarModal";
import { api } from "../../../libs/axios";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import { getErrorMessage } from "../../../libs/errors";
import type { Persona } from "../types";

interface DeletePersonaModalProps {
    persona: Persona | null;
    onHide: () => void;
    onDeleted: () => void | Promise<unknown>;
}

export function DeletePersonaModal({ persona, onHide, onDeleted }: DeletePersonaModalProps) {
    const personaNombreCompleto = persona
        ? `${persona.nombre} ${persona.apellido || ""}`.trim()
        : "";

    const handleDelete = async () => {
        if (!persona) return;

        try {
            await api.delete(`/personal/${persona.id}`);
            mostrarAlertaExito(`'${personaNombreCompleto}' se dio de baja correctamente.`);
        } catch (error: any) {
            mostrarAlertaError(
                getErrorMessage(error, `No se pudo dar de baja a '${personaNombreCompleto}'.`)
            );
            console.log(error);
            return; // el modal se cierra igual y no se recarga nada
        }

        await onDeleted();
    };

    return (
        <ConfirmarModal
            show={persona !== null}
            title="Dar de baja persona"
            confirmLabel="Dar de baja"
            loadingLabel="Dando de baja..."
            variant="danger"
            onHide={onHide}
            onConfirm={handleDelete}
        >
            ¿Estás seguro que querés dar de baja a <strong>{personaNombreCompleto}</strong>?
        </ConfirmarModal>
    );
}