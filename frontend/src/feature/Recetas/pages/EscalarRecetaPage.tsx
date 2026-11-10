import { useState } from "react";
import { Alert, Button, Card, Col, Container, Form, InputGroup, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { PageLoading } from "../../../components/PageLoading";
import { useApi } from "../../../hooks/useApi";
import type { Producto } from "../../Productos/types";
import { INSUMOS_RECETA_MOCK } from "../constants";
import type { Receta } from "../types";
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

    // INSUMO RECETA MOCK
    const insumos = receta.insumos ?? INSUMOS_RECETA_MOCK;

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
                        <span>Insumo</span>
                        <span className="text-end">Original</span>
                        <span />
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
                        </div>
                    ))}

                    <div className="escalar-controles mt-3 pt-3">
                        <label htmlFor="escalar-factor" className="small text-muted mb-2 d-block">
                            Multiplicar la receta por
                        </label>
                        <div>
                            <InputGroup size="sm" className="escalar-factor-input">
                                <InputGroup.Text>x</InputGroup.Text>
                                <Form.Control
                                    id="escalar-factor"
                                    type="text"
                                    inputMode="decimal"
                                    value={textoFactor}
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => cambiarTextoFactor(e.target.value)}
                                    onBlur={() => setTextoFactor(formatearCantidad(factor))}
                                />
                            </InputGroup>
                        </div>
                    </div>
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

            <h2 className="h6 text-muted mt-4 mb-3">Cantidades escaladas (x{formatearCantidad(factor)})</h2>
            <Row xs={2} sm={3} className="escalar-cards g-2 g-sm-3 mb-4">
                {insumos.map((insumo) => (
                    <Col key={insumo.insumo_id}>
                        <div className="escalar-card h-100">
                            <div className="escalar-card-etiqueta text-truncate" title={insumo.nombre}>{insumo.nombre}</div>
                            <div className="escalar-card-valor">
                                {formatearCantidad(insumo.cantidad * factor)}
                                <span className="escalar-card-unidad">{insumo.unidad_medida.nombre}</span>
                            </div>
                            <div className="escalar-card-detalle">
                                original: {formatearCantidad(insumo.cantidad)} {insumo.unidad_medida.nombre}
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}
