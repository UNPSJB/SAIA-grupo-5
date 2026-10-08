import { Container } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { PlanCalibracionForm } from "../components/PlanCalibracionForm";
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks/useApi";
import type { PlanCalibracion } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import { getErrorMessage } from "../../../libs/errors";
import { PageError } from "../../../components/PageError";
import { PageLoading } from "../../../components/PageLoading";

export function EditarPlanCalibracionPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const { data: planCalibracion, isLoading, error } = useApi<PlanCalibracion>(`/planes-calibracion/${id}`);

    const actualizarPlanCalibracion = async (datos: { equipo_id: number, fecha_inicio: string | null, periodicidad: number }) => {
        try {
            await api.put(`/planes-calibracion/${id}`, {
                periodicidad: datos.periodicidad
            });
            await mutate("/planes-calibracion");
            await mutate(`/planes-calibracion/${id}`);
            mostrarAlertaExito("El plan de calibración se editó correctamente.");
            navigate("/planes-calibracion");
        } catch (error: any) {
            mostrarAlertaError(
                getErrorMessage(error, "No se pudo editar el plan de calibración.")
            );
            console.log(error);
        }
    };

    if (isLoading) return <PageLoading title="Editar Plan de Calibración" />;

    if (error) return <PageError title="Editar Plan de Calibración" message="Ocurrió un error al cargar el Plan de Calibración" />;

    if (!planCalibracion) return <PageError title="Plan de calibración no encontrado" message="El plan de calibración ingresado no existe" />;

    return (
        <>
            <PageHeader title="Editar Plan de Calibración" />

            <Container>
                <PlanCalibracionForm
                    textoBoton="Editar Plan"
                    onSubmit={actualizarPlanCalibracion}
                    editando
                    valoresIniciales={{
                        equipo_id: planCalibracion.equipo_id,
                        fecha_inicio: planCalibracion.fecha_inicio,
                        periodicidad: planCalibracion.periodicidad
                    }}
                />
            </Container>
        </>
    )
}