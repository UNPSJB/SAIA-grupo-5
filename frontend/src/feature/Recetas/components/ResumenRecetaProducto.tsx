import { Alert, Button, Card, Spinner, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import { useApi } from "../../../hooks/useApi";
import type { Receta } from "../types";

interface ResumenRecetaProductoProps {
    productoId: number;
    tieneReceta: boolean;
}

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
        <Card className="shadow-sm border-0 rounded-3 mt-3">
            <Card.Header className="bg-white fw-semibold py-3">
                <i className="bi bi-journal-text me-2" />
                Receta del producto
            </Card.Header>

            <Card.Body className="p-4">
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
                        <div className="d-flex flex-wrap justify-content-between gap-2 mb-3">
                            <div>
                                <strong>Versión vigente</strong>
                                <div className="text-muted small">
                                    Versión {receta.version}
                                </div>
                            </div>

                            <div className="text-muted small">
                                {receta.insumos.length} ingredientes y aditivos
                            </div>
                        </div>

                        <Table responsive striped hover size="sm">
                            <thead>
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
                                        <td>
                                            {insumo.tipo === "Aditivo"
                                                ? insumo.aditivo?.nombre ??
                                                insumo.nombre
                                                : insumo.nombre}
                                        </td>
                                        <td>{insumo.tipo}</td>
                                        <td className="text-end">
                                            {insumo.cantidad}{" "}
                                            {insumo.unidad_medida.codigo || insumo.unidad_medida.nombre}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

                        {receta.insumos.length === 0 && (
                            <p className="text-muted">
                                No hay ingredientes asociados.
                            </p>
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
