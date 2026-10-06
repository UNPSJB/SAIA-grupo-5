export interface PlanCalibracion {
    id: number;
    equipo_id: number;
    fecha_inicio: string;
    periodicidad: number;
    estado: boolean;
    proxima_fecha: string | null;
    dias_restantes: number | null;
}

export interface NewPlanCalibracion {
    equipo_id: number;
    fecha_inicio: string | null;
    periodicidad: number;
}

export interface UpdatePlanCalibracion {
    periodicidad: number;
}