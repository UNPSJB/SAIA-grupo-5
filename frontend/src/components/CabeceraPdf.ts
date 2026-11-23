
import jsPDF from 'jspdf';
import { api } from '../libs/axios';

export interface DatosPymePdf {
    nombre_pyme: string;
    logo_pyme: string | null;
    telefono_pyme: string | null;
    email_pyme: string | null;
    direccion_pyme: string | null;
}

export const MARGEN_PDF = 14;
export const INICIO_CONTENIDO_PDF = 55;
export const MARGEN_INFERIOR_PDF = 18;

const NOMBRE_PYME_DEFAULT = 'Mi establecimiento';

export function tieneDatosPyme(datos: DatosPymePdf | null): boolean {
    if (!datos) return false;

    const nombre = datos.nombre_pyme.trim();

    return (
        (nombre !== '' && nombre !== NOMBRE_PYME_DEFAULT) ||
        !!datos.logo_pyme ||
        !!datos.telefono_pyme?.trim() ||
        !!datos.email_pyme?.trim() ||
        !!datos.direccion_pyme?.trim()
    );
}

export async function obtenerDatosPymePdf(): Promise<DatosPymePdf | null> {
    try {
        const { data } = await api.get<DatosPymePdf>('/configuracion-sistema/datos-pyme');
        return tieneDatosPyme(data) ? data : null;
    } catch (error) {
        console.warn('No se pudieron obtener los datos de la PyME.', error);
        return null;
    }
}

function dibujarCabeceraPdf(doc: jsPDF, datos: DatosPymePdf) {
    const anchoPagina = doc.internal.pageSize.getWidth();
    const margen = MARGEN_PDF;

    let logoInsertado = false;

    if (datos.logo_pyme) {
        try {
            const imagen = doc.getImageProperties(datos.logo_pyme);
            const escala = Math.min(26 / imagen.width, 26 / imagen.height);
            const ancho = imagen.width * escala;
            const alto = imagen.height * escala;

            doc.addImage(
                datos.logo_pyme,
                imagen.fileType,
                margen + (26 - ancho) / 2,
                10 + (26 - alto) / 2,
                ancho,
                alto
            );

            logoInsertado = true;
        } catch (error) {
            console.warn('No se pudo insertar el logo en el PDF.', error);
        }
    }

    const xTexto = logoInsertado ? margen + 32 : margen;
    const anchoTexto = anchoPagina - xTexto - margen;

    const nombre = datos.nombre_pyme.trim();
    const nombreVisible = nombre === NOMBRE_PYME_DEFAULT ? '' : nombre;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(33, 37, 41);

    const lineasNombre = nombreVisible
        ? (doc.splitTextToSize(nombreVisible, anchoTexto) as string[]).slice(0, 2)
        : [];

    if (lineasNombre.length > 0) {
        doc.text(lineasNombre, xTexto, 15);
    }

    const contacto = [
        datos.direccion_pyme,
        datos.telefono_pyme ? `Tel: ${datos.telefono_pyme}` : null,
        datos.email_pyme,
    ].filter((valor): valor is string => Boolean(valor?.trim()));

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);

    let y = 15 + lineasNombre.length * 5;

    contacto.forEach((dato) => {
        const lineas = doc.splitTextToSize(dato, anchoTexto) as string[];

        lineas.slice(0, 2).forEach((linea) => {
            if (y <= 40) {
                doc.text(linea, xTexto, y);
                y += 4;
            }
        });
    });

    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.3);
    doc.line(margen, 45, anchoPagina - margen, 45);
}

function dibujarPiePdf(doc: jsPDF, pagina: number, total: number) {
    const ancho = doc.internal.pageSize.getWidth();
    const alto = doc.internal.pageSize.getHeight();

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);

    doc.text(
        `Generado el ${new Date().toLocaleDateString('es-AR')}`,
        MARGEN_PDF,
        alto - 8
    );

    doc.text(
        `Página ${pagina} de ${total}`,
        ancho - MARGEN_PDF,
        alto - 8,
        { align: 'right' }
    );
}

export function finalizarPaginasPdf(doc: jsPDF, datos: DatosPymePdf | null) {
    const total = doc.getNumberOfPages();

    for (let pagina = 1; pagina <= total; pagina++) {
        doc.setPage(pagina);

        if (datos && tieneDatosPyme(datos)) {
            dibujarCabeceraPdf(doc, datos);
        }

        dibujarPiePdf(doc, pagina, total);
    }
}
