import { useState } from "react";
import { Alert, Badge, Button, Card, Form, Modal, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../../hooks/useApi";
import type { ProveedorReposicionSugerido, SugerenciasReposicionResponse } from "../types";

interface SugerenciasReposicionModalProps {
    show: boolean;
    onHide: () => void;
}

export function SugerenciasReposicionModal({ show, onHide }: SugerenciasReposicionModalProps) {
    const navigate = useNavigate();
    const { data, isLoading, error } = useApi<SugerenciasReposicionResponse>(
        show ? "/pedidos-proveedor/sugerencias-reposicion" : null
    );

    const [seleccionados, setSeleccionados] = useState<Record<string, boolean>>({});

    const toggleInsumo = (proveedorId: number, insumoId: number) => {
        const clave = `${proveedorId}:${insumoId}`;
        setSeleccionados((prev) => ({
            ...prev,
            [clave]: prev[clave] === undefined ? false : !prev[clave],
        }));
    };

    const estaSeleccionado = (proveedorId: number, insumoId: number, tienePendiente: boolean) => {
        const clave = `${proveedorId}:${insumoId}`;
        if (seleccionados[clave] !== undefined) return seleccionados[clave];
        return !tienePendiente;
    };

    const generarPedido = (proveedor: ProveedorReposicionSugerido) => {
        const items = proveedor.insumos
            .filter((insumo) =>
                estaSeleccionado(proveedor.proveedor_id, insumo.insumo_id, insumo.tiene_pedido_pendiente)
            )
            .map((insumo) => ({
                insumo_id: insumo.insumo_id,
                cantidad_pedida: insumo.cantidad_sugerida,
            }));

        if (items.length === 0) return;

        const fechaEstimada = new Date();
        fechaEstimada.setDate(fechaEstimada.getDate() + 10);
        const anio = fechaEstimada.getFullYear();
        const mes = String(fechaEstimada.getMonth() + 1).padStart(2, "0");
        const dia = String(fechaEstimada.getDate()).padStart(2, "0");
        const fechaFormateada = `${anio}-${mes}-${dia}`;

        onHide();
        navigate("/pedidos-proveedor/new", {
            state: {
                proveedor_id: proveedor.proveedor_id,
                fecha_entrega_estimada: fechaFormateada,
                observacion: "Pedido generado desde sugerencias de reposicion por stock critico.",
                items,
            },
        });
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="bi bi-cart-plus me-2 text-primary"></i>
                    Sugerencias de Reposicion por Stock Critico
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {isLoading ? (
                    <p className="text-muted mb-0">Analizando stock y proveedores habilitados...</p>
                ) : error || !data ? (
                    <Alert variant="danger" className="mb-0">
                        No se pudieron cargar las sugerencias de reposicion.
                    </Alert>
                ) : data.por_proveedor.length === 0 && data.insumos_sin_proveedor.length === 0 ? (
                    <Alert variant="success" className="mb-0">
                        No hay insumos por debajo del stock minimo ni proximos a vencer.
                    </Alert>
                ) : (
                    <>
                        {data.por_proveedor.map((proveedor) => {
                            const cantidadElegidos = proveedor.insumos.filter((insumo) =>
                                estaSeleccionado(
                                    proveedor.proveedor_id,
                                    insumo.insumo_id,
                                    insumo.tiene_pedido_pendiente
                                )
                            ).length;

                            return (
                                <Card key={proveedor.proveedor_id} className="mb-3 border">
                                    <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                                        <Card.Title as="h6" className="mb-0">
                                            {proveedor.proveedor_nombre} (CUIT: {proveedor.cuit})
                                        </Card.Title>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            disabled={cantidadElegidos === 0}
                                            onClick={() => generarPedido(proveedor)}
                                        >
                                            <i className="bi bi-clipboard-plus me-1"></i>
                                            Generar Pedido ({cantidadElegidos})
                                        </Button>
                                    </Card.Header>
                                    <Card.Body className="p-2">
                                        <Table size="sm" responsive hover className="mb-0 align-middle">
                                            <thead>
                                                <tr>
                                                    <th style={{ width: 40 }}></th>
                                                    <th>Insumo</th>
                                                    <th>Disp.</th>
                                                    <th>Min. Alerta</th>
                                                    <th>Sugerido</th>
                                                    <th>Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {proveedor.insumos.map((insumo) => {
                                                    const marcado = estaSeleccionado(
                                                        proveedor.proveedor_id,
                                                        insumo.insumo_id,
                                                        insumo.tiene_pedido_pendiente
                                                    );
                                                    return (
                                                        <tr key={insumo.insumo_id}>
                                                            <td>
                                                                <Form.Check
                                                                    type="checkbox"
                                                                    checked={marcado}
                                                                    onChange={() =>
                                                                        toggleInsumo(
                                                                            proveedor.proveedor_id,
                                                                            insumo.insumo_id
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="fw-semibold">
                                                                {insumo.insumo_nombre} ({insumo.unidad_medida})
                                                            </td>
                                                            <td>
                                                                <Badge bg="danger">{insumo.stock_disponible}</Badge>
                                                            </td>
                                                            <td>{insumo.minimo_alerta}</td>
                                                            <td className="fw-bold">{insumo.cantidad_sugerida}</td>
                                                            <td>
                                                                {insumo.tiene_pedido_pendiente ? (
                                                                    <Badge bg="warning" text="dark">
                                                                        Pedido pendiente
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge bg="secondary">Sin pedido</Badge>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            );
                        })}

                        {data.insumos_sin_proveedor.length > 0 && (
                            <Alert variant="warning" className="mb-0">
                                <Alert.Heading as="h6">
                                    Insumos criticos sin proveedor habilitado asociado
                                </Alert.Heading>
                                <Table size="sm" responsive className="mb-0 mt-2">
                                    <thead>
                                        <tr>
                                            <th>Insumo</th>
                                            <th>Disponible</th>
                                            <th>Minimo Alerta</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.insumos_sin_proveedor.map((insumo) => (
                                            <tr key={insumo.insumo_id}>
                                                <td>{insumo.insumo_nombre} ({insumo.unidad_medida})</td>
                                                <td>{insumo.stock_disponible}</td>
                                                <td>{insumo.minimo_alerta}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Alert>
                        )}
                    </>
                )}
            </Modal.Body>
            <Modal.Footer className="justify-content-start">
                <Button variant="secondary" onClick={onHide}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
