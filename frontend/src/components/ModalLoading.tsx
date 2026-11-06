import { Spinner } from "react-bootstrap";

export function ModalLoading() {
    return (
        <div className="text-center p-4">
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
            </Spinner>
        </div>
    );
}
