import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { mutate } from 'swr';
import { ActionButton } from '../../../components/ActionButton';
import { useApi } from '../../../hooks/useApi';
import { mostrarAlertaError, mostrarAlertaExito } from '../../../libs/alertas';
import { api } from '../../../libs/axios';
import type { Sector } from '../../Sectores/types';
import type { TipoIncidente } from '../../TiposIncidentes/types';
import type { AlmacenamientoEquipoResponse, Equipo, RegistroTemperaturaResultado } from '../types';
import { AppSwitch } from '../../../components/AppSwitch';

interface RegistrarTemperaturaModalProps {
    equipo: Equipo | null;
    onHide: () => void;
    onRegistrado: () => void;
}

interface RegistrarTemperaturaFormData {
    temperatura_registrada: string;
    accion_tomada: string;
}

interface ItemIncidentePendiente {
    clave: string;
    tipo: 'insumo' | 'lote';
    id: number;
    etiqueta: string;
    tituloInicial: string;
    descripcionInicial: string;
}

export function RegistrarTemperaturaModal({ equipo, onHide, onRegistrado }: RegistrarTemperaturaModalProps) {
    const [guardando, setGuardando] = useState(false);
    const [almacenamientoAfectado, setAlmacenamientoAfectado] = useState<AlmacenamientoEquipoResponse | null>(null);
    const [reportados, setReportados] = useState<Record<string, boolean>>({});
    const [itemIncidenteActivo, setItemIncidenteActivo] = useState<ItemIncidentePendiente | null>(null);

    const [tipoIncidenteId, setTipoIncidenteId] = useState('');
    const [tituloIncidente, setTituloIncidente] = useState('');
    const [descripcionIncidente, setDescripcionIncidente] = useState('');
    const [guardandoIncidente, setGuardandoIncidente] = useState(false);

    const [reubicarMercaderia, setReubicarMercaderia] = useState(false);
    const [tipoDestino, setTipoDestino] = useState<'equipo' | 'sector'>('equipo');
    const [destinoEquipoId, setDestinoEquipoId] = useState('');
    const [destinoSectorId, setDestinoSectorId] = useState('');
    const [insumosSeleccionados, setInsumosSeleccionados] = useState<number[]>([]);
    const [lotesSeleccionados, setLotesSeleccionados] = useState<number[]>([]);

    const { data: almacenamientoActual } = useApi<AlmacenamientoEquipoResponse>(
        equipo ? `/equipos/${equipo.id}/almacenamiento` : null
    );
    const { data: equipos } = useApi<Equipo[]>(reubicarMercaderia ? '/equipos/' : null);
    const { data: sectores } = useApi<Sector[]>(reubicarMercaderia ? '/sectores/' : null);
    const { data: tiposIncidentes } = useApi<TipoIncidente[]>(
        almacenamientoAfectado ? '/tipos-incidentes/' : null
    );

    useEffect(() => {
        if (almacenamientoActual) {
            setInsumosSeleccionados(almacenamientoActual.insumos.map((i) => i.id));
            setLotesSeleccionados(almacenamientoActual.lotes_produccion.map((l) => l.id));
        } else {
            setInsumosSeleccionados([]);
            setLotesSeleccionados([]);
        }
    }, [almacenamientoActual]);

    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<RegistrarTemperaturaFormData>({
        defaultValues: {
            temperatura_registrada: '',
            accion_tomada: '',
        },
    });

    const tempStr = watch('temperatura_registrada');
    const tempNum = tempStr !== '' ? Number(tempStr) : null;
    const min = equipo?.temperatura_minima ?? null;
    const max = equipo?.temperatura_maxima ?? null;
    const fueraDeRango = Boolean(
        equipo?.controla_temperatura &&
        tempNum !== null &&
        !isNaN(tempNum) &&
        min !== null &&
        max !== null &&
        (tempNum < min || tempNum > max)
    );

    const tieneMercaderiaActual = Boolean(
        (almacenamientoActual?.insumos.length ?? 0) > 0 ||
        (almacenamientoActual?.lotes_produccion.length ?? 0) > 0
    );

    const toggleInsumo = (id: number) => {
        setInsumosSeleccionados((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const toggleLote = (id: number) => {
        setLotesSeleccionados((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleClose = () => {
        reset();
        setAlmacenamientoAfectado(null);
        setReportados({});
        setItemIncidenteActivo(null);
        setTipoIncidenteId('');
        setTituloIncidente('');
        setDescripcionIncidente('');
        setReubicarMercaderia(false);
        setTipoDestino('equipo');
        setDestinoEquipoId('');
        setDestinoSectorId('');
        onHide();
    };

    const abrirFormularioIncidente = (item: ItemIncidentePendiente) => {
        setItemIncidenteActivo(item);
        setTipoIncidenteId('');
        setTituloIncidente(item.tituloInicial);
        setDescripcionIncidente(item.descripcionInicial);
    };

    const guardarIncidenteItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemIncidenteActivo) return;

        if (!tipoIncidenteId || !tituloIncidente.trim() || !descripcionIncidente.trim()) {
            mostrarAlertaError('Completa el tipo, titulo y descripcion del incidente.');
            return;
        }

        setGuardandoIncidente(true);
        try {
            const payload = {
                tipo_id: Number(tipoIncidenteId),
                nombre: tituloIncidente.trim().slice(0, 60),
                descripcion: descripcionIncidente.trim().slice(0, 500),
                sector_id: equipo?.sector?.id ?? null,
                foto_opcional: null,
                lote_produccion_id: itemIncidenteActivo.tipo === 'lote' ? itemIncidenteActivo.id : null,
                insumo_lote_id: itemIncidenteActivo.tipo === 'insumo' ? itemIncidenteActivo.id : null,
                lote_proveedor_id: null,
            };

            await api.post('/incidentes/', payload);
            await mutate('/incidentes/');
            await mutate('/notificaciones/');
            if (itemIncidenteActivo.tipo === 'lote') {
                await mutate(`/incidentes?lote_produccion_id=${itemIncidenteActivo.id}`);
            } else {
                await mutate(`/incidentes?insumo_lote_id=${itemIncidenteActivo.id}`);
            }

            setReportados((prev) => ({ ...prev, [itemIncidenteActivo.clave]: true }));
            setItemIncidenteActivo(null);
            mostrarAlertaExito('Incidente registrado correctamente.');
        } catch (error: any) {
            const detail = error.response?.data?.detail;
            mostrarAlertaError(
                Array.isArray(detail) ? detail[0]?.msg : detail || 'No se pudo registrar el incidente.'
            );
        } finally {
            setGuardandoIncidente(false);
        }
    };

    const onSubmit = async (data: RegistrarTemperaturaFormData) => {
        if (!equipo) return;

        const debeReubicar = Boolean(fueraDeRango && reubicarMercaderia && tieneMercaderiaActual);
        if (debeReubicar) {
            if (tipoDestino === 'equipo' && !destinoEquipoId) {
                mostrarAlertaError('Selecciona el equipo de destino para reubicar la mercaderia.');
                return;
            }
            if (tipoDestino === 'sector' && !destinoSectorId) {
                mostrarAlertaError('Selecciona el sector de destino para reubicar la mercaderia.');
                return;
            }
            if (insumosSeleccionados.length === 0 && lotesSeleccionados.length === 0) {
                mostrarAlertaError('Selecciona al menos un lote o insumo para reubicar.');
                return;
            }
        }

        setGuardando(true);
        try {
            const payload = {
                equipo_id: equipo.id,
                temperatura_registrada: Number(data.temperatura_registrada),
                accion_tomada: data.accion_tomada.trim() || null,
                reubicar_mercaderia: debeReubicar,
                destino_equipo_id:
                    debeReubicar && tipoDestino === 'equipo' && destinoEquipoId ? Number(destinoEquipoId) : null,
                destino_sector_id:
                    debeReubicar && tipoDestino === 'sector' && destinoSectorId ? Number(destinoSectorId) : null,
                insumos_ids_a_mover: debeReubicar ? insumosSeleccionados : null,
                lotes_ids_a_mover: debeReubicar ? lotesSeleccionados : null,
            };
            const response = await api.post<RegistroTemperaturaResultado>('/registros-temperatura/', payload);
            const resultado = response.data;

            await mutate(`/registros-temperatura/equipo/${equipo.id}`);
            await mutate('/registros-temperatura/pendientes-hoy');
            await mutate('/notificaciones/');
            if (debeReubicar) {
                await mutate(`/equipos/${equipo.id}/almacenamiento`);
                if (payload.destino_equipo_id) {
                    await mutate(`/equipos/${payload.destino_equipo_id}/almacenamiento`);
                }
                await mutate('/insumos-lote/');
                await mutate('/lotes-produccion/');
            }
            onRegistrado();

            if (resultado.fuera_de_rango) {
                mostrarAlertaExito(
                    debeReubicar
                        ? 'Registro guardado, alerta generada y mercaderia reubicada correctamente.'
                        : 'Registro guardado. Se genero la alerta de temperatura fuera de rango.'
                );
                const tieneInsumos = (resultado.almacenamiento_afectado?.insumos.length ?? 0) > 0;
                const tieneLotes = (resultado.almacenamiento_afectado?.lotes_produccion.length ?? 0) > 0;
                if (tieneInsumos || tieneLotes) {
                    setAlmacenamientoAfectado(resultado.almacenamiento_afectado || null);
                    return;
                }
            } else {
                mostrarAlertaExito('Temperatura registrada correctamente dentro del rango.');
            }
            handleClose();
        } catch (error: any) {
            const detail = error.response?.data?.detail;
            mostrarAlertaError(
                Array.isArray(detail) ? detail[0]?.msg : detail || 'No se pudo registrar la temperatura.'
            );
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Modal show={!!equipo} onHide={handleClose} centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    {itemIncidenteActivo
                        ? 'Registrar Incidente de Calidad'
                        : `Registrar Temperatura - ${equipo?.nombre}`}
                </Modal.Title>
            </Modal.Header>

            {itemIncidenteActivo ? (
                <Form onSubmit={guardarIncidenteItem} noValidate>
                    <Modal.Body>
                        <Alert variant="info" className="small mb-3 py-2">
                            Asociado a: <strong>{itemIncidenteActivo.etiqueta}</strong>
                        </Alert>

                        <Form.Group className="mb-3 text-start">
                            <Form.Label className="fw-bold small">Tipo de Incidente *</Form.Label>
                            <Form.Select
                                value={tipoIncidenteId}
                                onChange={(e) => setTipoIncidenteId(e.target.value)}
                                disabled={guardandoIncidente}
                            >
                                <option value="">Selecciona un tipo...</option>
                                {(tiposIncidentes ?? []).filter((t) => t.activo).map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.nombre}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3 text-start">
                            <Form.Label className="fw-bold small">Titulo del Incidente *</Form.Label>
                            <Form.Control
                                type="text"
                                maxLength={60}
                                value={tituloIncidente}
                                onChange={(e) => setTituloIncidente(e.target.value)}
                                disabled={guardandoIncidente}
                            />
                        </Form.Group>

                        <Form.Group className="text-start">
                            <Form.Label className="fw-bold small">Descripcion *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                maxLength={500}
                                value={descripcionIncidente}
                                onChange={(e) => setDescripcionIncidente(e.target.value)}
                                disabled={guardandoIncidente}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="justify-content-start">
                        <Button
                            variant="secondary"
                            type="button"
                            onClick={() => setItemIncidenteActivo(null)}
                            disabled={guardandoIncidente}
                        >
                            <i className="bi bi-arrow-left me-1"></i>Volver a la lista
                        </Button>
                        <Button variant="danger" type="submit" disabled={guardandoIncidente}>
                            <i className="bi bi-floppy me-1"></i>
                            {guardandoIncidente ? 'Guardando...' : 'Guardar Incidente'}
                        </Button>
                    </Modal.Footer>
                </Form>
            ) : almacenamientoAfectado ? (
                <>
                    <Modal.Body>
                        <Alert variant="danger" className="mb-3">
                            <strong>Alerta de Cadena de Frio:</strong> El equipo salio de rango y contiene mercaderia almacenada actualmente:
                        </Alert>

                        {almacenamientoAfectado.insumos.length > 0 && (
                            <div className="mb-3">
                                <h6 className="fw-bold small text-uppercase text-secondary mb-2">
                                    Insumos Alimenticios ({almacenamientoAfectado.insumos.length})
                                </h6>
                                <div className="d-flex flex-column gap-2">
                                    {almacenamientoAfectado.insumos.map((insumo) => {
                                        const clave = `insumo-${insumo.id}`;
                                        const yaReportado = Boolean(reportados[clave]);
                                        return (
                                            <div
                                                key={insumo.id}
                                                className="d-flex justify-content-between align-items-center p-2 border rounded bg-light-subtle small"
                                            >
                                                <div>
                                                    <strong>{insumo.insumo_nombre}</strong> ({insumo.marca}) - Lote {insumo.numero_lote} ({insumo.cantidad_restante} {insumo.unidad_medida})
                                                </div>
                                                {yaReportado ? (
                                                    <Badge bg="success">Incidente registrado</Badge>
                                                ) : (
                                                    <ActionButton
                                                        variant="outline-danger"
                                                        size="sm"
                                                        tooltip="Registrar incidente"
                                                        icon="bi-exclamation-diamond"
                                                        onClick={() =>
                                                            abrirFormularioIncidente({
                                                                clave,
                                                                tipo: 'insumo',
                                                                id: insumo.id,
                                                                etiqueta: `${insumo.insumo_nombre} (${insumo.marca}) - Lote ${insumo.numero_lote}`,
                                                                tituloInicial: `Desvio termico ${insumo.insumo_nombre}`.slice(0, 60),
                                                                descripcionInicial: `El insumo ${insumo.insumo_nombre} (lote ${insumo.numero_lote}) estuvo expuesto a temperatura fuera de rango en ${equipo?.nombre}.`,
                                                            })
                                                        }
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {almacenamientoAfectado.lotes_produccion.length > 0 && (
                            <div>
                                <h6 className="fw-bold small text-uppercase text-secondary mb-2">
                                    Lotes de Produccion ({almacenamientoAfectado.lotes_produccion.length})
                                </h6>
                                <div className="d-flex flex-column gap-2">
                                    {almacenamientoAfectado.lotes_produccion.map((lote) => {
                                        const clave = `lote-${lote.id}`;
                                        const yaReportado = Boolean(reportados[clave]);
                                        return (
                                            <div
                                                key={lote.id}
                                                className="d-flex justify-content-between align-items-center p-2 border rounded bg-light-subtle small"
                                            >
                                                <div>
                                                    <strong>Lote #{lote.id}</strong> - {lote.producto_nombre} ({lote.cantidad_disponible} u.)
                                                </div>
                                                {yaReportado ? (
                                                    <Badge bg="success">Incidente registrado</Badge>
                                                ) : (
                                                    <ActionButton
                                                        variant="outline-danger"
                                                        size="sm"
                                                        tooltip="Registrar incidente"
                                                        icon="bi-exclamation-diamond"
                                                        onClick={() =>
                                                            abrirFormularioIncidente({
                                                                clave,
                                                                tipo: 'lote',
                                                                id: lote.id,
                                                                etiqueta: `Lote #${lote.id} - ${lote.producto_nombre}`,
                                                                tituloInicial: `Desvio termico Lote #${lote.id}`.slice(0, 60),
                                                                descripcionInicial: `El lote de produccion #${lote.id} (${lote.producto_nombre}) estuvo expuesto a temperatura fuera de rango en ${equipo?.nombre}.`,
                                                            })
                                                        }
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer className="justify-content-start">
                        <Button variant="primary" onClick={handleClose}>
                            Finalizar y cerrar
                        </Button>
                    </Modal.Footer>
                </>
            ) : (
                <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <Modal.Body>
                        <p className="mb-3 text-muted small">
                            Rango permitido para este equipo: <strong>{min} C a {max} C</strong>
                        </p>

                        <Form.Group className="mb-3 text-start" controlId="formTempRegistrada">
                            <Form.Label className="fw-bold">Temperatura medida (C) *</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.1"
                                placeholder="Ej: 3.5"
                                {...register('temperatura_registrada', {
                                    required: 'Debe ingresar la temperatura medida.',
                                })}
                                isInvalid={!!errors.temperatura_registrada}
                                disabled={guardando}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.temperatura_registrada?.message}
                            </Form.Control.Feedback>
                        </Form.Group>

                        {fueraDeRango && (
                            <div className="p-3 border border-danger rounded bg-light-subtle mb-2">
                                <Alert variant="warning" className="small mb-2 py-2">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    Temperatura fuera de rango ({min} C - {max} C). Es obligatorio indicar la accion tomada.
                                </Alert>

                                <Form.Group className="text-start" controlId="formAccionTomada">
                                    <Form.Label className="fw-bold small">Accion tomada *</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Describe que medida correctiva se tomo..."
                                        {...register('accion_tomada', {
                                            required: fueraDeRango ? 'La accion tomada es obligatoria cuando esta fuera de rango.' : false,
                                            maxLength: { value: 500, message: 'No puede superar los 500 caracteres.' },
                                            validate: (v) =>
                                                !fueraDeRango || v.trim() !== '' || 'La accion tomada no puede ser solo espacios.',
                                        })}
                                        isInvalid={fueraDeRango && !!errors.accion_tomada}
                                        disabled={guardando}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.accion_tomada?.message}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                {tieneMercaderiaActual && (
                                    <div className="mt-3 pt-3 border-top text-start">
                                        <AppSwitch
                                            id="switch-reubicar-mercaderia"
                                            label="Trasladar mercaderia almacenada a otra ubicacion"
                                            className="fw-bold small mb-2"
                                            checked={reubicarMercaderia}
                                            onChange={(e) => setReubicarMercaderia(e.target.checked)}
                                            disabled={guardando}
                                        />

                                        {reubicarMercaderia && (
                                            <div className="p-2 border rounded bg-white">
                                                <Form.Label className="fw-bold small mb-1">
                                                    Ubicacion de destino *
                                                </Form.Label>
                                                <div className="d-flex gap-3 mb-2 small">
                                                    <Form.Check
                                                        type="radio"
                                                        id="reubicar-dest-equipo"
                                                        label="Otro Equipo / Camara"
                                                        checked={tipoDestino === 'equipo'}
                                                        onChange={() => {
                                                            setTipoDestino('equipo');
                                                            setDestinoSectorId('');
                                                        }}
                                                        disabled={guardando}
                                                    />
                                                    <Form.Check
                                                        type="radio"
                                                        id="reubicar-dest-sector"
                                                        label="Sector / Deposito"
                                                        checked={tipoDestino === 'sector'}
                                                        onChange={() => {
                                                            setTipoDestino('sector');
                                                            setDestinoEquipoId('');
                                                        }}
                                                        disabled={guardando}
                                                    />
                                                </div>

                                                {tipoDestino === 'equipo' ? (
                                                    <Form.Select
                                                        size="sm"
                                                        className="mb-2"
                                                        value={destinoEquipoId}
                                                        onChange={(e) => setDestinoEquipoId(e.target.value)}
                                                        disabled={guardando}
                                                    >
                                                        <option value="">Selecciona el equipo de destino...</option>
                                                        {(equipos ?? [])
                                                            .filter((eq) => eq.estado && eq.id !== equipo?.id)
                                                            .map((eq) => (
                                                                <option key={eq.id} value={eq.id}>
                                                                    {eq.nombre} ({eq.sector?.nombre || 'Sin sector'})
                                                                    {eq.controla_temperatura
                                                                        ? ` [${eq.temperatura_minima} C a ${eq.temperatura_maxima} C]`
                                                                        : ''}
                                                                </option>
                                                            ))}
                                                    </Form.Select>
                                                ) : (
                                                    <Form.Select
                                                        size="sm"
                                                        className="mb-2"
                                                        value={destinoSectorId}
                                                        onChange={(e) => setDestinoSectorId(e.target.value)}
                                                        disabled={guardando}
                                                    >
                                                        <option value="">Selecciona el sector de destino...</option>
                                                        {(sectores ?? [])
                                                            .filter((s) => s.activo)
                                                            .map((s) => (
                                                                <option key={s.id} value={s.id}>
                                                                    {s.nombre}
                                                                </option>
                                                            ))}
                                                    </Form.Select>
                                                )}

                                                <div className="small">
                                                    <div className="fw-semibold text-secondary mb-1">
                                                        Mercaderia a trasladar:
                                                    </div>
                                                    {(almacenamientoActual?.insumos ?? []).map((ins) => (
                                                        <Form.Check
                                                            key={`move-ins-${ins.id}`}
                                                            type="checkbox"
                                                            id={`move-ins-${ins.id}`}
                                                            label={`Insumo: ${ins.insumo_nombre} (${ins.marca}) - Lote ${ins.numero_lote}`}
                                                            checked={insumosSeleccionados.includes(ins.id)}
                                                            onChange={() => toggleInsumo(ins.id)}
                                                            disabled={guardando}
                                                        />
                                                    ))}
                                                    {(almacenamientoActual?.lotes_produccion ?? []).map((lote) => (
                                                        <Form.Check
                                                            key={`move-lote-${lote.id}`}
                                                            type="checkbox"
                                                            id={`move-lote-${lote.id}`}
                                                            label={`Lote Produccion #${lote.id} - ${lote.producto_nombre}`}
                                                            checked={lotesSeleccionados.includes(lote.id)}
                                                            onChange={() => toggleLote(lote.id)}
                                                            disabled={guardando}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer className="justify-content-start">
                        <Button variant="secondary" onClick={handleClose} disabled={guardando}>
                            Cancelar
                        </Button>
                        <Button variant={fueraDeRango ? 'danger' : 'primary'} type="submit" disabled={guardando}>
                            <i className="bi bi-thermometer-half me-1"></i>
                            {fueraDeRango ? 'Guardar y Generar Alerta' : 'Guardar Medicion'}
                        </Button>
                    </Modal.Footer>
                </Form>
            )}
        </Modal>
    );
}
