import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { TipoElementoLimpiezaForm } from "../components/TipoElementoLimpiezaForm";

export function NuevoTipoElementoPage() {
    const navigate = useNavigate();

    return (
        <>
            <PageHeader title="Crear nuevo Tipo de Elemento" />

            <Container>
                <TipoElementoLimpiezaForm
                    onCreado={() => navigate("/tipos-elementos-limpieza")}
                />
            </Container>
        </>
    );
}