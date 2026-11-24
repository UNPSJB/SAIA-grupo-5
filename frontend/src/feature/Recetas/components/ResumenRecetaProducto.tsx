import { Alert, Button, Card, Row, Spinner, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import { Dato } from "../../../components/Dato";
import { EstadoBadge } from "../../../components/EstadoBadge";
import { useApi } from "../../../hooks/useApi";
import type { Receta } from "../types";

interface ResumenRecetaProductoProps {
    productoId: number;
    tieneReceta: boolean;
}

const formatearFecha = (fecha: string | null) =>
    fecha ? new Date(fecha).toLocaleDateString("es-AR") : "-";

export function ResumenRecetaProducto({
    productoId,
    tieneReceta,
}: ResumenRecetaProductoProps) {
    const navigate = useNavigate();

    const {
        data: receta,
        error,
        isLoading,
    } = useApi<Receta>(
        tieneReceta ? `/recetas/producto/${productoId}` : null
    );

    return (
        <Card className="shadow-sm border-0 rounded-3 text-start">
            <Card.Body className="p-4">
                <h6 className="detalle-seccion-titulo">Receta del producto</h6>

                {!tieneReceta ? (
                    <Alert variant="secondary" className="mb-0">
                        Este producto no tiene una receta asociada.
                    </Alert>
                ) : isLoading ? (
                    <div className="text-center py-3">
                        <Spinner animation="border" size="sm" />
                        <span className="ms-2 text-muted">
                            Cargando receta...
                        </span>
                    </div>
                ) : error || !receta ? (
                    <Alert variant="warning" className="mb-0">
                        No fue posible consultar la receta.
                    </Alert>
                ) : (
                    <>
                        <Row className="g-3 mb-4">
                            <Dato etiqueta="Versión" md={6} lg={3}>
                                <span className="fw-semibold me-2">Versión {receta.version}</span>
                                {receta.vigente && (
                                    <EstadoBadge tono="success" icono="bi-check-circle-fill">Vigente</EstadoBadge>
                                )}
                            </Dato>
                            <Dato etiqueta="Vigente desde" md={6} lg={3}>
                                {formatearFecha(receta.fecha_desde_vigencia ?? receta.fecha_creacion)}
                            </Dato>
                            <Dato etiqueta="Porción" md={6} lg={3}>
                                {receta.porcion !== null
                                    ? `${receta.porcion} ${receta.porcion_unidad_medida?.nombre ?? ""}`
                                    : <span className="text-muted fst-italic">Sin indicar</span>}
                            </Dato>
                            <Dato etiqueta="Ingredientes y aditivos" md={6} lg={3}>
                                {receta.insumos.length}
                            </Dato>
                        </Row>

                        <h6 className="detalle-seccion-titulo">Ingredientes y aditivos</h6>
                        {receta.insumos.length === 0 ? (
                            <p className="text-muted">
                                No hay ingredientes asociados.
                            </p>
                        ) : (
                            <Table responsive bordered hover size="sm">
                                <thead className="table-light">
                                    <tr>
                                        <th>Insumo</th>
                                        <th>Tipo</th>
                                        <th className="text-end">
                                            Cantidad
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {receta.insumos.map((insumo) => (
                                        <tr key={insumo.id}>
                                            <td className="fw-semibold">
                                                {insumo.tipo === "Aditivo"
                                                    ? insumo.aditivo?.nombre ??
                                                    insumo.nombre
                                                    : insumo.nombre}
                                            </td>
                                            <td>
                                                <EstadoBadge tono={insumo.tipo === "Aditivo" ? "info" : "success"}>
                                                    {insumo.tipo}
                                                </EstadoBadge>
                                            </td>
                                            <td className="text-end">
                                                {insumo.cantidad}{" "}
                                                {insumo.unidad_medida.codigo || insumo.unidad_medida.nombre}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}

                        <Button
                            variant="outline-primary"
                            onClick={() =>
                                navigate(`/productos/${productoId}/receta`)
                            }
                        >
                            <i className="bi bi-eye me-2" />
                            Ver receta completa
                        </Button>
                    </>
                )}
            </Card.Body>
        </Card>
    );
}
