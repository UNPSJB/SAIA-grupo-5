import useSWR from "swr";
import { obtenerVencimientosPersonal } from "../api/vencimientosPersonalApi";
import { ANTELACION_DIAS_DEFAULT, clasificarVencimientos, type VencimientoClasificado } from "../../../libs/vencimientos";

export function useVencimientosPersonal(antelacionDias: number = ANTELACION_DIAS_DEFAULT) {
    const { data, error, isLoading } = useSWR("vencimientos-personal", obtenerVencimientosPersonal);

    const vencimientos: VencimientoClasificado[] = data
        ? clasificarVencimientos(data, antelacionDias)
        : [];

    return { vencimientos, error, isLoading };
}
