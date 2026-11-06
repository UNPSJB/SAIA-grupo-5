import { Button, Modal } from "react-bootstrap";
import { api } from "../../../libs/axios";
import type { ElementoLimpieza } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import { getErrorMessage } from "../../../libs/errors";

interface EstadoElementoLimpiezaModalProps {
    elementoLimpieza: ElementoLimpieza | null;
    onHide: () => void;
    onDeleted: () => void;
}

export function EstadoElementoLimpiezaModal({ elementoLimpieza, onHide, onDeleted }: EstadoElementoLimpiezaModalProps) {
    const cambiarEstado = async () => {
        if (!elementoLimpieza) return;

        const accion = elementoLimpieza.estado ? "dar de baja" : "dar de alta";
        
        try {
            await api.patch<ElementoLimpieza>(`/elementos-limpieza/${elementoLimpieza.id}/estado`);
            mostrarAlertaExito(`El elemento de limpieza '${elementoLimpieza.nombre}' se ${elementoLimpieza.estado ? "dio de baja" : "dio de alta"} correctamente.`);
            onDeleted();
        } catch (error: any){
            mostrarAlertaError(
                getErrorMessage(
                    error,
                    `No se pudo ${accion} el elemento de limpieza '${elementoLimpieza.nombre}'.`
                )
            );
            console.log(error);
        } finally{
            onHide();
        }
    };

    if (!elementoLimpieza) return null;

    const estaActivo = elementoLimpieza.estado;

    return (
        <Modal show={true} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {estaActivo
                        ? "Dar de baja elemento de limpieza"
                        : "Dar de alta elemento de limpieza"}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que querés {estaActivo ? "Dar de baja elemento de limpieza" : "Dar de alta elemento de limpieza"} el elemento de limpieza <strong>{elementoLimpieza.nombre}</strong>?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                <Button variant={estaActivo ? "danger" : "success"} onClick={cambiarEstado}>
                    {estaActivo ? "Dar de baja" : "Dar de alta"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}