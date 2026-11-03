import { useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks/useApi";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import type { Insumo } from "../../Insumos/types";
import type { InsumoUtilizado } from "../types";

interface AsociarInsumosModalProps {
    loteId: number;
    insumosAsociados: InsumoUtilizado[];
    onHide: () => void;
    onAsociado: () => void;
}

interface InsumoSeleccionado {
    insumo_id: string;
    cantidad_utilizada: string;
}

export function AsociarInsumosModal({ loteId, insumosAsociados, onHide, onAsociado }: AsociarInsumosModalProps) {
    const { data: insumos, isLoading, error } = useApi<Insumo[]>("/insumos/");
    const [seleccionados, setSeleccionados] = useState<InsumoSeleccionado[]>(insumosAsociados.length > 0
        ? insumosAsociados.map((registro) => ({ insumo_id: String(registro.insumo_id), cantidad_utilizada: String(registro.cantidad_utilizada) }))
        : [{ insumo_id: "", cantidad_utilizada: "" }]
    );
    const [guardando, setGuardando] = useState(false);

    const editando = insumosAsociados.length > 0;
    const disponibles = (insumos ?? []).filter((insumo) => insumo.activo);
    const idsSeleccionados = seleccionados.map((insumo) => insumo.insumo_id).filter(Boolean);

    const agregarFila = () => {
        if (seleccionados.length >= disponibles.length) return;
        setSeleccionados([...seleccionados, { insumo_id: "", cantidad_utilizada: "" }]);
    };

    const quitarFila = (index: number) => {
        if (seleccionados.length <= 1) return;
        setSeleccionados(seleccionados.filter((_, i) => i !== index));
    };

    const actualizarFila = (index: number, campo: keyof InsumoSeleccionado, valor: string) => {
        setSeleccionados(seleccionados.map((insumo, i) => i === index ? { ...insumo, [campo]: valor } : insumo));
    };

    const guardar = async () => {
        if (seleccionados.some((insumo) => !insumo.insumo_id || !insumo.cantidad_utilizada || !Number.isFinite(Number(insumo.cantidad_utilizada)) || Number(insumo.cantidad_utilizada) <= 0)) {
            mostrarAlertaError("Seleccioná los insumos e indicá cantidades mayores a cero.");
            return;
        }

        if (seleccionados.some((insumo) => !/^\d+(\.\d{1,3})?$/.test(insumo.cantidad_utilizada) || Number(insumo.cantidad_utilizada) >= 1000000000)) {
            mostrarAlertaError("Las cantidades deben tener como máximo 3 decimales.");
            return;
        }

        if (idsSeleccionados.length !== new Set(idsSeleccionados).size) {
            mostrarAlertaError("No se puede seleccionar dos veces el mismo insumo.");
            return;
        }

        setGuardando(true);

        try {
            const datos = {
                insumos: seleccionados.map((insumo) => ({
                    insumo_id: Number(insumo.insumo_id),
                    cantidad_utilizada: insumo.cantidad_utilizada
                }))
            };

            if (editando) {
                await api.put(`/lotes-produccion/${loteId}/insumos`, datos);
            } else {
                await api.post(`/lotes-produccion/${loteId}/insumos`, datos);
            }

            mostrarAlertaExito(editando ? "Los insumos se actualizaron correctamente." : "Los insumos se asociaron correctamente al lote.");
            onAsociado();
        } catch (error: any) {
            const detail = error.response?.data?.detail;
            const mensaje = Array.isArray(detail) ? detail[0]?.msg : detail;
            mostrarAlertaError(typeof mensaje === "string" ? mensaje : "No se pudieron guardar los insumos.");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Modal show onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>{editando ? "Modificar insumos" : "Asociar insumos"} del lote N° {loteId}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {isLoading ? (
                    <p>Cargando insumos...</p>
                ) : error ? (
                    <p className="text-danger">No se pudieron cargar los insumos.</p>
                ) : disponibles.length === 0 ? (
                    <p className="text-muted mb-0">No hay insumos activos disponibles.</p>
                ) : (
                    <>
                        {seleccionados.map((seleccionado, index) => {
                            const insumoActual = insumos?.find((insumo) => String(insumo.id) === seleccionado.insumo_id);

                            return (
                                <Row key={index} className="mb-3 g-2 align-items-end">
                                    <Col md={6}>
                                        <Form.Label className="fw-bold">Insumo</Form.Label>
                                        <Form.Select value={seleccionado.insumo_id} onChange={(e) => actualizarFila(index, "insumo_id", e.target.value)} disabled={guardando}>
                                            <option value="">Seleccionar insumo...</option>
                                            {disponibles.filter((insumo) => String(insumo.id) === seleccionado.insumo_id || !idsSeleccionados.includes(String(insumo.id))).map((insumo) => (
                                                <option key={insumo.id} value={insumo.id}>
                                                    {insumo.nombre} ({insumo.unidad_medida.nombre})
                                                </option>
                                            ))}
                                            {insumoActual && !insumoActual.activo && (
                                                <option value={insumoActual.id}>{insumoActual.nombre} (Inactivo)</option>
                                            )}
                                        </Form.Select>
                                    </Col>

                                    <Col md={4}>
                                        <Form.Label className="fw-bold">Cantidad utilizada {insumoActual ? `(${insumoActual.unidad_medida.nombre})` : ""}</Form.Label>
                                        <Form.Control
                                            type="number"
                                            min="0.001"
                                            step="0.001"
                                            placeholder="Cantidad"
                                            value={seleccionado.cantidad_utilizada}
                                            onChange={(e) => actualizarFila(index, "cantidad_utilizada", e.target.value)}
                                            disabled={guardando}
                                        />
                                    </Col>

                                    <Col md={2}>
                                        <Button variant="outline-danger" onClick={() => quitarFila(index)} disabled={guardando || seleccionados.length === 1} title="Quitar insumo">
                                            <i className="bi bi-trash"></i>
                                        </Button>
                                    </Col>
                                </Row>
                            );
                        })}

                        <Button variant="outline-primary" size="sm" onClick={agregarFila} disabled={guardando || seleccionados.length >= disponibles.length}>
                            <i className="bi bi-plus-circle me-1"></i>Agregar otro insumo
                        </Button>
                    </>
                )}
            </Modal.Body>

            <Modal.Footer className="justify-content-start">
                <Button variant="secondary" onClick={onHide} disabled={guardando}>
                    <i className="bi bi-x-circle me-1"></i>Cancelar
                </Button>
                <Button variant="primary" onClick={guardar} disabled={guardando || isLoading || !!error || disponibles.length === 0}>
                    <i className="bi bi-floppy me-1"></i>{guardando ? "Guardando..." : editando ? "Guardar cambios" : "Asociar insumos"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
