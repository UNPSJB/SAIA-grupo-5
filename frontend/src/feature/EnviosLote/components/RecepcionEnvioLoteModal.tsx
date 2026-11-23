import { useEffect, useState } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { mutate } from 'swr';
import { useApi } from '../../../hooks/useApi';
import { mostrarAlertaError, mostrarAlertaExito } from '../../../libs/alertas';
import { api } from '../../../libs/axios';
import type { TipoIncidente } from '../../TiposIncidentes/types';
import type { EnvioLote, EnvioLoteUpdate } from '../types';

interface RecepcionEnvioModalProps {
    envio: EnvioLote | null;
    onHide: () => void;
    onRecepcionado: () => void;
}

interface RecepcionEnvioFormData {
    recibido: string;
    fecha_entrega: string;
    observaciones: string;
    tipo_incidente_id?: string;
    incidente_titulo?: string;
    incidente_descripcion?: string;
}

export function RecepcionEnvioModal({ envio, onHide, onRecepcionado }: RecepcionEnvioModalProps) {
    const [cargando, setCargando] = useState(false);
    const { data: tiposIncidentes } = useApi<TipoIncidente[]>('/tipos-incidentes/');

    const { register, handleSubmit, watch, formState: { errors }, reset, setValue } = useForm<RecepcionEnvioFormData>({
        defaultValues: {
            recibido: 'true',
            fecha_entrega: '',
            observaciones: '',
            tipo_incidente_id: '',
            incidente_titulo: '',
            incidente_descripcion: '',
        },
    });

    const recibidoWatch = watch('recibido') === 'true';

    useEffect(() => {
        if (envio) {
            setValue('incidente_titulo', `Rechazo envio remito ${envio.numero_remito}`);
        }
    }, [envio, setValue]);

    const handleClose = () => {
        reset();
        onHide();
    };

    const onSubmit = async (data: RecepcionEnvioFormData) => {
        if (!envio) return;

        setCargando(true);
        try {
            const esRecibido = data.recibido === 'true';
            const datos: EnvioLoteUpdate = {
                recibido: esRecibido,
                fecha_entrega: data.fecha_entrega,
                observaciones: data.observaciones ? data.observaciones.trim() : null,
            };

            await api.patch(`/envios-lote/${envio.id}/recepcion`, datos);

            if (!esRecibido) {
                const nuevoIncidente = {
                    tipo_id: Number(data.tipo_incidente_id),
                    nombre: data.incidente_titulo?.trim() || `Rechazo envio remito ${envio.numero_remito}`,
                    descripcion: data.incidente_descripcion?.trim() || data.observaciones?.trim() || 'Envio rechazado por el cliente.',
                    lote_produccion_id: envio.lote_id,
                    sector_id: null,
                    foto_opcional: null,
                };
                await api.post('/incidentes/', nuevoIncidente);
                await mutate('/incidentes/');
                await mutate(`/incidentes?lote_produccion_id=${envio.lote_id}`);
                mostrarAlertaExito(
                    'El envio fue marcado como rechazado, el stock se reintegro y se registro el incidente de calidad exitosamente.'
                );
            } else {
                mostrarAlertaExito('La entrega del envio se registro correctamente.');
            }

            onRecepcionado();
            handleClose();
        } catch (error: any) {
            let mensajeFinal = `No se pudo registrar la recepcion del envio #${envio.numero_remito}.`;
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        } finally {
            setCargando(false);
        }
    };

    return (
        <Modal show={!!envio} onHide={handleClose} backdrop="static">
            <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Modal.Header closeButton>
                    <Modal.Title>Recepcion de Envio - Remito {envio?.numero_remito}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-1"><strong>Cliente:</strong> {envio?.cliente.razon_social}</p>
                    <p className="mb-1"><strong>Cantidad enviada:</strong> {envio?.cantidad} unidades</p>
                    <p className="mb-1"><strong>Transportista:</strong> {envio?.transportista}</p>
                    <p className="mb-1"><strong>Fecha de despacho:</strong> {envio?.fecha_envio.split('-').reverse().join('/')}</p>
                    <hr />

                    <Form.Group className="mb-3 text-start">
                        <Form.Label className="p-1 fw-bold">Resultado de la Entrega *</Form.Label>
                        <div className="d-flex gap-4">
                            <Form.Check
                                type="radio"
                                id="recibido-si"
                                label="Entregado conforme"
                                value="true"
                                {...register('recibido')}
                            />
                            <Form.Check
                                type="radio"
                                id="recibido-no"
                                label="Rechazado (reintegra stock)"
                                value="false"
                                {...register('recibido')}
                            />
                        </div>
                    </Form.Group>

                    <Form.Group className="mb-3 text-start" controlId="formFechaEntrega">
                        <Form.Label className="p-1 fw-bold">Fecha de Recepcion / Rechazo *</Form.Label>
                        <Form.Control
                            type="date"
                            min={envio?.fecha_envio}
                            {...register('fecha_entrega', {
                                required: 'La fecha de entrega o rechazo es obligatoria.',
                                validate: (f) => {
                                    if (envio?.fecha_envio && f < envio.fecha_envio) {
                                        return 'La fecha no puede ser anterior a la de envio.';
                                    }
                                    return true;
                                },
                            })}
                            isInvalid={!!errors.fecha_entrega}
                        />
                        <Form.Control.Feedback type="invalid">{errors.fecha_entrega?.message}</Form.Control.Feedback>
                    </Form.Group>

                    {recibidoWatch ? (
                        <Form.Group className="mb-3 text-start" controlId="formObservaciones">
                            <Form.Label className="p-1 fw-bold">Observaciones</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Escribi una observacion de la entrega..."
                                {...register('observaciones', {
                                    maxLength: { value: 500, message: 'No puede superar los 500 caracteres.' },
                                    validate: (v) => !v || v.trim() !== '' || 'La observacion no puede ser solo espacios en blanco.',
                                })}
                                isInvalid={!!errors.observaciones}
                            />
                            <Form.Control.Feedback type="invalid">{errors.observaciones?.message}</Form.Control.Feedback>
                        </Form.Group>
                    ) : (
                        <section className="p-3 border rounded bg-light-subtle mb-3">
                            <Alert variant="warning" className="small mb-3">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                Al rechazar la entrega se reintegrara el stock al lote y es obligatorio registrar el incidente de calidad correspondiente.
                            </Alert>

                            <Form.Group className="mb-3 text-start" controlId="formTipoIncidente">
                                <Form.Label className="p-1 fw-bold">Tipo de Incidente *</Form.Label>
                                <Form.Select
                                    {...register('tipo_incidente_id', {
                                        required: !recibidoWatch ? 'Debes seleccionar un tipo de incidente.' : false,
                                    })}
                                    isInvalid={!recibidoWatch && !!errors.tipo_incidente_id}
                                >
                                    <option value="">Selecciona el tipo de desvio...</option>
                                    {(tiposIncidentes ?? []).filter((t) => t.activo).map((tipo) => (
                                        <option key={tipo.id} value={tipo.id}>
                                            {tipo.nombre}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{errors.tipo_incidente_id?.message}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3 text-start" controlId="formTituloIncidente">
                                <Form.Label className="p-1 fw-bold">Titulo del Incidente *</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ej. Rechazo de mercaderia por desvio de temperatura"
                                    {...register('incidente_titulo', {
                                        required: !recibidoWatch ? 'El titulo del incidente es obligatorio.' : false,
                                        maxLength: { value: 60, message: 'No puede superar los 60 caracteres.' },
                                    })}
                                    isInvalid={!recibidoWatch && !!errors.incidente_titulo}
                                />
                                <Form.Control.Feedback type="invalid">{errors.incidente_titulo?.message}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3 text-start" controlId="formDescripcionIncidente">
                                <Form.Label className="p-1 fw-bold">Detalle del Rechazo / Incidente *</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Detalla lo sucedido informado por el cliente..."
                                    {...register('incidente_descripcion', {
                                        required: !recibidoWatch ? 'El detalle del incidente es obligatorio.' : false,
                                        maxLength: { value: 500, message: 'No puede superar los 500 caracteres.' },
                                        validate: (v) => !v || v.trim() !== '' || 'No puede contener solo espacios en blanco.',
                                    })}
                                    isInvalid={!recibidoWatch && !!errors.incidente_descripcion}
                                />
                                <Form.Control.Feedback type="invalid">{errors.incidente_descripcion?.message}</Form.Control.Feedback>
                            </Form.Group>
                        </section>
                    )}
                </Modal.Body>
                <Modal.Footer className="justify-content-start">
                    <Button variant="secondary" onClick={handleClose} disabled={cargando}>
                        <i className="bi bi-x-circle me-1"></i>Cancelar
                    </Button>
                    <Button variant={recibidoWatch ? 'primary' : 'danger'} type="submit" disabled={cargando}>
                        <i className={`bi ${recibidoWatch ? 'bi-check-circle' : 'bi-shield-exclamation'} me-1`}></i>
                        {recibidoWatch ? 'Confirmar Entrega' : 'Confirmar Rechazo e Incidente'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
