import { useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks/useApi";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import type { Insumo } from "../../Insumos/types";
import type { Proveedor } from "../types";

interface AsociarInsumosProveedorModalProps {
    proveedor: Proveedor | null;
    onHide: () => void;
    onAsociado: () => void;
}

export function AsociarInsumosProveedorModal({ proveedor, onHide, onAsociado }: AsociarInsumosProveedorModalProps) {
    const { data: insumos, isLoading, error } = useApi<Insumo[]>(proveedor ? "/insumos/" : null);

    const iniciales = proveedor?.insumos_asociados && proveedor.insumos_asociados.length > 0
        ? proveedor.insumos_asociados.map((item) => String(item.insumo_id))
        : [""];

    const [seleccionados, setSeleccionados] = useState<string[]>(iniciales);
    const [guardando, setGuardando] = useState(false);

    if (!proveedor) return null;

    const editando = (proveedor.insumos_asociados?.length ?? 0) > 0;
    const disponibles = (insumos ?? []).filter((insumo) => insumo.activo);
    const idsSeleccionados = seleccionados.filter(Boolean);

    const agregarFila = () => {
        if (seleccionados.length >= disponibles.length) return;
        setSeleccionados([...seleccionados, ""]);
    };

    const quitarFila = (index: number) => {
        if (seleccionados.length === 1) {
            setSeleccionados([""]);
            return;
        }
        setSeleccionados(seleccionados.filter((_, i) => i !== index));
    };

    const actualizarFila = (index: number, valor: string) => {
        setSeleccionados(seleccionados.map((item, i) => (i === index ? valor : item)));
    };

    const guardar = async () => {
        const idsLimpios = seleccionados.filter((id) => id !== "");

        if (idsLimpios.length !== new Set(idsLimpios).size) {
            mostrarAlertaError("No se puede seleccionar dos veces el mismo insumo.");
            return;
        }

        setGuardando(true);
        try {
            await api.put(`/proveedores/${proveedor.id}/insumos`, {
                insumos_ids: idsLimpios.map(Number),
            });

            mostrarAlertaExito("Los insumos del proveedor se actualizaron correctamente.");
            onAsociado();
            onHide();
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            const mensaje = Array.isArray(detail) ? detail[0]?.msg : detail;
            mostrarAlertaError(typeof mensaje === "string" ? mensaje : "No se pudieron guardar los insumos.");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Modal show={!!proveedor} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {editando ? "Modificar insumos de " : "Asociar insumos a "} {proveedor.nombre}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {isLoading ? (
                    <p>Cargando insumos del catalogo...</p>
                ) : error ? (
                    <p className="text-danger">No se pudieron cargar los insumos.</p>
                ) : disponibles.length === 0 ? (
                    <p className="text-muted mb-0">No hay insumos activos disponibles en el catalogo.</p>
                ) : (
                    <>
                        <p className="text-muted small mb-3">
                            Selecciona los insumos alimenticios del catalogo que este proveedor puede suministrar.
                        </p>

                        {seleccionados.map((seleccionadoId, index) => {
                            const insumoActual = insumos?.find((i) => String(i.id) === seleccionadoId);

                            return (
                                <Row key={index} className="mb-3 g-2 align-items-end">
                                    <Col md={10}>
                                        <Form.Label className="fw-bold">Insumo</Form.Label>
                                        <Form.Select
                                            value={seleccionadoId}
                                            onChange={(e) => actualizarFila(index, e.target.value)}
                                            disabled={guardando}
                                        >
                                            <option value="">Seleccionar insumo...</option>
                                            {disponibles
                                                .filter(
                                                    (insumo) =>
                                                        String(insumo.id) === seleccionadoId ||
                                                        !idsSeleccionados.includes(String(insumo.id))
                                                )
                                                .map((insumo) => (
                                                    <option key={insumo.id} value={insumo.id}>
                                                        {insumo.nombre} ({insumo.unidad_medida?.nombre || "U"})
                                                    </option>
                                                ))}
                                            {insumoActual && !insumoActual.activo && (
                                                <option value={insumoActual.id}>
                                                    {insumoActual.nombre} (Inactivo)
                                                </option>
                                            )}
                                        </Form.Select>
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
                            onClick={agregarFila}
                            disabled={guardando || seleccionados.length >= disponibles.length}
                        >
                            <i className="bi bi-plus-circle me-1"></i>Agregar otro insumo
                        </Button>
                    </>
                )}
            </Modal.Body>

            <Modal.Footer className="justify-content-start">
                <Button variant="secondary" onClick={onHide} disabled={guardando}>
                    <i className="bi bi-x-circle me-1"></i>Cancelar
                </Button>
                <Button
                    variant="primary"
                    onClick={guardar}
                    disabled={guardando || isLoading || !!error || disponibles.length === 0}
                >
                    <i className="bi bi-floppy me-1"></i>{guardando ? "Guardando..." : "Guardar insumos"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}