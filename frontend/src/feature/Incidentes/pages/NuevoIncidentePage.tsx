import { Container } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { IncidenteForm } from "../components/IncidenteForm";
import { api } from "../../../libs/axios";
import type { NewIncidente } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

export function NuevoIncidentePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const estadoInicial = (location.state as { lote_produccion_id?: number; lote_proveedor_id?: number; nombre?: string; descripcion?: string } | null) ?? null;

    const guardarIncidente = async (datos: NewIncidente) => {
        try{
            await api.post("/incidentes/", datos);
            await mutate("/incidentes/");
            if (datos.lote_produccion_id) {
                await mutate(`/incidentes?lote_produccion_id=${datos.lote_produccion_id}`);
            }
            if (datos.lote_proveedor_id) {
                await mutate(`/incidentes?lote_proveedor_id=${datos.lote_proveedor_id}`);
            }
            mostrarAlertaExito("El nuevo incidente se creo correctamente.");     
            navigate("/incidentes/");
        } catch (error: any){  
            let mensajeFinal = "No se pudo crear el nuevo incidente.";       
            if (error.response?.data?.detail){    
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        }
    };

    return (
        <>
            <PageHeader title="Crear nuevo Incidente" />

            <Container>
                <IncidenteForm
                    textoBoton="Crear Incidente"
                    onSubmit={guardarIncidente}
                    valoresIniciales={estadoInicial ? {
                        nombre: estadoInicial.nombre || "",
                        descripcion: estadoInicial.descripcion || "",
                        tipo_id: 0,
                        sector_id: null,
                        lote_produccion_id: estadoInicial.lote_produccion_id ?? null,
                        lote_proveedor_id: estadoInicial.lote_proveedor_id ?? null,
                        foto_opcional: null,
                        fecha_abierto: "",
                        fecha_cierre: null,
                    } : undefined}
                />     
            </Container>
        </>
    );
}
