import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { api } from '../../../libs/axios';
import { mostrarAlertaError, mostrarAlertaExito } from '../../../libs/alertas';
import { postInsumoLote } from './InsumoLoteService';
import type { InsumoLote } from '../types';
import type { PedidoProveedorItem } from '../../PedidosProveedor/types';

interface InsumoCatalogo {
    id: number;
    nombre: string;
    unidad_medida: {
        id: number;
        nombre: string;
    };
    activo: boolean;
}

interface AgregarInsumoLoteModalProps {
    show: boolean;
    loteProveedorId: number;
    insumosYaRegistrados: InsumoLote[];
    itemsPedido?: PedidoProveedorItem[];
    onHide: () => void;
    onGuardado: () => void;
}

interface InsumoLoteFormData {
    insumo_id: number;
    numero_lote: string;
    marca: string;
    cantidad: number;
    fecha_vencimiento: string;
    costo_unitario?: number | null;
    minimo_alerta: number;
}

export function AgregarInsumoLoteModal({show, loteProveedorId, insumosYaRegistrados, itemsPedido, onHide, onGuardado,}: AgregarInsumoLoteModalProps) {
    const [insumosCatalogo, setInsumosCatalogo] = useState<InsumoCatalogo[]>([]);
    const [cargando, setCargando] = useState(false);

    const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<InsumoLoteFormData>({
        defaultValues: {
            insumo_id: undefined,
            numero_lote: '',
            marca: '',
            cantidad: '' as any,
            fecha_vencimiento: '',
            costo_unitario: null,
            minimo_alerta: '' as any,
        },
    });

    useEffect(() => {
        if (!show) return;

        const cargarInsumos = async () => {
            try {
                const response = await api.get('/insumos/');
                setInsumosCatalogo(response.data.filter((i: InsumoCatalogo) => i.activo));
            } catch (error) {
                console.error('Error al cargar insumos de catalogo:', error);
            }
        };

        cargarInsumos();
    }, [show]);

    const idsYaRegistrados = new Set(insumosYaRegistrados.map((item) => item.insumo_id));

    const insumosDisponibles = insumosCatalogo.filter((insumo) => {
        if (idsYaRegistrados.has(insumo.id)) return false;
        if (itemsPedido && itemsPedido.length > 0) {
            return itemsPedido.some((pItem) => pItem.insumo_id === insumo.id);
        }
        return true;
    });

    const insumoSeleccionadoId = watch('insumo_id');
    const insumoSeleccionado = insumosDisponibles.find((i) => Number(i.id) === Number(insumoSeleccionadoId));
    const itemPedidoSeleccionado = itemsPedido?.find((pItem) => Number(pItem.insumo_id) === Number(insumoSeleccionadoId));
    const unidadMedida = insumoSeleccionado?.unidad_medida?.nombre || 'Unidades';

    const fechaMinima = new Date();
    fechaMinima.setDate(fechaMinima.getDate() + 1);
    const fechaMinimaStr = fechaMinima.toISOString().split('T')[0];

    const onSubmit = async (data: InsumoLoteFormData) => {
        setCargando(true);
        try {
            const payload = {
                insumo_id: Number(data.insumo_id),
                numero_lote: data.numero_lote.trim(),
                marca: data.marca.trim(),
                cantidad: Number(data.cantidad),
                fecha_vencimiento: data.fecha_vencimiento,
                minimo_alerta: Number(data.minimo_alerta),
                costo_unitario: data.costo_unitario ? Number(data.costo_unitario) : null,
            };

            await postInsumoLote(loteProveedorId, payload);

            mostrarAlertaExito('El insumo se agrego correctamente a la recepcion.');
            onGuardado();
            handleClose();
        } catch (error: any) {
            let mensajeFinal = 'No se pudo registrar el insumo en la recepcion.';
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.error(error);
        } finally {
            setCargando(false);
        }
    };

    const handleClose = () => {
        reset();
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} backdrop="static">
            <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="bi bi-box-seam me-2"></i>Agregar Insumo Recibido
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {insumosDisponibles.length === 0 ? (
                        <Alert variant="info" className="mb-0">
                            Ya se registraron todos los insumos disponibles para esta recepcion.
                        </Alert>
                    ) : (
                        <>
                            <Form.Group className="mb-3 text-start" controlId="formInsumoId">
                                <Form.Label className="p-1 fw-bold">Insumo *</Form.Label>
                                <Form.Select
                                    {...register('insumo_id', {
                                        required: 'Debe seleccionar un insumo.',
                                        valueAsNumber: true,
                                    })}
                                    isInvalid={!!errors.insumo_id}
                                >
                                    <option value="">Seleccione un insumo...</option>
                                    {insumosDisponibles.map((insumo) => (
                                        <option key={insumo.id} value={insumo.id}>
                                            {insumo.nombre} ({insumo.unidad_medida?.nombre || 'Sin U.M.'})
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {errors.insumo_id?.message}
                                </Form.Control.Feedback>
                            </Form.Group>

                            {itemPedidoSeleccionado && (
                                <Form.Group className="mb-3 text-start" controlId="formCantidadPedida">
                                    <Form.Label className="p-1 fw-bold text-primary">
                                        Cantidad Solicitada en Pedido
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        disabled
                                        readOnly
                                        value={`${itemPedidoSeleccionado.cantidad_pedida} ${unidadMedida}`}
                                        className="bg-light fw-bold"
                                    />
                                </Form.Group>
                            )}

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3 text-start" controlId="formNumeroLote">
                                        <Form.Label className="p-1 fw-bold">N° de Lote (Fábrica) *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Ej: LOT-2026-09"
                                            {...register('numero_lote', {
                                                required: 'El numero de lote es obligatorio.',
                                                maxLength: {
                                                    value: 100,
                                                    message: 'No puede superar los 100 caracteres.',
                                                },
                                                validate: (v) =>
                                                    v.trim() !== '' || 'No puede ser solo espacios en blanco.',
                                            })}
                                            isInvalid={!!errors.numero_lote}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.numero_lote?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group className="mb-3 text-start" controlId="formMarca">
                                        <Form.Label className="p-1 fw-bold">Marca *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Ej: Arcor, La Serenisima"
                                            {...register('marca', {
                                                required: 'La marca es obligatoria.',
                                                maxLength: {
                                                    value: 100,
                                                    message: 'No puede superar los 100 caracteres.',
                                                },
                                                validate: (v) =>
                                                    v.trim() !== '' || 'La marca no puede ser solo espacios en blanco.',
                                            })}
                                            isInvalid={!!errors.marca}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.marca?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3 text-start" controlId="formCantidad">
                                        <Form.Label className="p-1 fw-bold">Cantidad Recibida ({unidadMedida}) *</Form.Label>
                                        <Form.Control
                                            type="number"
                                            min={1}
                                            step={1}
                                            {...register('cantidad', {
                                                required: 'La cantidad es obligatoria.',
                                                min: {
                                                    value: 1,
                                                    message: 'Debe ser al menos 1.',
                                                },
                                                validate: (v) =>
                                                    Number.isInteger(Number(v)) || 'Debe ser un número entero.',
                                            })}
                                            isInvalid={!!errors.cantidad}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.cantidad?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group className="mb-3 text-start" controlId="formMinimoAlerta">
                                        <Form.Label className="p-1 fw-bold">Alerta Stock Minimo *</Form.Label>
                                        <Form.Control
                                            type="number"
                                            min={0}
                                            step={1}
                                            {...register('minimo_alerta', {
                                                required: 'El minimo de alerta es obligatorio.',
                                                min: {
                                                    value: 0,
                                                    message: 'No puede ser negativo.',
                                                },
                                                validate: (v) =>
                                                    Number.isInteger(Number(v)) || 'Debe ser un numero entero.',
                                            })}
                                            isInvalid={!!errors.minimo_alerta}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.minimo_alerta?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3 text-start" controlId="formFechaVencimiento">
                                        <Form.Label className="p-1 fw-bold">Fecha de Vencimiento *</Form.Label>
                                        <Form.Control
                                            type="date"
                                            min={fechaMinimaStr}
                                            {...register('fecha_vencimiento', {
                                                required: 'La fecha de vencimiento es obligatoria.',
                                                validate: (v) =>
                                                    v >= fechaMinimaStr ||
                                                    'La fecha debe ser posterior al día de hoy.',
                                            })}
                                            isInvalid={!!errors.fecha_vencimiento}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.fecha_vencimiento?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group className="mb-3 text-start" controlId="formCostoUnitario">
                                        <Form.Label className="p-1 fw-bold">Costo Unitario (Opcional)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            step="0.01"
                                            min={0}
                                            placeholder="0.00"
                                            {...register('costo_unitario', {
                                                min: {
                                                    value: 0,
                                                    message: 'No puede ser negativo.',
                                                },
                                            })}
                                            isInvalid={!!errors.costo_unitario}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.costo_unitario?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer className="justify-content-start">
                    <Button variant="secondary" onClick={handleClose} disabled={cargando}>
                        <i className="bi bi-x-circle me-1"></i>Cancelar
                    </Button>
                    {insumosDisponibles.length > 0 && (
                        <Button variant="primary" type="submit" disabled={cargando}>
                            <i className="bi bi-floppy me-1"></i>Guardar Insumo
                        </Button>
                    )}
                </Modal.Footer>
            </Form>
        </Modal>
    );
}