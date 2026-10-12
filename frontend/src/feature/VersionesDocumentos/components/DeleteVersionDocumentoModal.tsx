import { Button, Modal } from "react-bootstrap";
import { api } from "../../../libs/axios";
import type { VersionDocumento } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

interface DeleteVersionDocumentoModalProps {
    version: VersionDocumento | null;
    onHide: () => void;
    onDeleted: () => void;
}

export function DeleteVersionDocumentoModal({ version, onHide, onDeleted }: DeleteVersionDocumentoModalProps) {
    const handleCambiarEstado = async () => {
        if (!version) return;

        const estabaActivo = version.activo;

        try {
            await api.patch<VersionDocumento>(`/versiones-documentos/${version.id}/estado`);
            mostrarAlertaExito(`La version '${version.version}' se dio de ${estabaActivo ? 'baja' : 'alta'} correctamente.`);
            onDeleted();
        } catch (error: any){
            let mensajeFinal = "No se pudo ${estabaActivo ? 'dar de baja' : 'dar de alta'} la version '${version.version}'."
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

    const estaActivo = version?.activo ?? true;

    return (
        <Modal show={version !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{estaActivo ? 'Dar de baja' : 'Dar de alta'} version</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que querés {estaActivo ? 'dar de baja' : 'dar de alta'} la version <strong>{version?.version}</strong>?
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
