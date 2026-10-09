import { api } from "../../../libs/axios";
import { ConfirmarModal } from "../../../components/ConfirmarModal";
import type { Insumo } from "../types";

interface DeleteInsumoModalProps {
    insumo: Insumo | null;
    onHide: () => void;
    onDeleted: () => void | Promise<unknown>;
}

export function DeleteInsumoModal({ insumo, onHide, onDeleted }: DeleteInsumoModalProps) {
    return (
        <ConfirmarModal
            show={insumo !== null}
            title="Eliminar insumo"
            confirmLabel="Eliminar"
            loadingLabel="Eliminando..."
            variant="danger"
            onHide={onHide}
            onConfirm={async () => {
                if (!insumo) return;
                await api.delete(`/insumos/${insumo.id}`);
                await onDeleted();
            }}
        >
            ¿Estás seguro que querés eliminar el insumo <strong>{insumo?.nombre}</strong>?
        </ConfirmarModal>
    );
}