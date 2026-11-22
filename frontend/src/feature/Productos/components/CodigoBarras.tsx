import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface CodigoBarrasProps {
    codigo: string;
    altura?: number;
    anchoBarra?: number;
}

export function CodigoBarras({ codigo, altura = 80, anchoBarra = 2 }: CodigoBarrasProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current) return;

        try {
            JsBarcode(svgRef.current, codigo, {
                format: "EAN13",
                displayValue: true,
                width: anchoBarra,
                height: altura,
                margin: 6,
                fontSize: Math.max(8, Math.round(altura / 3)),
            });
        } catch {
            // Un código inválido o incompleto deja el SVG vacío en lugar de romper el rótulo.
            svgRef.current.innerHTML = "";
        }
    }, [codigo, altura, anchoBarra]);

    return <svg 
        ref={svgRef} 
        role="img" 
        aria-label={`Código de barras EAN-13: ${codigo}`} 
        style={{ maxWidth: "100%", height: "auto" }} 
    />;
}
