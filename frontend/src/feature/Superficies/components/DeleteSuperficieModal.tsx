import { ConfirmarModal } from "../../../components/ConfirmarModal";
import { api } from "../../../libs/axios";
import type { Superficie } from "../types";

interface DeleteSuperficieModalProps {
    superficie: Superficie | null;
    onHide: () => void;
    onDeleted: () => void | Promise<unknown>;
}

export function DeleteSuperficieModal({ superficie, onHide, onDeleted }: DeleteSuperficieModalProps) {
    return (
        <ConfirmarModal
            show={superficie !== null}
            title="Eliminar superficie"
            confirmLabel="Eliminar"
            loadingLabel="Eliminando..."
            variant="danger"
            onHide={onHide}
            onConfirm={async () => {
                if (!superficie) return;
                await api.delete(`/superficies/${superficie.id}`);
                await onDeleted();
            }}
        >
            ¿Estás seguro que querés eliminar la superficie <strong>{superficie?.nombre}</strong>?
        </ConfirmarModal>
    );
}