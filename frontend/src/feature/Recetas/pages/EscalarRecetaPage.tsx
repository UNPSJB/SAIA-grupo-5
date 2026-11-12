import { useState } from "react";
import { Alert, Button, Card, Col, Container, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { PageLoading } from "../../../components/PageLoading";
import { useApi } from "../../../hooks/useApi";
import type { Producto } from "../../Productos/types";
import type { InsumoReceta, Receta } from "../types";
import "./EscalarRecetaPage.css";

// Redondeo
function formatearCantidad(valor: number): string {
    return String(Math.round(valor * 100) / 100);
}

export function EscalarRecetaPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const { data: producto, isLoading: cargandoProducto } = useApi<Producto>(`/productos/${id}`);
    const { data: receta, isLoading: cargandoReceta, error } = useApi<Receta>(`/recetas/producto/${id}`);

    const [factor, setFactor] = useState(1);
    const [textoFactor, setTextoFactor] = useState("1");

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

    const ingredientes = receta.insumos.filter((item) => item.tipo === "Ingrediente");
    const aditivos = receta.insumos.filter((item) => item.tipo === "Aditivo");

    const aplicarFactor = (nuevoFactor: number) => {
        setFactor(nuevoFactor);
        setTextoFactor(formatearCantidad(nuevoFactor));
    };

    const cambiarTextoFactor = (texto: string) => {
        setTextoFactor(texto);
        const valor = Number(texto.replace(",", "."));
        if (texto.trim() !== "" && Number.isFinite(valor) && valor > 0) {
            setFactor(valor);
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
                        <span>Ingrediente</span>
                        <span className="text-end">Original</span>
                        <span />
                    </div>

                    {ingredientes.map((insumo, indice) => (
                        <div key={insumo.id} className="escalar-fila">
                            <span className="text-muted">{indice + 1}</span>
                            <span className="escalar-nombre">
                                <span className="text-truncate">{insumo.nombre}</span>
                                <span className="escalar-puntos" aria-hidden="true" />
                            </span>
                            <span className="text-end">{formatearCantidad(insumo.cantidad)}</span>
                            <span className="text-muted small">{insumo.unidad_medida.nombre}</span>
                        </div>
                    ))}

                    {aditivos.length > 0 && (
                        <>
                            <div className="escalar-fila escalar-encabezado mt-2">
                                <span />
                                <span>Aditivo</span>
                                <span className="text-end">Original</span>
                                <span />
                            </div>

                            {aditivos.map((aditivo, indice) => (
                                <div key={aditivo.id} className="escalar-fila">
                                    <span className="text-muted">{indice + 1}</span>
                                    <span className="escalar-nombre">
                                        <span className="text-truncate">{nombreRenglon(aditivo)}</span>
                                        <span className="escalar-puntos" aria-hidden="true" />
                                    </span>
                                    <span className="text-end">{formatearCantidad(aditivo.cantidad)}</span>
                                    <span className="text-muted small">{aditivo.unidad_medida.nombre}</span>
                                </div>
                            ))}
                        </>
                    )}

                </Card.Body>

                <Card.Footer className="bg-light d-flex justify-content-between gap-2">
                    <Button variant="outline-secondary" onClick={() => navigate("/productos")}>
                        <i className="bi bi-arrow-left me-1"></i>Volver
                    </Button>
                    <Button
                        variant="outline-primary"
                        disabled={factor === 1}
                        onClick={() => aplicarFactor(1)}
                    >
                        <i className="bi bi-arrow-counterclockwise me-1"></i>Restablecer
                    </Button>
                </Card.Footer>
            </Card>

            <div className="escalar-controles mt-4 mb-3">

                <label htmlFor="escalar-factor" className="escalar-factor">
                    <span className="escalar-factor-etiqueta">Multiplicar la receta por</span>
                    <span className="escalar-factor-campo">
                        <span className="escalar-factor-x" aria-hidden="true">x</span>
                        <input
                            id="escalar-factor"
                            type="text"
                            inputMode="decimal"
                            autoComplete="off"
                            className="escalar-factor-input"
                            value={textoFactor}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => cambiarTextoFactor(e.target.value)}
                            onBlur={() => setTextoFactor(formatearCantidad(factor))}
                        />
                    </span>
                </label>
            </div>
            <h2 className="h6 text-muted text-uppercase mb-3">Ingredientes</h2>
            <TarjetasEscaladas renglones={ingredientes} factor={factor} />

            {aditivos.length > 0 && (
                <>
                    <h2 className="h6 text-muted text-uppercase mb-3">Aditivos</h2>
                    <TarjetasEscaladas renglones={aditivos} factor={factor} />
                </>
            )}
        </Container>
    );
}

// Para los aditivos se muestra el nombre del aditivo (como en VerRecetaModal); para los ingredientes, el del insumo
function nombreRenglon(renglon: InsumoReceta): string {
    return renglon.aditivo?.nombre ?? renglon.nombre;
}

function TarjetasEscaladas({ renglones, factor }: { renglones: InsumoReceta[]; factor: number }) {
    return (
        <Row xs={2} sm={3} className="escalar-cards g-2 g-sm-3 mb-4">
            {renglones.map((renglon) => (
                <Col key={renglon.id}>
                    <div className="escalar-card h-100">
                        <div className="escalar-card-etiqueta text-truncate" title={nombreRenglon(renglon)}>{nombreRenglon(renglon)}</div>
                        <div className="escalar-card-valor">
                            {formatearCantidad(renglon.cantidad * factor)}
                            <span className="escalar-card-unidad">{renglon.unidad_medida.nombre}</span>
                        </div>
                        <div className="escalar-card-detalle">
                            original: {formatearCantidad(renglon.cantidad)} {renglon.unidad_medida.nombre}
                        </div>
                    </div>
                </Col>
            ))}
        </Row>
    );
}
