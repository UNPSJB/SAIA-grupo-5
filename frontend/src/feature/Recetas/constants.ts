import type { NewEtapaReceta } from "./types";

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
