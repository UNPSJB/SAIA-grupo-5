import { Button, Modal } from "react-bootstrap";
import { api } from "../../../libs/axios";
import type { VersionDocumento } from "../types";

interface MarcarVigenteModalProps {
    version: VersionDocumento | null;
    versionVigenteActual?: VersionDocumento | null;
    onHide: () => void;
    onMarked: () => void;
}

export function MarcarVigenteModal({ version, versionVigenteActual, onHide, onMarked }: MarcarVigenteModalProps) {
    const handleMarcar = async () => {
        if (!version) return;
        await api.post(`/versiones-documentos/documento/${version.documento_id}/version/${version.id}/vigencia`);        onMarked();
        onHide();
    };

    return (
        <Modal show={version !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Marcar versión como vigente</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Estás seguro que querés marcar la versión <strong>{version?.version}</strong> como vigente?
                {versionVigenteActual && (
                    <p className="mt-2 mb-0">
                        La versión <strong>{versionVigenteActual.version}</strong> dejará de estar vigente.
                    </p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                <Button variant="primary" onClick={handleMarcar}>Marcar como vigente</Button>
            </Modal.Footer>
        </Modal>
    );
}