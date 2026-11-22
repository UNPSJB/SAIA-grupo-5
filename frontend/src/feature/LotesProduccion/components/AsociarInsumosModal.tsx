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
    const { data: insumosLote, isLoading } = useApi<InsumoLote[]>("/insumos-lote/");
    const esEdicion = insumosAsociados.length > 0;

    const cantidadesPrevias = new Map<number, number>();
    for (const item of insumosAsociados) {
        cantidadesPrevias.set(Number(item.insumo_lote_id), Number(item.cantidad_utilizada));
    }

    const [filas, setFilas] = useState<InsumoFila[]>(
        esEdicion
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
        const cantidadPrevia = cantidadesPrevias.get(insumo.id) ?? 0;
        const stockEfectivo = insumo.cantidad_restante + cantidadPrevia;

        if (stockEfectivo <= 0) return false;

        const estaActivoEfectivo = insumo.activo || cantidadPrevia > 0;
        if (!estaActivoEfectivo) return false;

        if (insumo.insumo?.activo === false && cantidadPrevia === 0) return false;

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
            mostrarAlertaError("Selecciona un lote de insumo e ingresa una cantidad mayor a cero.");
            return;
        }

        for (const f of filas) {
            const loteEncontrado = disponibles.find((d) => String(d.id) === f.insumo_lote_id);
            if (loteEncontrado) {
                const stockMaximo = loteEncontrado.cantidad_restante + (cantidadesPrevias.get(loteEncontrado.id) ?? 0);
                if (Number(f.cantidad_utilizada) > stockMaximo) {
                    mostrarAlertaError(
                        `Stock insuficiente para ${loteEncontrado.insumo.nombre} (${loteEncontrado.marca}). Disponible: ${stockMaximo}`
                    );
                    return;
                }
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

            if (esEdicion) {
                await api.put(`/lotes-produccion/${loteId}/insumos`, payload);
            } else {
                await api.post(`/lotes-produccion/${loteId}/insumos`, payload);
            }

            mostrarAlertaExito("Los insumos se asociaron y actualizaron en el stock correctamente.");
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
                <Modal.Title>{esEdicion ? "Modificar" : "Asociar"} Insumos del Lote #{loteId}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {isLoading ? (
                    <p>Cargando stock de insumos...</p>
                ) : disponibles.length === 0 ? (
                    <p className="text-danger mb-0">
                        No hay insumos disponibles que cumplan con la fecha minima de vencimiento (minimo 15 dias de vida util) y stock disponible.
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
                                                .map((d) => {
                                                    const stockEfectivo = d.cantidad_restante + (cantidadesPrevias.get(d.id) ?? 0);
                                                    return (
                                                        <option key={d.id} value={d.id}>
                                                            {d.insumo.nombre} - Marca: {d.marca} (Disp: {stockEfectivo} | Vence: {d.fecha_vencimiento.split("-").reverse().join("/")})
                                                        </option>
                                                    );
                                                })}
                                        </Form.Select>
                                    </Col>

                                    <Col md={3}>
                                        <Form.Label className="fw-bold">
                                            Cantidad {insumoActual ? `(${insumoActual.insumo.unidad_medida?.nombre || "Unidades"})` : ""}
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
