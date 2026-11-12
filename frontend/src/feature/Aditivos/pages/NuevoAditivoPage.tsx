import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { mutate } from "swr";
import { isAxiosError } from "axios";
import { PageHeader } from "../../../components/PageHeader";
import { AditivoForm } from "../components/AditivoForm";
import { api } from "../../../libs/axios";
import type { NewAditivo } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

export function NuevoAditivoPage() {
    const navigate = useNavigate();

    const guardarAditivo = async (datos: NewAditivo) => {
        try {
            await api.post("/aditivos/", datos);
            await mutate("/aditivos/");
            mostrarAlertaExito("El aditivo se creó correctamente.");
            navigate("/aditivos");
        } catch (error) {
            let mensajeFinal = "No se pudo crear el aditivo.";
            const detail = isAxiosError(error) ? error.response?.data?.detail : undefined;
            if (detail) {
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        }
    };

    return (
        <>
            <PageHeader title="Crear nuevo Aditivo" />

            <Container>
                <AditivoForm textoBoton="Crear Aditivo" onSubmit={guardarAditivo} />
            </Container>
        </>
    );
}
