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

export interface RegistroCalibracion {
    id: number;
    plan_calibracion_id: number;
    fecha: string;
    observacion?: string | null;
    certificado?: string | null;
}

export interface NewRegistroCalibracion {
    fecha: string;
    observacion?: string | null;
    certificado?: string | null;
}