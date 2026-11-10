import type { InsumoReceta, NewEtapaReceta } from "./types";

// Receta de ejemplo con la que arranca el alta
export const PLANTILLA_ETAPAS: NewEtapaReceta[] = [
    {
        nombre: "Recepción de materias primas",
        pasos: [
            { descripcion: "Verificar remitos y facturas de la mercadería recibida" },
            { descripcion: "Controlar la temperatura de recepción de las materias primas" },
            { descripcion: "Inspeccionar el estado de los productos y sus envases" },
        ],
    },
    {
        nombre: "Almacenamiento",
        pasos: [
            { descripcion: "Mantener la materia prima separada del producto terminado" },
            { descripcion: "Controlar la temperatura de almacenamiento" },
        ],
    },
    {
        nombre: "Elaboración / fabricación",
        pasos: [
            { descripcion: "Verificar la higiene de superficies, utensilios y equipos antes de comenzar" },
            { descripcion: "Cumplir las Buenas Prácticas de Manufactura durante la elaboración" },
        ],
    },
    {
        nombre: "Cocción",
        pasos: [
            { descripcion: "Verificar que el alimento alcance una temperatura mínima de 71 °C" },
            { descripcion: "Evitar el contacto entre alimentos crudos y cocidos" },
        ],
    },
    {
        nombre: "Empaque / envasado",
        pasos: [
            { descripcion: "Verificar el estado e higiene de los envases" },
            { descripcion: "Controlar el cierre y rotulado del producto envasado" },
        ],
    },
    {
        nombre: "Transporte / distribución",
        pasos: [
            { descripcion: "Controlar la temperatura del vehículo de transporte" },
            { descripcion: "Verificar las condiciones de carga y descarga" },
        ],
    },
    {
        nombre: "Expendio / servicio",
        pasos: [
            { descripcion: "Controlar la temperatura del producto hasta el expendio o servicio" },
        ],
    },
];

// INSUMOS RECETA MOCK
const GRAMOS = { id: 1, nombre: "g", activo: true };
const MILILITROS = { id: 2, nombre: "ml", activo: true };
const UNIDADES = { id: 3, nombre: "unidad", activo: true };
export const INSUMOS_RECETA_MOCK: InsumoReceta[] = [
    { insumo_id: 1, nombre: "Harina 0000", cantidad: 250, unidad_medida: GRAMOS },
    { insumo_id: 2, nombre: "Azúcar", cantidad: 100, unidad_medida: GRAMOS },
    { insumo_id: 3, nombre: "Manteca", cantidad: 125, unidad_medida: GRAMOS },
    { insumo_id: 4, nombre: "Leche", cantidad: 200, unidad_medida: MILILITROS },
    { insumo_id: 5, nombre: "Huevo", cantidad: 2, unidad_medida: UNIDADES },
    { insumo_id: 6, nombre: "Polvo de hornear", cantidad: 10, unidad_medida: GRAMOS },
];
