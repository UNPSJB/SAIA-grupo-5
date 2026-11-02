export type LoteProduccion = {
    id: number;
    cantidad_producida: int;
    fecha_produccion: string;
    fecha_vencimiento: string;
    activo: boolean;
    producto_id: number;
    producto: { id: number; nombre: string; descripcion: string | null};
};

export interface LoteProduccionHistorial {
    lotes: LoteProduccion[];
    total_producido: number | null;
}