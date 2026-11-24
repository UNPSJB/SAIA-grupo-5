import { useState, type RefObject } from "react";
import { Dropdown, Spinner } from "react-bootstrap";
import { exportarGraficoImagen, exportarGraficoPdf } from "../ExportarGrafico";
import { mostrarAlertaError } from "../../../libs/alertas";

interface ExportarGraficoButtonProps {
    contenedorRef: RefObject<HTMLElement | null>;
    titulo: string;
    subtitulo?: string;
    periodo?: string;
    disabled?: boolean;
}

export function ExportarGraficoButton({ contenedorRef, titulo, subtitulo, periodo, disabled = false }: ExportarGraficoButtonProps) {
    const [exportando, setExportando] = useState(false);

    const handleExportar = async (formato: "png" | "pdf") => {
        if (!contenedorRef.current) return;
        setExportando(true);
        try {
            const opciones = {contenedor: contenedorRef.current, titulo, subtitulo, periodo};
            if (formato === "png") {
                await exportarGraficoImagen(opciones);
            } else {
                await exportarGraficoPdf(opciones);
            }
        } catch (error) {
            console.error(error);
            mostrarAlertaError("No se pudo exportar el gráfico.");
        } finally {
            setExportando(false);
        }
    };

    return (
        <Dropdown align="end">
            <Dropdown.Toggle
                variant="outline-secondary"
                size="sm"
                disabled={disabled || exportando}
                aria-label={`Exportar ${titulo}`}
            >
                {exportando ? (
                    <Spinner animation="border" size="sm" />
                ) : (
                    <> <i className="bi bi-download me-1" /> Exportar </>
                )}
            </Dropdown.Toggle>

            <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleExportar("png")}>
                    <i className="bi bi-file-earmark-image me-2 text-primary" /> Imagen (PNG)
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleExportar("pdf")}>
                    <i className="bi bi-file-earmark-pdf me-2 text-danger" /> Documento (PDF)
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
}