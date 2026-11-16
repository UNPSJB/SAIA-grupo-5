import { useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks/useApi";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import type { InsumoLote } from "../../InsumosLote/types";

interface AsociarInsumosModalProps {
    loteId: number;
    insumosAsociados: any[];
    onHide: () => void;
    onAsociado: () => void;
}

interface InsumoFila {
    insumo_lote_id: string;
    cantidad_utilizada: string;
}

export function AsociarInsumosModal({ loteId, insumosAsociados, onHide, onAsociado }: AsociarInsumosModalProps) {
    const { data: insumosLote, isLoading, error } = useApi<InsumoLote[]>("/insumos-lote/");

    const [filas, setFilas] = useState<InsumoFila[]>(
        insumosAsociados.length > 0
            ? insumosAsociados.map((item) => ({
                  insumo_lote_id: String(item.insumo_lote_id),
                  cantidad_utilizada: String(item.cantidad_utilizada),
              }))
            : [{ insumo_lote_id: "", cantidad_utilizada: "" }]
    );
    const [guardando, setGuardando] = useState(false);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const disponibles = (insumosLote ?? []).filter((insumo) => {
        if (!insumo.activo || insumo.cantidad_restante <= 0) return false;

        const partes = insumo.fecha_vencimiento.split("-");
        const fVenc = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
        fVenc.setHours(0, 0, 0, 0);

        const diasRestantes = Math.round((fVenc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
        return diasRestantes >= 15;
    });

    const idsSeleccionados = filas.map((f) => f.insumo_lote_id).filter(Boolean);

    const agregarFila = () => {
        if (filas.length >= disponibles.length) return;
        setFilas([...filas, { insumo_lote_id: "", cantidad_utilizada: "" }]);
    };

    const quitarFila = (index: number) => {
        if (filas.length <= 1) return;
        setFilas(filas.filter((_, i) => i !== index));
    };

    const actualizarFila = (index: number, campo: keyof InsumoFila, valor: string) => {
        setFilas(filas.map((f, i) => (i === index ? { ...f, [campo]: valor } : f)));
    };

    const guardar = async () => {
        if (filas.some((f) => !f.insumo_lote_id || Number(f.cantidad_utilizada) <= 0)) {
            mostrarAlertaError("Seleccioná un lote de insumo e ingresá una cantidad mayor a cero.");
            return;
        }

        for (const f of filas) {
            const loteEncontrado = disponibles.find((d) => String(d.id) === f.insumo_lote_id);
            if (loteEncontrado && Number(f.cantidad_utilizada) > loteEncontrado.cantidad_restante) {
                mostrarAlertaError(
                    `Stock insuficiente para ${loteEncontrado.insumo.nombre} (${loteEncontrado.marca}). Disponible: ${loteEncontrado.cantidad_restante}`
                );
                return;
            }
        }

        setGuardando(true);
        try {
            const payload = {
                insumos: filas.map((f) => ({
                    insumo_lote_id: Number(f.insumo_lote_id),
                    cantidad_utilizada: f.cantidad_utilizada,
                })),
            };

            await api.post(`/lotes-produccion/${loteId}/insumos`, payload);
            mostrarAlertaExito("Los insumos se asociaron y descontaron del stock correctamente.");
            onAsociado();
        } catch (err: any) {
            mostrarAlertaError(err?.response?.data?.detail || "No se pudieron asociar los insumos.");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Modal show onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Asociar Insumos al Lote #{loteId}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {isLoading ? (
                    <p>Cargando stock de insumos...</p>
                ) : disponibles.length === 0 ? (
                    <p className="text-danger mb-0">
                        No hay insumos disponibles que cumplan con la fecha mínima de vencimiento (mínimo 15 días de vida útil) y stock disponible.
                    </p>
                ) : (
                    <>
                        {filas.map((fila, index) => {
                            const insumoActual = disponibles.find((d) => String(d.id) === fila.insumo_lote_id);

                            return (
                                <Row key={index} className="mb-3 g-2 align-items-end">
                                    <Col md={7}>
                                        <Form.Label className="fw-bold">Insumo Lote Disponible</Form.Label>
                                        <Form.Select
                                            value={fila.insumo_lote_id}
                                            onChange={(e) => actualizarFila(index, "insumo_lote_id", e.target.value)}
                                            disabled={guardando}
                                        >
                                            <option value="">Seleccionar lote de insumo...</option>
                                            {disponibles
                                                .filter(
                                                    (d) =>
                                                        String(d.id) === fila.insumo_lote_id ||
                                                        !idsSeleccionados.includes(String(d.id))
                                                )
                                                .map((d) => (
                                                    <option key={d.id} value={d.id}>
                                                        {d.insumo.nombre} - Marca: {d.marca} (Disp: {d.cantidad_restante} | Vence: {d.fecha_vencimiento.split("-").reverse().join("/")})
                                                    </option>
                                                ))}
                                        </Form.Select>
                                    </Col>

                                    <Col md={3}>
                                        <Form.Label className="fw-bold">
                                            Cantidad {insumoActual ? `(${insumoActual.insumo.unidad_medida?.nombre || 'U'})` : ""}
                                        </Form.Label>
                                        <Form.Control
                                            type="number"
                                            min="1"
                                            step="1"
                                            placeholder="Cantidad"
                                            value={fila.cantidad_utilizada}
                                            onChange={(e) => actualizarFila(index, "cantidad_utilizada", e.target.value)}
                                            disabled={guardando}
                                        />
                                    </Col>

                                    <Col md={2}>
                                        <Button
                                            variant="outline-danger"
                                            onClick={() => quitarFila(index)}
                                            disabled={guardando || filas.length === 1}
                                            title="Quitar"
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
                            disabled={guardando || filas.length >= disponibles.length}
                        >
                            <i className="bi bi-plus-circle me-1"></i>Agregar otro insumo
                        </Button>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer className="justify-content-start">
                <Button variant="secondary" onClick={onHide} disabled={guardando}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={guardar} disabled={guardando || disponibles.length === 0}>
                    Guardar y Descontar Stock
                </Button>
            </Modal.Footer>
        </Modal>
    );
}