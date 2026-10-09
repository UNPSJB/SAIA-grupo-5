import { ConfirmarModal } from "../../../components/ConfirmarModal";
import { api } from "../../../libs/axios";
import type { Sector } from "../types";

interface DeleteSectorModalProps {
    sector: Sector | null;
    onHide: () => void;
    onDeleted: () => void | Promise<unknown>;
}

export function DeleteSectorModal({ sector, onHide, onDeleted }: DeleteSectorModalProps) {
    return (
        <ConfirmarModal
            show={sector !== null}
            title="Eliminar sector"
            confirmLabel="Eliminar"
            loadingLabel="Eliminando..."
            variant="danger"
            onHide={onHide}
            onConfirm={async () => {
                if (!sector) return;
                await api.delete(`/sectores/${sector.id}`);
                await onDeleted();
            }}
        >
            ¿Estás seguro que querés eliminar el sector <strong>{sector?.nombre}</strong>?
        </ConfirmarModal>
    );
}