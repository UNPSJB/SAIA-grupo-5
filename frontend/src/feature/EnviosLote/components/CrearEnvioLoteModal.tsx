import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { api } from '../../../libs/axios';
import { useApi } from '../../../hooks/useApi';
import { mostrarAlertaError, mostrarAlertaExito } from '../../../libs/alertas';
import type { LoteProduccion } from '../../LotesProduccion/types';
import type { EnvioLoteCreate } from '../types';
import type { Cliente } from '../../Clientes/types';
import type { DireccionCliente } from '../../Clientes/types';

interface CrearEnvioModalProps {
    lote: LoteProduccion | null;
    onHide: () => void;
    onEnviado: () => void;
}

interface CrearEnvioFormData {
    cliente_id: string;
    direccion_cliente_id: string;
    cantidad: number | string;
    numero_remito: string;
    transportista: string;
    fecha_envio: string;
}

export function CrearEnvioModal({ lote, onHide, onEnviado }: CrearEnvioModalProps) {
    const [cargando, setCargando] = useState(false);

    const {register, handleSubmit, watch, setValue, formState: { errors }, reset} = useForm<CrearEnvioFormData>({
        defaultValues: {
            cliente_id: "",
            direccion_cliente_id: "",
            cantidad: "",
            numero_remito: "",
            transportista: "",
            fecha_envio: "",
        },
    });

    const clienteIdWatch = watch("cliente_id");

    const { data: clientes } = useApi<Cliente[]>("/clientes/");
    const clientesActivos = clientes?.filter((c) => c.activo) ?? [];

    const { data: direcciones } = useApi<DireccionCliente[]>(
        clienteIdWatch ? `/direcciones-cliente/cliente/${clienteIdWatch}` : null);

    const { data: dataRemito } = useApi<{ proximo_remito: string }>("/envios-lote/proximo-remito");

    const direccionesActivas = direcciones?.filter((d) => d.activo) ?? [];

    const handleClienteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setValue("cliente_id", e.target.value, { shouldValidate: true });
        setValue("direccion_cliente_id", "", { shouldValidate: true });
    };

    const handleClose = () => {
        reset();
        onHide();
    };

    const onSubmit = async (data: CrearEnvioFormData) => {
        if (!lote) return;

        setCargando(true);
        try {
            const datos: EnvioLoteCreate = {
                lote_id: lote.id,
                cliente_id: Number(data.cliente_id),
                direccion_cliente_id: Number(data.direccion_cliente_id),
                cantidad: Number(data.cantidad),
                numero_remito: data.numero_remito.trim(),
                transportista: data.transportista.trim(),
                fecha_envio: data.fecha_envio,
            };

            await api.post("/envios-lote/", datos);

            mostrarAlertaExito("El envio se registro correctamente.");
            onEnviado();
        } catch (error: any) {
            let mensajeFinal = `No se pudo registrar el despacho para el lote #${lote.id}.`;
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        } finally {
            setCargando(false);
            handleClose();
        }
    };

    const stockDisponible = lote?.cantidad_disponible ?? lote?.cantidad_producida ?? 0;

    return (
        <Modal show={!!lote} onHide={handleClose} backdrop="static">
            <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Modal.Header closeButton>
                    <Modal.Title>Despachar Lote de Produccion #{lote?.id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-1"><strong>Producto:</strong> {lote?.producto.nombre}</p>
                    <p className="mb-1">
                        <strong>Stock Disponible:</strong>{" "}
                        <span className="text-success fw-bold">{stockDisponible}</span> / {lote?.cantidad_producida} unidades
                    </p>
                    <p className="mb-1"><strong>Fecha de Produccion:</strong> {lote?.fecha_produccion.split("-").reverse().join("/")}</p>
                    <hr />

                    <Form.Group className="mb-3 text-start" controlId="formCliente">
                        <Form.Label className="p-1 fw-bold">Cliente *</Form.Label>
                        <Form.Select
                            {...register("cliente_id", { required: "Debe seleccionar un cliente." })}
                            onChange={handleClienteChange}
                            isInvalid={!!errors.cliente_id}
                        >
                            <option value="">Seleccione un cliente...</option>
                            {clientesActivos.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.razon_social} (CUIT: {c.cuit})
                                </option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">{errors.cliente_id?.message}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3 text-start" controlId="formDireccion">
                        <Form.Label className="p-1 fw-bold">Direccion de Entrega *</Form.Label>
                        <Form.Select
                            disabled={!clienteIdWatch}
                            {...register("direccion_cliente_id", { required: "Debe seleccionar una direccion de entrega." })}
                            isInvalid={!!errors.direccion_cliente_id}
                        >
                            <option value="">
                                {!clienteIdWatch ? "Primero elija un cliente..." : "Seleccione una direccion..."}
                            </option>
                            {direccionesActivas.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.calle_altura} - {d.localidad} ({d.descripcion})
                                </option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">{errors.direccion_cliente_id?.message}</Form.Control.Feedback>
                    </Form.Group>

                    <Row>
                        <Col sm={6}>
                            <Form.Group className="mb-3 text-start" controlId="formRemito">
                                <Form.Label className="p-1 fw-bold">Número de Remito</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={dataRemito?.proximo_remito ?? "Calculando..."}
                                    disabled
                                    readOnly
                                    className="bg-light font-monospace text-muted"
                                />
                                <Form.Text className="text-muted" style={{ fontSize: "0.8rem" }}>
                                    Asignado automáticamente por el sistema.
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        <Col sm={6}>
                            <Form.Group className="mb-3 text-start" controlId="formFechaEnvio">
                                <Form.Label className="p-1 fw-bold">Fecha de Envío *</Form.Label>
                                <Form.Control
                                    type="date"
                                    min={lote?.fecha_produccion}
                                    {...register("fecha_envio", {
                                        required: "La fecha de envío es obligatoria.",
                                        validate: (f) =>
                                            !lote?.fecha_produccion ||
                                            f >= lote.fecha_produccion ||
                                            "La fecha no puede ser anterior a la producción.",
                                    })}
                                    isInvalid={!!errors.fecha_envio}
                                />
                                <Form.Control.Feedback type="invalid">{errors.fecha_envio?.message}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>


                    <Row>
                        <Col sm={6}>
                            <Form.Group className="mb-3 text-start" controlId="formCantidad">
                                <Form.Label className="p-1 fw-bold">Cantidad a Enviar *</Form.Label>
                                <Form.Control
                                    type="number"
                                    min={1}
                                    max={stockDisponible}
                                    placeholder="Ej: 50"
                                    {...register("cantidad", {
                                        required: "La cantidad es obligatoria.",
                                        min: { value: 1, message: "La cantidad debe ser mayor a 0." },
                                        max: {
                                            value: stockDisponible,
                                            message: `No puede superar el stock disponible (${stockDisponible}).`,
                                        },
                                    })}
                                    isInvalid={!!errors.cantidad}
                                />
                                <Form.Control.Feedback type="invalid">{errors.cantidad?.message}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col sm={6}>
                            <Form.Group className="mb-3 text-start" controlId="formTransportista">
                                <Form.Label className="p-1 fw-bold">Transportista *</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ej: Expreso Trelew"
                                    {...register("transportista", {
                                        required: "El transportista es obligatorio.",
                                        maxLength: { value: 100, message: "No puede superar los 100 caracteres." },
                                        validate: (v) => v.trim() !== "" || "El transportista no puede tener solo espacios.",
                                    })}
                                    isInvalid={!!errors.transportista}
                                />
                                <Form.Control.Feedback type="invalid">{errors.transportista?.message}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer className="justify-content-start">
                    <Button variant="secondary" onClick={handleClose} disabled={cargando}>
                        <i className="bi bi-x-circle me-1"></i>Cancelar
                    </Button>
                    <Button variant="primary" type="submit" disabled={cargando}>
                        <i className="bi bi-truck me-1"></i>Confirmar Despacho
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}