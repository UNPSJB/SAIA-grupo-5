import { MOCK_VENCIMIENTOS } from "../mock/vencimientosPersonal";
import type { VencimientoPersonal } from "../types";

// MOCK TEMPORAL: el endpoint real (GET /vencimientos-personal o similar,
// que devuelve VencimientoPersonal con es_actual=true) es parte de OTRA
// historia de usuario, todavía no implementada en el backend.
//
// Cuando ese endpoint exista, reemplazar el cuerpo de esta función por el
// fetch correspondiente (p. ej. `(await api.get("/vencimientos-personal")).data`),
// manteniendo la misma firma. El hook, el clasificador y la tabla ya le
// piden los datos a esta función y no deberían necesitar cambios.
export async function obtenerVencimientosPersonal(): Promise<VencimientoPersonal[]> {
    await new Promise((resolve) => setTimeout(resolve, 250)); // simula latencia de red
    return MOCK_VENCIMIENTOS;
}
