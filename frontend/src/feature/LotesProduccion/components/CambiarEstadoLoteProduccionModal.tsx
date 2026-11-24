import { Button, Form, Modal } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useApi } from "../../../hooks/useApi";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import { api } from "../../../libs/axios";
import type { Equipo } from "../../Equipos/types";
import type { Sector } from "../../Sectores/types";
import type { EstadoLote, LoteProduccion } from "../types";

interface CambiarEstadoLoteModalProps {
    lote: LoteProduccion | null;
    onHide: () => void;
    onChanged: () => void;
}

const SIGUIENTE_ESTADO_MANUAL: Partial<Record<EstadoLote, string>> = {
    "En produccion": "Empaquetando",
    "Empaquetando": "Terminado",
};

export function CambiarEstadoLoteModal({ lote, onHide, onChanged }: CambiarEstadoLoteModalProps) {
    const [cargando, setCargando] = useState(false);
    const [observacion, setObservacion] = useState("");
    const [tipoUbicacion, setTipoUbicacion] = useState<"ninguno" | "equipo" | "sector">("ninguno");
    const [equipoId, setEquipoId] = useState("");
    const [sectorId, setSectorId] = useState("");

    const esCierreATerminado = lote?.estado === "Empaquetando";
    const { data: equipos } = useApi<Equipo[]>(esCierreATerminado ? "/equipos/" : null);
    const { data: sectores } = useApi<Sector[]>(esCierreATerminado ? "/sectores/" : null);

    useEffect(() => {
        setObservacion("");
        setTipoUbicacion("ninguno");
        setEquipoId("");
        setSectorId("");
    }, [lote]);

    if (!lote) return null;

    const nuevoEstado = SIGUIENTE_ESTADO_MANUAL[lote.estado];
    if (!nuevoEstado) return null;

    const handleCambiarEstado = async () => {
        setCargando(true);

        try {
            await api.patch(`/lotes-produccion/${lote.id}/estado`, {
                observacion: observacion.trim() ? observacion.trim() : null,
                equipo_id: esCierreATerminado && tipoUbicacion === "equipo" && equipoId ? Number(equipoId) : null,
                sector_id: esCierreATerminado && tipoUbicacion === "sector" && sectorId ? Number(sectorId) : null,
            });

            mostrarAlertaExito(`El lote de produccion numero ${lote.id} paso al estado '${nuevoEstado}'.`);
            onChanged();
        } catch (error: any) {
            let mensajeFinal = `No se pudo cambiar el estado del lote de produccion numero ${lote.id}.`;
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
        } finally {
            setCargando(false);
            onHide();
        }
    };

    return (
        <Modal show={lote !== null} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Avanzar estado del lote de produccion numero {lote.id}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 text-start">
                <p className="mb-2">
                    ¿Desea cambiar el estado del lote de produccion numero <strong>{lote.id}</strong> de{" "}
                    <span className="badge bg-secondary">{lote.estado}</span> a{" "}
                    <span className="badge bg-primary">{nuevoEstado}</span>?
                </p>
                <p className="text-muted small mb-3">
                    El sistema registrara automaticamente tu usuario, la fecha y la hora actual en el historial.
                </p>

                {esCierreATerminado && (
                    <div className="p-3 border rounded bg-light-subtle mb-3">
                        <Form.Label className="fw-bold small mb-2">
                            Lugar de almacenamiento al finalizar (Opcional)
                        </Form.Label>
                        <div className="d-flex flex-wrap gap-3 mb-2 small">
                            <Form.Check
                                type="radio"
                                id="lote-ubic-ninguno"
                                label="Sin especificar"
                                checked={tipoUbicacion === "ninguno"}
                                onChange={() => {
                                    setTipoUbicacion("ninguno");
                                    setEquipoId("");
                                    setSectorId("");
                                }}
                            />
                            <Form.Check
                                type="radio"
                                id="lote-ubic-sector"
                                label="Sector / Deposito"
                                checked={tipoUbicacion === "sector"}
                                onChange={() => {
                                    setTipoUbicacion("sector");
                                    setEquipoId("");
                                }}
                            />
                            <Form.Check
                                type="radio"
                                id="lote-ubic-equipo"
                                label="Equipo / Camara"
                                checked={tipoUbicacion === "equipo"}
                                onChange={() => {
                                    setTipoUbicacion("equipo");
                                    setSectorId("");
                                }}
                            />
                        </div>

                        {tipoUbicacion === "sector" && (
                            <Form.Select
                                size="sm"
                                value={sectorId}
                                onChange={(e) => setSectorId(e.target.value)}
                                disabled={cargando}
                            >
                                <option value="">Selecciona un sector (ej. Deposito)...</option>
                                {(sectores ?? []).filter((s) => s.activo).map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.nombre}
                                    </option>
                                ))}
                            </Form.Select>
                        )}

                        {tipoUbicacion === "equipo" && (
                            <Form.Select
                                size="sm"
                                value={equipoId}
                                onChange={(e) => setEquipoId(e.target.value)}
                                disabled={cargando}
                            >
                                <option value="">Selecciona un equipo / camara...</option>
                                {(equipos ?? []).filter((eq) => eq.estado).map((eq) => (
                                    <option key={eq.id} value={eq.id}>
                                        {eq.nombre} ({eq.sector?.nombre || "Sin sector"})
                                    </option>
                                ))}
                            </Form.Select>
                        )}
                    </div>
                )}

                <Form.Group controlId="formObservacionCambioEstado">
                    <Form.Label className="fw-bold">Observaciones / Motivo (opcional)</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Ej: Finalizo la coccion, pasa a empaquetado sin observaciones..."
                        value={observacion}
                        onChange={(e) => setObservacion(e.target.value)}
                        disabled={cargando}
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer className="justify-content-start">
                <Button variant="secondary" onClick={onHide} disabled={cargando}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={handleCambiarEstado} disabled={cargando}>
                    {cargando ? "Guardando..." : `Pasar a ${nuevoEstado}`}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
