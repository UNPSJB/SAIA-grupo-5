import { ConfirmarModal } from "../../../components/ConfirmarModal";
import { api } from "../../../libs/axios";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import type { ConsumoProducto } from "../types";

interface DeleteConsumoProductoModalProps {
    consumoProducto: ConsumoProducto | null;
    onHide: () => void;
    onDeleted: () => void | Promise<unknown>;
}

export function DeleteConsumoProductoModal({ consumoProducto, onHide, onDeleted }: DeleteConsumoProductoModalProps) {
    const estaActivo = consumoProducto?.estado ?? true;
    const accion = estaActivo ? "dar de baja" : "dar de alta";

    const handleCambiarEstado = async () => {
        if (!consumoProducto) return;

        const nombre = consumoProducto.insumo.nombre;

        try {
            await api.patch<ConsumoProducto>(`/consumos-productos/${consumoProducto.id}/estado`);
            mostrarAlertaExito(`El consumo de '${nombre}' se dio de ${estaActivo ? "baja" : "alta"} correctamente.`);
        } catch (error: any) {
            mostrarAlertaError(
                error.response?.data?.detail || `No se pudo ${accion} el consumo de '${nombre}'.`
            );
            console.log(error);
            return; // el modal se cierra igual y no se recarga nada
        }

        await onDeleted();
    };

    return (
        <ConfirmarModal
            show={consumoProducto !== null}
            title={`${estaActivo ? "Dar de baja" : "Dar de alta"} consumo`}
            confirmLabel={estaActivo ? "Dar de baja" : "Dar de alta"}
            loadingLabel={estaActivo ? "Dando de baja..." : "Dando de alta..."}
            variant={estaActivo ? "danger" : "success"}
            onHide={onHide}
            onConfirm={handleCambiarEstado}
        >
            ¿Estás seguro que querés {accion} el consumo <strong>{consumoProducto?.insumo.nombre}</strong>?
        </ConfirmarModal>
    );
}