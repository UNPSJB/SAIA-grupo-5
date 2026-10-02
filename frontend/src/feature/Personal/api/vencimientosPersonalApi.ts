import { api } from "../../../libs/axios";
import type { VencimientoPersonal } from "../../VencimientoPersonal/types";

// GET /vencimiento-personal/ ya devuelve solo los vencimientos vigentes
// (es_actual=true), ordenados por fecha_hasta ascendente.
export async function obtenerVencimientosPersonal(): Promise<VencimientoPersonal[]> {
    const { data } = await api.get<VencimientoPersonal[]>("/vencimiento-personal/");
    return data;
}
