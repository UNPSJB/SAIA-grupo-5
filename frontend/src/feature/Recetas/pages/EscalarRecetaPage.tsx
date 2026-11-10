import { useState } from "react";
import { Alert, Button, Card, Container } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { PageLoading } from "../../../components/PageLoading";
import { useApi } from "../../../hooks/useApi";
import type { Producto } from "../../Productos/types";
import { INSUMOS_RECETA_MOCK } from "../constants";
import type { Receta } from "../types";
import "./EscalarRecetaPage.css";

// Muestra hasta 2 decimales sin ceros de más (83.333 -> 83.33, 2.00 -> 2)
function formatearCantidad(valor: number): string {
    return String(Math.round(valor * 100) / 100);
}

export function EscalarRecetaPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const { data: producto, isLoading: cargandoProducto } = useApi<Producto>(`/productos/${id}`);
    const { data: receta, isLoading: cargandoReceta, error } = useApi<Receta>(`/recetas/producto/${id}`);

    // Factor por el que se multiplican todas las cantidades de la receta
    const [factor, setFactor] = useState(1);
    // Texto que el usuario está escribiendo en un campo, para no reformatearlo mientras tipea
    const [edicion, setEdicion] = useState<{ insumoId: number; texto: string } | null>(null);

    const tituloPagina = "Escalar Receta";

    if (cargandoProducto || cargandoReceta) return <PageLoading title={tituloPagina} />;

    if (error || !receta) return (
        <Container>
            <PageHeader title={tituloPagina} />
            <Alert variant="danger" className="text-center shadow-sm">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                No se pudo cargar la receta.
            </Alert>
        </Container>
    );

    // TODO: quitar el mock cuando el backend devuelva receta.insumos
    const insumos = receta.insumos ?? INSUMOS_RECETA_MOCK;

    const cambiarCantidad = (insumoId: number, cantidadOriginal: number, texto: string) => {
        setEdicion({ insumoId, texto });
        const valor = Number(texto.replace(",", "."));
        if (texto.trim() !== "" && Number.isFinite(valor) && valor > 0) {
            setFactor(valor / cantidadOriginal);
        }
    };

    return (
        <Container className="escalar-receta">
            <PageHeader title={tituloPagina} />

            <Card className="shadow-sm border-0 rounded-3">
                <Card.Header className="bg-white d-flex justify-content-between align-items-center gap-2">
                    <span className="fw-semibold text-truncate">{producto?.nombre}</span>
                    <span className="badge text-bg-light border">x{formatearCantidad(factor)}</span>
                </Card.Header>

                <Card.Body className="p-2 p-sm-3">
                    <div className="escalar-fila escalar-encabezado">
                        <span />
                        <span>Insumo</span>
                        <span className="text-end">Original</span>
                        <span />
                        <span className="escalar-columna text-center">Escalado</span>
                    </div>

                    {insumos.map((insumo, indice) => (
                        <div key={insumo.insumo_id} className="escalar-fila">
                            <span className="text-muted">{indice + 1}</span>
                            <span className="escalar-nombre">
                                <span className="text-truncate">{insumo.nombre}</span>
                                <span className="escalar-puntos" aria-hidden="true" />
                            </span>
                            <span className="text-end">{formatearCantidad(insumo.cantidad)}</span>
                            <span className="text-muted small">{insumo.unidad_medida.nombre}</span>
                            <span className="escalar-columna">
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    className="escalar-input"
                                    aria-label={`Cantidad escalada de ${insumo.nombre}`}
                                    value={
                                        edicion?.insumoId === insumo.insumo_id
                                            ? edicion.texto
                                            : formatearCantidad(insumo.cantidad * factor)
                                    }
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => cambiarCantidad(insumo.insumo_id, insumo.cantidad, e.target.value)}
                                    onBlur={() => setEdicion(null)}
                                />
                            </span>
                        </div>
                    ))}

                    <p className="text-muted small mt-3 mb-0">
                        Modificá cualquier cantidad de la columna "Escalado" y el resto se ajusta proporcionalmente.
                    </p>
                </Card.Body>

                <Card.Footer className="bg-light d-flex justify-content-between gap-2">
                    <Button variant="outline-secondary" onClick={() => navigate("/productos")}>
                        <i className="bi bi-arrow-left me-1"></i>Volver
                    </Button>
                    <Button
                        variant="outline-primary"
                        disabled={factor === 1}
                        onClick={() => { setFactor(1); setEdicion(null); }}
                    >
                        <i className="bi bi-arrow-counterclockwise me-1"></i>Restablecer
                    </Button>
                </Card.Footer>
            </Card>
        </Container>
    );
}
