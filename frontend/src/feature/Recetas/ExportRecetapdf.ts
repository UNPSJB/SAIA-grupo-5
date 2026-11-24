import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { mostrarAlertaError } from '../../libs/alertas';
import {finalizarPaginasPdf, INICIO_CONTENIDO_PDF, MARGEN_INFERIOR_PDF, MARGEN_PDF, obtenerDatosPymePdf,} from '../../components/CabeceraPdf';
import type { UnidadMedida } from '../UnidadMedida/types';
import type { Receta } from './types';
import { calcularComposicionPorcentual, DECIMALES_COMPOSICION } from './composicion/composicionPorcentual';

const formatearFecha = (fecha: string | null) =>
    fecha ? new Date(fecha).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }) : '-';

const formatearPorcentaje = (p: number) =>
    `${p.toLocaleString('es-AR', { maximumFractionDigits: DECIMALES_COMPOSICION })}%`;

interface Opciones {
    producto: string;
    receta: Receta;
    unidades?: UnidadMedida[];
    mostrarComposicion?: boolean;
}

export async function exportarRecetaPdf({ producto, receta, unidades, mostrarComposicion = false }: Opciones) {
    try {
        const datosPyme = await obtenerDatosPymePdf();
        const mostrarCabecera = datosPyme !== null;

        const doc = new jsPDF();
        const margin = MARGEN_PDF;
        const ancho = doc.internal.pageSize.width - margin * 2;
        const alto = doc.internal.pageSize.height;

        const inicioPagina = mostrarCabecera ? INICIO_CONTENIDO_PDF : 20;
        let y = mostrarCabecera ? INICIO_CONTENIDO_PDF + 5 : 18;

        const finalY = () =>
            (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

        const nuevaPagina = () => {
            doc.addPage();
            y = inicioPagina;
        };

        const asegurarEspacio = (espacio = 20) => {
            if (y + espacio > alto - MARGEN_INFERIOR_PDF) {
                nuevaPagina();
            }
        };

        const escribir = (
            texto: string,
            opts: { tam?: number; color?: number; negrita?: boolean } = {}
        ) => {
            const { tam = 10, color = 60, negrita = false } = opts;

            doc.setFont('helvetica', negrita ? 'bold' : 'normal');
            doc.setFontSize(tam);
            doc.setTextColor(color);

            (doc.splitTextToSize(texto, ancho) as string[]).forEach((linea) => {
                asegurarEspacio(tam * 0.45 + 2);
                doc.text(linea, margin, y);
                y += tam * 0.45;
            });

            y += 1.5;
        };

        const titulo = (texto: string) => {
            asegurarEspacio(15);
            y += 4;
            escribir(texto, { tam: 12, color: 0, negrita: true });
        };

        const margenesTabla = {
            top: mostrarCabecera ? INICIO_CONTENIDO_PDF : 20,
            bottom: MARGEN_INFERIOR_PDF,
            left: MARGEN_PDF,
            right: MARGEN_PDF,
        };

        escribir(`Receta: ${producto}`, { tam: 18, color: 0, negrita: true });
        y += 2;

        escribir(
            receta.vigente
                ? `Versión ${receta.version} (vigente) - Vigente desde ${formatearFecha(receta.fecha_desde_vigencia ?? receta.fecha_creacion)}`
                : `Versión ${receta.version} (anterior, solo lectura) - Vigente del ${formatearFecha(receta.fecha_desde_vigencia)} al ${formatearFecha(receta.fecha_hasta_vigencia)}`,
        );

        escribir(
            `Porción o unidad de venta: ${receta.porcion !== null
                ? `${receta.porcion} ${receta.porcion_unidad_medida?.nombre ?? ''}`.trim()
                : 'Sin indicar'}`
        );

        titulo('Ingredientes y composición');

        const composicion = mostrarComposicion && unidades
            ? calcularComposicionPorcentual(
                receta.insumos.map((item) => ({
                    insumoId: item.insumo_id,
                    nombre: item.nombre,
                    tipo: item.tipo,
                    cantidad: item.cantidad,
                    unidadMedida: item.unidad_medida,
                })),
                unidades,
            )
            : null;

        const porcentajes = new Map(
            composicion?.items.map((item) => [item.insumoId, item.porcentaje])
        );

        const ordenados = [
            ...receta.insumos.filter((i) => i.tipo === 'Ingrediente'),
            ...receta.insumos.filter((i) => i.tipo === 'Aditivo'),
        ];

        if (ordenados.length === 0) {
            escribir('La receta no tiene insumos cargados.');
        } else {
            asegurarEspacio(25);

            autoTable(doc, {
                startY: y,
                margin: margenesTabla,
                head: [['Nombre', 'Tipo', 'Cantidad', 'Unidad', ...(composicion ? ['Porcentaje'] : [])]],
                body: ordenados.map((r) => {
                    const ad = r.tipo === 'Aditivo' ? r.aditivo : null;

                    const nombre = ad
                        ? `${ad.nombre}\n${ad.clase_funcional} · INS ${ad.numero_ins ?? 'sin número'} · Insumo: ${r.nombre}`
                        : r.nombre;

                    const porcentaje = porcentajes.get(r.insumo_id);

                    return [
                        nombre,
                        r.tipo,
                        r.cantidad.toLocaleString('es-AR'),
                        r.unidad_medida.nombre,
                        ...(composicion
                            ? [porcentaje !== undefined ? formatearPorcentaje(porcentaje) : '-']
                            : []),
                    ];
                }),
                foot: composicion && composicion.items.length > 0
                    ? [['Total', '', '', '', formatearPorcentaje(composicion.sumaPorcentajes)]]
                    : undefined,
                styles: { fontSize: 9, cellPadding: 2.5 },
                headStyles: { fillColor: [33, 37, 41] },
                footStyles: { fillColor: [240, 240, 240], textColor: 0 },
                columnStyles: { 2: { halign: 'right' }, 4: { halign: 'right' } },
            });

            y = finalY() + 4;

            if (composicion && composicion.excluidos.length > 0) {
                escribir(
                    'Fuera del cálculo de composición: ' +
                    composicion.excluidos.map((e) => `${e.nombre} (${e.motivo})`).join('; '),
                    { tam: 8, color: 120 },
                );
            }
        }

        titulo('Etapas y pasos');

        receta.etapas.forEach((etapa) => {
            asegurarEspacio(25);

            autoTable(doc, {
                startY: y,
                margin: margenesTabla,
                head: [[{ content: `${etapa.orden}. ${etapa.nombre}`, colSpan: 2 }]],
                body: etapa.pasos.map((p) => [`${p.orden}.`, p.descripcion]),
                styles: { fontSize: 9.5, cellPadding: 2.5 },
                headStyles: { fillColor: [33, 37, 41] },
                columnStyles: { 0: { cellWidth: 12 } },
            });

            y = finalY() + 5;
        });

        finalizarPaginasPdf(doc, datosPyme);

        const nombreSeguro = producto
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w-]+/g, '_');

        doc.save(`receta_${nombreSeguro}_v${receta.version}.pdf`);
    } catch (error) {
        console.error(error);
        mostrarAlertaError('No se pudo generar el PDF de la receta.');
    }
}