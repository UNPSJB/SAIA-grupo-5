import { Button, Modal, Form, Alert } from "react-bootstrap";
import { api } from "../../../libs/axios";
import { useState } from "react";
import type { ConsumoProducto } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

interface DeleteConsumoProductoModalProps {
    consumoProducto: ConsumoProducto | null;
    onHide: () => void;
    onDeleted: () => void;
}

export function DeleteConsumoProductoModal({ consumoProducto, onHide, onDeleted }: DeleteConsumoProductoModalProps) {
    const handleCambiarEstado = async () => {
        if (!consumoProducto) return;

        const estabaActivo = consumoProducto.estado;

        try {
            await api.patch<ConsumoProducto>(`/consumos-productos/${consumoProducto.id}/estado`);
            mostrarAlertaExito(`El consumo de '${consumoProducto.insumo.nombre}' se dio de ${estabaActivo ? 'baja' : 'alta'} correctamente.`);
            onDeleted();
        } catch (error: any){
            const mensajeBackend = error.response?.data?.detail;
            const mensajeFinal = mensajeBackend || `No se pudo ${estabaActivo ? 'dar de baja' : 'dar de alta'} el consumo de '${consumoProducto.insumo.nombre}'.`;
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        } finally{
            onHide();
        }
    };

    const estaActivo = consumoProducto?.estado ?? true;

    return (
        <Modal show={consumoProducto !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{estaActivo ? 'Dar de baja' : 'Dar de alta'} consumo</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que querés {estaActivo ? 'dar de baja' : 'dar de alta'} el consumo <strong>{consumoProducto?.insumo.nombre}</strong>?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                <Button variant={estaActivo ? "danger" : "success"} onClick={handleCambiarEstado}>
                    {estaActivo ? 'Dar de baja' : 'Dar de alta'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
