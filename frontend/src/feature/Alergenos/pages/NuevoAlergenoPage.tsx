import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { AlergenoForm } from "../components/AlergenoForm";
import { api } from "../../../libs/axios";
import type { NewAlergeno } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

export function NuevoAlergenoPage() {
    const navigate = useNavigate();

    const guardarAlergeno = async (datos: NewAlergeno) => {
        try {
            await api.post("/alergenos/", datos);
            await mutate("/alergenos/");
            mostrarAlertaExito("El alérgeno se creó correctamente.");
            navigate("/alergenos");
        } catch (error: any) {
            let mensajeFinal = "No se pudo crear el alérgeno.";
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
            <PageHeader title="Crear nuevo Alérgeno" />
            <Container>
                <AlergenoForm textoBoton="Crear Alérgeno" onSubmit={guardarAlergeno} />
            </Container>
        </>
    );
}