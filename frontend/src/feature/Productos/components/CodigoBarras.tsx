import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface CodigoBarrasProps {
    codigo: string;
}

export function CodigoBarras({ codigo }: CodigoBarrasProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current) return;

        JsBarcode(svgRef.current, codigo, {
            format: "EAN13",
            displayValue: true,
            width: 2,
            height: 80,
            margin: 10,
            fontSize: 16,
        });
    }, [codigo]);

    return <svg 
        ref={svgRef} 
        role="img" 
        aria-label={`Código de barras EAN-13: ${codigo}`} 
        style={{ maxWidth: "100%", height: "auto" }} 
    />;
}
