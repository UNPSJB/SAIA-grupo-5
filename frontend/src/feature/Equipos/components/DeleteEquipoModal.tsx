import { ConfirmarModal } from "../../../components/ConfirmarModal";
import { api } from "../../../libs/axios";
import type { Equipo } from "../types";

interface DeleteEquipoModalProps {
    equipo: Equipo | null;
    onHide: () => void;
    onDeleted: () => void | Promise<unknown>;
}

export function DeleteEquipoModal({ equipo, onHide, onDeleted }: DeleteEquipoModalProps) {
    return (
        <ConfirmarModal
            show={equipo !== null}
            title="Eliminar equipo"
            confirmLabel="Eliminar"
            loadingLabel="Eliminando..."
            variant="danger"
            onHide={onHide}
            onConfirm={async () => {
                if (!equipo) return;
                await api.delete(`/equipos/${equipo.id}`);
                await onDeleted();
            }}
        >
            ¿Estás seguro que querés eliminar el equipo <strong>{equipo?.nombre}</strong>?
        </ConfirmarModal>
    );
}