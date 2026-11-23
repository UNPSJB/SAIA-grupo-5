export function toDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function dateFromKey(key: string) {
    return new Date(`${key}T00:00:00`);
}

const MS_POR_DIA = 1000 * 60 * 60 * 24;

// Días entre hoy y una fecha "YYYY-MM-DD" (negativo si ya pasó). Se calcula en hora local.
export function calcularDiasRestantes(fecha: string): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const [anio, mes, dia] = fecha.slice(0, 10).split('-').map(Number);
    const vencimiento = new Date(anio, mes - 1, dia);
    return Math.round((vencimiento.getTime() - hoy.getTime()) / MS_POR_DIA);
}
