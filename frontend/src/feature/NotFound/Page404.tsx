import { Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";

export function Page404() {
    const navigate = useNavigate();

    return (
        <div className="pt-4">
            <PageHeader title="Página no encontrada" />

            <Container className="text-center">
                <p className="lead">
                    La página que buscás no existe o fue movida.
                </p>
                <Button variant="primary" onClick={() => navigate("/")}>
                    Volver al inicio
                </Button>
            </Container>
        </div>
    );
}
