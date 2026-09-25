import { Container } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { mutate } from "swr";

import { PageHeader } from "../../../components/PageHeader";
import { RecambioElementoLimpiezaForm } from "../components/RecambioElementoLimpiezaForm";
import { api } from "../../../libs/axios";
import type { NewRecambioElementoLimpieza } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

export function NuevoRecambioElementoLimpiezaPage() {
    const navigate = useNavigate();
    const { elementoId } = useParams();

    const guardarRecambio = async (idElemento: number, datos: NewRecambioElementoLimpieza) => {
        try {
            await api.post(`/recambios-elementos-limpieza/elemento/${idElemento}`, datos);

            await mutate("/recambios-elementos-limpieza");
            await mutate(`/recambios-elementos-limpieza/elemento/${idElemento}`);
            await mutate(`/elementos-limpieza/${idElemento}`);
            await mutate("/elementos-limpieza");

            mostrarAlertaExito("El recambio se registró correctamente.");

            navigate(elementoId ? `/elementos-limpieza/${idElemento}` : "/recambios-elementos-limpieza");
        } catch (error: any) {
            let mensaje = "No se pudo registrar el recambio.";

            if (error.response?.data?.detail) {
                if (Array.isArray(error.response.data.detail)) {
                    mensaje = error.response.data.detail[0].msg;
                } else {
                    mensaje = error.response.data.detail;
                }
            }

            mostrarAlertaError(mensaje);
            console.log(error);
        }
    };

    return (
        <>
            <PageHeader title="Registrar Recambio" />

            <Container>
                <RecambioElementoLimpiezaForm
                    elementoId={elementoId ? Number(elementoId) : undefined}
                    onSubmit={guardarRecambio}
                />
            </Container>
        </>
    );
}