import { useState, type ReactNode } from "react";
import { Alert, Button, Modal, Spinner, type ButtonProps } from "react-bootstrap";
import { getErrorMessage } from "../libs/errors";

interface ConfirmarModalProps {
    show: boolean;
    title: string;
    children: ReactNode;
    confirmLabel: string;
    loadingLabel?: string;
    variant?: ButtonProps["variant"];
    onConfirm: () => Promise<unknown>;
    onHide: () => void;
}

export function ConfirmarModal({
    show,
    title,
    children,
    confirmLabel,
    loadingLabel = "Procesando...",
    variant = "primary",
    onConfirm,
    onHide,
}: ConfirmarModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleHide = () => {
        if (!loading) onHide();
    };

    const handleConfirm = async () => {
        if (loading) return;
        setLoading(true);
        setError(null);
        try {
            await onConfirm();
            onHide();
        } catch (e) {
            setError(getErrorMessage(e, "Ocurrió un error. Intentá de nuevo."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            show={show}
            onHide={handleHide}
            onExited={() => setError(null)}
            backdrop={loading ? "static" : true}
            keyboard={!loading}
        >
            <Modal.Header closeButton={!loading}>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {children}
                {error && <Alert variant="danger" className="mt-3 mb-0">{error}</Alert>}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleHide} disabled={loading}>
                    Cancelar
                </Button>
                <Button variant={variant} onClick={handleConfirm} disabled={loading} aria-busy={loading}>
                    {loading && <Spinner as="span" animation="border" size="sm" className="me-2" aria-hidden="true" />}
                    {loading ? loadingLabel : confirmLabel}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}