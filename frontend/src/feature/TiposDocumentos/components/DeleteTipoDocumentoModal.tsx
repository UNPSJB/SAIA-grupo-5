import { Button, Modal } from "react-bootstrap";
import { api } from "../../../libs/axios";
import type { TipoDocumento } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

interface DeleteTipoDocumentoModalProps {
    tipoDocumento: TipoDocumento | null;
    onHide: () => void;
    onDeleted: () => void;
}

export function DeleteTipoDocumentoModal({ tipoDocumento, onHide, onDeleted }: DeleteTipoDocumentoModalProps) {
    const handleCambiarEstado = async () => {
        if (!tipoDocumento) return;

        const estabaActivo = tipoDocumento.activo;

        try {
            await api.patch<TipoDocumento>(`/tipos-documentos/${tipoDocumento.id}/estado`);
            mostrarAlertaExito(`El tipo documento '${tipoDocumento.nombre}' se dio de ${estabaActivo ? 'baja' : 'alta'} correctamente.`);
            onDeleted();
        } catch (error: any){
            let mensajeFinal = "No se pudo ${estabaActivo ? 'dar de baja' : 'dar de alta'} el tipo documento '${tipoDocumento.nombre}'."
            if (error.response?.data?.detail){      
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        } finally {
            onHide();
        }
    };

    const estaActivo = tipoDocumento?.activo ?? true;

    return (
        <Modal show={tipoDocumento !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{estaActivo ? 'Dar de baja' : 'Dar de alta'} tipo documento</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que querés {estaActivo ? 'dar de baja' : 'dar de alta'} el tipo documento <strong>{tipoDocumento?.nombre}</strong>?
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
