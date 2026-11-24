import { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { mutate } from 'swr';
import { useApi } from '../../../hooks/useApi';
import { mostrarAlertaError, mostrarAlertaExito } from '../../../libs/alertas';
import { api } from '../../../libs/axios';
import type { Sector } from '../../Sectores/types';
import type { Equipo } from '../types';

interface CambiarAlmacenamientoModalProps {
    show: boolean;
    onHide: () => void;
    tipo: 'insumo_lote' | 'lote_produccion';
    entidadId: number;
    etiqueta: string;
    equipoActualId?: number | null;
    sectorActualId?: number | null;
    onActualizado: () => void;
}

export function CambiarAlmacenamientoModal({show, onHide, tipo, entidadId, etiqueta, equipoActualId, sectorActualId, onActualizado}: CambiarAlmacenamientoModalProps) {
    const [guardando, setGuardando] = useState(false);
    const [tipoUbicacion, setTipoUbicacion] = useState<'ninguno' | 'equipo' | 'sector'>('ninguno');
    const [equipoId, setEquipoId] = useState('');
    const [sectorId, setSectorId] = useState('');

    const { data: equipos } = useApi<Equipo[]>(show ? '/equipos/' : null);
    const { data: sectores } = useApi<Sector[]>(show ? '/sectores/' : null);

    useEffect(() => {
        if (show) {
            if (equipoActualId) {
                setTipoUbicacion('equipo');
                setEquipoId(String(equipoActualId));
                setSectorId('');
            } else if (sectorActualId) {
                setTipoUbicacion('sector');
                setSectorId(String(sectorActualId));
                setEquipoId('');
            } else {
                setTipoUbicacion('ninguno');
                setEquipoId('');
                setSectorId('');
            }
        }
    }, [show, equipoActualId, sectorActualId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (tipoUbicacion === 'equipo' && !equipoId) {
            mostrarAlertaError('Selecciona un equipo de destino.');
            return;
        }
        if (tipoUbicacion === 'sector' && !sectorId) {
            mostrarAlertaError('Selecciona un sector de destino.');
            return;
        }

        setGuardando(true);
        try {
            const payload = {
                equipo_id: tipoUbicacion === 'equipo' && equipoId ? Number(equipoId) : null,
                sector_id: tipoUbicacion === 'sector' && sectorId ? Number(sectorId) : null,
            };

            const endpoint =
                tipo === 'insumo_lote'
                    ? `/insumos-lote/${entidadId}/almacenamiento`
                    : `/lotes-produccion/${entidadId}/almacenamiento`;

            await api.patch(endpoint, payload);

            if (tipo === 'insumo_lote') {
                await mutate(`/insumos-lote/${entidadId}`);
                await mutate('/insumos-lote/');
            } else {
                await mutate(`/lotes-produccion/${entidadId}`);
                await mutate('/lotes-produccion/');
            }
            if (equipoActualId) {
                await mutate(`/equipos/${equipoActualId}/almacenamiento`);
            }
            if (payload.equipo_id) {
                await mutate(`/equipos/${payload.equipo_id}/almacenamiento`);
            }

            mostrarAlertaExito('Ubicacion de almacenamiento actualizada correctamente.');
            onActualizado();
            onHide();
        } catch (error: any) {
            const detail = error.response?.data?.detail;
            mostrarAlertaError(
                Array.isArray(detail) ? detail[0]?.msg : detail || 'No se pudo actualizar el almacenamiento.'
            );
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Form onSubmit={handleSubmit} noValidate>
                <Modal.Header closeButton>
                    <Modal.Title>Cambiar Ubicacion de Almacenamiento</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-start">
                    <p className="small text-muted mb-3">
                        Registro: <strong>{etiqueta}</strong>
                    </p>

                    <Form.Label className="fw-bold small mb-2">Tipo de ubicacion</Form.Label>
                    <div className="d-flex flex-wrap gap-3 mb-3 small">
                        <Form.Check
                            type="radio"
                            id="alm-ubic-ninguno"
                            label="Sin ubicacion asignada"
                            checked={tipoUbicacion === 'ninguno'}
                            onChange={() => {
                                setTipoUbicacion('ninguno');
                                setEquipoId('');
                                setSectorId('');
                            }}
                            disabled={guardando}
                        />
                        <Form.Check
                            type="radio"
                            id="alm-ubic-sector"
                            label="Sector / Deposito"
                            checked={tipoUbicacion === 'sector'}
                            onChange={() => {
                                setTipoUbicacion('sector');
                                setEquipoId('');
                            }}
                            disabled={guardando}
                        />
                        <Form.Check
                            type="radio"
                            id="alm-ubic-equipo"
                            label="Equipo / Camara"
                            checked={tipoUbicacion === 'equipo'}
                            onChange={() => {
                                setTipoUbicacion('equipo');
                                setSectorId('');
                            }}
                            disabled={guardando}
                        />
                    </div>

                    {tipoUbicacion === 'sector' && (
                        <Form.Group className="mb-2">
                            <Form.Label className="fw-bold small">Sector *</Form.Label>
                            <Form.Select
                                value={sectorId}
                                onChange={(e) => setSectorId(e.target.value)}
                                disabled={guardando}
                            >
                                <option value="">Selecciona un sector...</option>
                                {(sectores ?? []).filter((s) => s.activo).map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.nombre}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    )}

                    {tipoUbicacion === 'equipo' && (
                        <Form.Group className="mb-2">
                            <Form.Label className="fw-bold small">Equipo / Camara *</Form.Label>
                            <Form.Select
                                value={equipoId}
                                onChange={(e) => setEquipoId(e.target.value)}
                                disabled={guardando}
                            >
                                <option value="">Selecciona un equipo...</option>
                                {(equipos ?? []).filter((eq) => eq.estado).map((eq) => (
                                    <option key={eq.id} value={eq.id}>
                                        {eq.nombre} ({eq.sector?.nombre || 'Sin sector'})
                                        {eq.controla_temperatura
                                            ? ` [${eq.temperatura_minima} C a ${eq.temperatura_maxima} C]`
                                            : ''}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    )}
                </Modal.Body>
                <Modal.Footer className="justify-content-start">
                    <Button variant="secondary" type="button" onClick={onHide} disabled={guardando}>
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit" disabled={guardando}>
                        <i className="bi bi-floppy me-1"></i>
                        {guardando ? 'Guardando...' : 'Guardar Ubicacion'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
