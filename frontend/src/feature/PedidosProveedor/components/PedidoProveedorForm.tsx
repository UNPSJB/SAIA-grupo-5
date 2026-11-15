import { useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../../hooks/useApi";
import { mostrarAlertaError } from "../../../libs/alertas";
import type { Proveedor } from "../../Proveedores/types";
import type { NewPedidoProveedor, PedidoProveedorItemCreate } from "../types";

interface PedidoProveedorFormProps {
    textoBoton: string;
    onSubmit: (datos: NewPedidoProveedor) => Promise<void> | void;
    proveedorFijo?: Proveedor;
    valoresIniciales?: {
        proveedor_id: number;
        fecha_entrega_estimada: string | null;
        observacion: string | null;
        items: PedidoProveedorItemCreate[];
    };
}

interface FilaItem {
    insumo_id: string;
    cantidad_pedida: string;
}

export function PedidoProveedorForm({
    textoBoton,
    onSubmit,
    proveedorFijo,
    valoresIniciales,
}: PedidoProveedorFormProps) {
    const navigate = useNavigate();
    const { data: proveedores, isLoading: cargandoProveedores } = useApi<Proveedor[]>(
        proveedorFijo ? null : "/proveedores/"
    );

    const [proveedorId, setProveedorId] = useState<string>(
        proveedorFijo
            ? String(proveedorFijo.id)
            : valoresIniciales?.proveedor_id
            ? String(valoresIniciales.proveedor_id)
            : ""
    );
    const [fechaEntregaEstimada, setFechaEntregaEstimada] = useState<string>(
        valoresIniciales?.fecha_entrega_estimada || ""
    );
    const [observacion, setObservacion] = useState<string>(
        valoresIniciales?.observacion || ""
    );
    const [filas, setFilas] = useState<FilaItem[]>(
        valoresIniciales?.items && valoresIniciales.items.length > 0
            ? valoresIniciales.items.map((item) => ({
                  insumo_id: String(item.insumo_id),
                  cantidad_pedida: String(item.cantidad_pedida),
              }))
            : [{ insumo_id: "", cantidad_pedida: "" }]
    );
    const [guardando, setGuardando] = useState(false);

    const hoyStr = new Date().toISOString().split("T")[0];

    const proveedoresHabilitados = (proveedores ?? []).filter((p) => {
        if (!p.activo || !p.numero_habilitacion || !p.vencimiento_habilitacion) return false;
        return p.vencimiento_habilitacion >= hoyStr;
    });

    const proveedorSeleccionado = proveedorFijo
        ? proveedorFijo
        : proveedores?.find((p) => String(p.id) === proveedorId);

    const insumosCatalogoProveedor = (proveedorSeleccionado?.insumos_asociados ?? [])
        .map((asoc) => asoc.insumo)
        .filter((insumo) => insumo && insumo.activo);

    const idsSeleccionados = filas.map((f) => f.insumo_id).filter(Boolean);

    const handleCambiarProveedor = (nuevoId: string) => {
        setProveedorId(nuevoId);
        setFilas([{ insumo_id: "", cantidad_pedida: "" }]);
    };

    const agregarFila = () => {
        if (filas.length >= insumosCatalogoProveedor.length) return;
        setFilas([...filas, { insumo_id: "", cantidad_pedida: "" }]);
    };

    const quitarFila = (index: number) => {
        if (filas.length === 1) {
            setFilas([{ insumo_id: "", cantidad_pedida: "" }]);
            return;
        }
        setFilas(filas.filter((_, i) => i !== index));
    };

    const actualizarFila = (index: number, campo: keyof FilaItem, valor: string) => {
        setFilas(filas.map((fila, i) => (i === index ? { ...fila, [campo]: valor } : fila)));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!proveedorId) {
            mostrarAlertaError("Debe seleccionar un proveedor habilitado.");
            return;
        }

        const filasCompletas = filas.filter((f) => f.insumo_id !== "" || f.cantidad_pedida !== "");

        if (filasCompletas.length === 0) {
            mostrarAlertaError("Debe agregar al menos un insumo al pedido.");
            return;
        }

        for (const fila of filasCompletas) {
            if (!fila.insumo_id) {
                mostrarAlertaError("Seleccione el insumo en todos los renglones cargados.");
                return;
            }
            const cantidad = Number(fila.cantidad_pedida);
            if (!fila.cantidad_pedida || isNaN(cantidad) || cantidad <= 0) {
                mostrarAlertaError("La cantidad pedida debe ser mayor a cero.");
                return;
            }
        }

        const ids = filasCompletas.map((f) => f.insumo_id);
        if (ids.length !== new Set(ids).size) {
            mostrarAlertaError("No se puede pedir dos veces el mismo insumo.");
            return;
        }

        setGuardando(true);
        try {
            await onSubmit({
                proveedor_id: Number(proveedorId),
                fecha_entrega_estimada: fechaEntregaEstimada ? fechaEntregaEstimada : null,
                observacion: observacion.trim() ? observacion.trim() : null,
                items: filasCompletas.map((f) => ({
                    insumo_id: Number(f.insumo_id),
                    cantidad_pedida: Number(f.cantidad_pedida),
                })),
            });
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="col-md-8 mx-auto">
            <Form onSubmit={handleSubmit} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>
                <Row>
                    <Col md={7}>
                        <Form.Group className="mb-3 text-start" controlId="formProveedor">
                            <Form.Label className="p-1 fw-bold">Proveedor *</Form.Label>
                            <Form.Select
                                value={proveedorId}
                                onChange={(e) => handleCambiarProveedor(e.target.value)}
                                disabled={!!proveedorFijo || cargandoProveedores || guardando}
                            >
                                {proveedorFijo ? (
                                    <option value={proveedorFijo.id}>
                                        {proveedorFijo.nombre} ({proveedorFijo.cuit})
                                    </option>
                                ) : (
                                    <>
                                        <option value="">
                                            {cargandoProveedores ? "Cargando proveedores..." : "Seleccionar proveedor..."}
                                        </option>
                                        {proveedoresHabilitados.map((prov) => (
                                            <option key={prov.id} value={prov.id}>
                                                {prov.nombre} ({prov.cuit})
                                            </option>
                                        ))}
                                    </>
                                )}
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col md={5}>
                        <Form.Group className="mb-3 text-start" controlId="formFechaEntrega">
                            <Form.Label className="p-1 fw-bold">Fecha Entrega Estimada</Form.Label>
                            <Form.Control
                                type="date"
                                value={fechaEntregaEstimada}
                                onChange={(e) => setFechaEntregaEstimada(e.target.value)}
                                disabled={guardando}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group className="mb-3 text-start" controlId="formObservacion">
                    <Form.Label className="p-1 fw-bold">Observacion</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={2}
                        maxLength={500}
                        placeholder="Notas o indicaciones para el pedido..."
                        value={observacion}
                        onChange={(e) => setObservacion(e.target.value)}
                        disabled={guardando}
                    />
                </Form.Group>

                <hr className="my-3" />

                <div className="text-start mb-3">
                    <h6 className="fw-bold text-primary mb-2">
                        <i className="bi bi-list-check me-2"></i>Insumos del Pedido *
                    </h6>

                    {!proveedorId ? (
                        <Alert variant="light" className="border text-muted small mb-0">
                            Seleccione primero un proveedor para ver los insumos disponibles en su catalogo.
                        </Alert>
                    ) : insumosCatalogoProveedor.length === 0 ? (
                        <Alert variant="warning" className="small mb-0">
                            Este proveedor no tiene insumos activos asociados en su catalogo. Asociarlos primero desde el modulo de Proveedores.
                        </Alert>
                    ) : (
                        <>
                            {filas.map((fila, index) => {
                                const insumoActual = insumosCatalogoProveedor.find(
                                    (i) => String(i.id) === fila.insumo_id
                                );
                                const unidad = insumoActual?.unidad_medida?.nombre || "U";

                                return (
                                    <Row key={index} className="mb-2 g-2 align-items-end">
                                        <Col md={7}>
                                            <Form.Label className="small fw-bold mb-1">Insumo</Form.Label>
                                            <Form.Select
                                                value={fila.insumo_id}
                                                onChange={(e) => actualizarFila(index, "insumo_id", e.target.value)}
                                                disabled={guardando}
                                            >
                                                <option value="">Seleccionar insumo...</option>
                                                {insumosCatalogoProveedor
                                                    .filter(
                                                        (ins) =>
                                                            String(ins.id) === fila.insumo_id ||
                                                            !idsSeleccionados.includes(String(ins.id))
                                                    )
                                                    .map((ins) => (
                                                        <option key={ins.id} value={ins.id}>
                                                            {ins.nombre} ({ins.unidad_medida?.nombre || "U"})
                                                        </option>
                                                    ))}
                                            </Form.Select>
                                        </Col>

                                        <Col md={3}>
                                            <Form.Label className="small fw-bold mb-1">
                                                Cantidad ({unidad})
                                            </Form.Label>
                                            <Form.Control
                                                type="number"
                                                step="any"
                                                min="0.01"
                                                placeholder="Ej: 50"
                                                value={fila.cantidad_pedida}
                                                onChange={(e) =>
                                                    actualizarFila(index, "cantidad_pedida", e.target.value)
                                                }
                                                disabled={guardando}
                                            />
                                        </Col>

                                        <Col md={2}>
                                            <Button
                                                variant="outline-danger"
                                                onClick={() => quitarFila(index)}
                                                disabled={guardando}
                                                title="Quitar insumo"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </Button>
                                        </Col>
                                    </Row>
                                );
                            })}

                            <Button
                                variant="outline-primary"
                                size="sm"
                                className="mt-2"
                                onClick={agregarFila}
                                disabled={guardando || filas.length >= insumosCatalogoProveedor.length}
                            >
                                <i className="bi bi-plus-circle me-1"></i>Agregar otro insumo
                            </Button>
                        </>
                    )}
                </div>

                <div className="d-flex justify-content-start gap-2 mt-4">
                    <Button variant="secondary" type="button" onClick={() => navigate("/pedidos-proveedor")} disabled={guardando}>
                        <i className="bi bi-x-circle me-1"></i>Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={guardando || !proveedorId || insumosCatalogoProveedor.length === 0}
                    >
                        <i className="bi bi-floppy me-1"></i>{guardando ? "Guardando..." : textoBoton}
                    </Button>
                </div>
            </Form>
        </div>
    );
}