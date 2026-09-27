import { Button, Modal } from "react-bootstrap";
import { api } from "../../../libs/axios";
import type { TipoElementoLimpieza } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import { getErrorMessage } from "../../../libs/errors";

interface EstadoTipoElementoModalProps {
    tipoElementoLimpieza: TipoElementoLimpieza | null;
    onHide: () => void;
    onDeleted: () => void;
}

export function EstadoTipoElementoModal({ tipoElementoLimpieza, onHide, onDeleted }: EstadoTipoElementoModalProps) {
    const cambiarEstado = async () => {
        if (!tipoElementoLimpieza) return;

        const accion = tipoElementoLimpieza.estado ? "dar de baja" : "dar de alta";

        try {
            await api.patch<TipoElementoLimpieza>(`/elementos-limpieza/tipos/${tipoElementoLimpieza.id}/estado`);
            mostrarAlertaExito(`El tipo de elemento '${tipoElementoLimpieza.nombre}' se ${tipoElementoLimpieza.estado ? "dio de baja" : "dio de alta"} correctamente.`);
            onDeleted();
        } catch (error: any){
            mostrarAlertaError(
                getErrorMessage(
                    error,
                    `No se pudo ${accion} el tipo de elemento '${tipoElementoLimpieza.nombre}'.`
                )
            );
            console.log(error);
        } finally{
            onHide();
        }
    };

    if (!tipoElementoLimpieza) return null;

    const estaActivo = tipoElementoLimpieza.estado;

    return (
        <Modal show={true} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {estaActivo ? "Dar de baja tipo de elemento" : "Dar de alta tipo de elemento"}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que querés {estaActivo ? "dar de baja" : "dar de alta"} el tipo de elemento <strong>{tipoElementoLimpieza.nombre}</strong>?
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