import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { FuenteNutricionalForm } from "../components/FuenteNutricionalForm";
import { api } from "../../../libs/axios";
import type { NewFuenteNutricional } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

export function NuevaFuenteNutricionalPage() {
    const navigate = useNavigate();

    const guardarFuente = async (datos: NewFuenteNutricional) => {
        try {
            await api.post("/fuentes-nutricionales/", datos);
            await mutate("/fuentes-nutricionales/");
            mostrarAlertaExito("La fuente nutricional se creó correctamente.");
            navigate("/fuentes-nutricionales");
        } catch (error: any) {
            let mensajeFinal = "No se pudo crear la fuente nutricional.";
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
            <PageHeader title="Crear nueva Fuente Nutricional" />
            <Container>
                <FuenteNutricionalForm textoBoton="Crear Fuente" onSubmit={guardarFuente} />
            </Container>
        </>
    );
}