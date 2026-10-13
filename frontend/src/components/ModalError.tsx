import { Alert } from "react-bootstrap";

interface ModalErrorProps {
    message: string;
}

export function ModalError({ message }: ModalErrorProps) {
    return (
        <Alert variant="danger" className="mb-0">
            {message}
        </Alert>
    );
}
