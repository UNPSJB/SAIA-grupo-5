import { api } from "../../../libs/axios";
import type { InsumoLote, InsumoLoteCreate } from "../types";

export const getTodosLosInsumosLote = async (): Promise<InsumoLote[]> => {
    const response = await api.get<InsumoLote[]>("/insumos-lote/");
    return response.data;
};

export const getInsumosPorLoteProveedor = async (loteProveedorId: number): Promise<InsumoLote[]> => {
    const response = await api.get<InsumoLote[]>(`/insumos-lote/lote/${loteProveedorId}`);
    return response.data;
};

export const postInsumoLote = async (loteProveedorId: number, datos: InsumoLoteCreate): Promise<InsumoLote> => {
    const response = await api.post<InsumoLote>(`/insumos-lote/lote/${loteProveedorId}`, datos);
    return response.data;
};

export const cambiarEstadoInsumoLote = async (insumoLoteId: number): Promise<InsumoLote> => {
    const response = await api.patch<InsumoLote>(`/insumos-lote/${insumoLoteId}/estado`);
    return response.data;
};

export const deleteInsumoLote = async (insumoLoteId: number): Promise<void> => {
    await api.delete(`/insumos-lote/${insumoLoteId}`);
};