import { api } from '../../libs/axios';
import type { IncidenteSeguimiento, IncidentesAbiertosPorTipo } from './types';

export async function listarIncidentes(estado?: 'abierto' | 'cerrado', orden: 'asc' | 'desc' = 'desc') {
    const params = new URLSearchParams({ orden });
    if (estado) params.set('estado', estado);
    const response = await api.get<IncidenteSeguimiento[]>(`/incidentes?${params.toString()}`);
    return response.data;
}

export async function listarIncidentesAbiertos() {
    return listarIncidentes('abierto', 'asc');
}

export async function contarIncidentesAbiertosPorTipo() {
    const response = await api.get<IncidentesAbiertosPorTipo[]>('/incidentes/abiertos/por-tipo');
    return response.data;
}
