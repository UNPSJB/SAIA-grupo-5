import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { ProveedorForm } from "../components/ProveedorForm";
import { api } from "../../../libs/axios";
import type { NewProveedor } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

export function NuevoProveedorPage() {
    const navigate = useNavigate();

    const guardarProveedor = async (datos: NewProveedor) => {
        try {
            await api.post("/proveedores/", datos);
            await mutate("/proveedores/");
            mostrarAlertaExito("El proveedor se creo correctamente.");
            navigate("/proveedores");
        } catch (error: any) {
            let mensajeFinal = "No se pudo crear el proveedor.";
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        }
    };

    return (
        <>
            <PageHeader title="Crear nuevo Proveedor" />
            <Container>
                <ProveedorForm textoBoton="Crear Proveedor" onSubmit={guardarProveedor} />
            </Container>
        </>
    );
}