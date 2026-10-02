// Mock temporal: el endpoint real (GET que lista VencimientoPersonal con
// es_actual=true) es parte de OTRA historia que todavía no está
// implementada en el backend. Esto son solo datos de prueba que respetan
// el contrato de schemas.VencimientoPersonal (ver Personal/types.ts) para
// poder construir y probar esta historia sin esperar al backend.
//
// Quien consume estos datos es api/vencimientosPersonalApi.ts, no el resto
// del feature directamente: cuando el endpoint real exista, el cambio es
// reemplazar el cuerpo de esa única función por el fetch correspondiente.

import type { VencimientoPersonal } from "../types";

const HOY = new Date();

function fechaRelativa(diasDesdeHoy: number): string {
  const d = new Date(HOY);
  d.setDate(d.getDate() + diasDesdeHoy);
  return d.toISOString().slice(0, 10);
}

export const MOCK_VENCIMIENTOS: VencimientoPersonal[] = [
  {
    id: 1,
    persona_id: 10,
    persona: { id: 10, nombre: "María Luna" },
    tipo_vencimiento_id: 1,
    tipo_vencimiento: { id: 1, nombre: "Carnet de manipulador de alimentos" },
    fecha_desde: fechaRelativa(-365),
    fecha_hasta: fechaRelativa(10), // próximo a vencer, dentro de los 15 días
    observacion: null,
  },
  {
    id: 2,
    persona_id: 11,
    persona: { id: 11, nombre: "Carlos Díaz" },
    tipo_vencimiento_id: 2,
    tipo_vencimiento: { id: 2, nombre: "Apto médico" },
    fecha_desde: fechaRelativa(-400),
    fecha_hasta: fechaRelativa(-5), // ya vencido
    observacion: null,
  },
  {
    id: 3,
    persona_id: 12,
    persona: { id: 12, nombre: "Lucía Fernández" },
    tipo_vencimiento_id: 1,
    tipo_vencimiento: { id: 1, nombre: "Carnet de manipulador de alimentos" },
    fecha_desde: fechaRelativa(-100),
    fecha_hasta: fechaRelativa(90), // lejos — no debería aparecer en la alerta
    observacion: null,
  },
];
