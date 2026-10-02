import useSWR from "swr";
import { obtenerVencimientosPersonal } from "../api/vencimientosPersonalApi";
import { useApi } from "../../../hooks/useApi";
import { ANTELACION_DIAS_DEFAULT, clasificarVencimientos, type VencimientoClasificado } from "../../../libs/vencimientos";
import type { ConfiguracionSistema } from "../../ConfiguracionSistema/types";

export function useVencimientosPersonal() {
    const { data, error, isLoading } = useSWR("vencimientos-personal", obtenerVencimientosPersonal);
    const { data: configuracion } = useApi<ConfiguracionSistema>("/configuracion-sistema/");

    const antelacionDias = configuracion?.dias_antelacion_vencimiento ?? ANTELACION_DIAS_DEFAULT;

    const vencimientos: VencimientoClasificado[] = data
        ? clasificarVencimientos(data, antelacionDias)
        : [];

    return { vencimientos, error, isLoading };
}
