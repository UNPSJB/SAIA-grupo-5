import { useEffect, useRef, useState } from 'react';
import { Alert, Badge, Button, Form, Modal, Spinner, Table } from 'react-bootstrap';
import { mutate } from 'swr';
import { isAxiosError } from 'axios';
import { api } from '../../../libs/axios';
import { useApi } from '../../../hooks/useApi';
import { PanelCapasEmpaquetado } from './PanelCapasEmpaquetado';
import { mostrarAlertaError, mostrarAlertaExito } from '../../../libs/alertas';
import type { Producto } from '../../Productos/types';
import { CodigoBarras } from '../../Productos/components/CodigoBarras';
import { SelloOctogono } from '../../Recetas/components/SelloOctogono';
import {
    ETIQUETAS_EMPAQUETADO,
    type ClaveElementoEmpaquetado,
    type ElementoEmpaquetado,
    type EmpaquetadoProducto,
    type VersionEmpaquetado,
} from '../types';

interface RotuladoEmpaquetadoProps {
    producto: Producto;
    puedeEditar: boolean;
}

type Esquina = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
type ModoArrastre = 'mover' | Esquina;


// Vértices para estirar en ambos sentidos y manijas de borde para estirar solo en vertical u horizontal.
const MANIJAS: { esquina: Esquina; estilo: React.CSSProperties }[] = [
    { esquina: 'nw', estilo: { left: 0, top: 0, width: 13, height: 13, cursor: 'nwse-resize' } },
    { esquina: 'n', estilo: { left: '50%', top: 0, width: 24, height: 9, cursor: 'ns-resize', transform: 'translateX(-50%)' } },
    { esquina: 'ne', estilo: { right: 0, top: 0, width: 13, height: 13, cursor: 'nesw-resize' } },
    { esquina: 'e', estilo: { right: 0, top: '50%', width: 9, height: 24, cursor: 'ew-resize', transform: 'translateY(-50%)' } },
    { esquina: 'se', estilo: { right: 0, bottom: 0, width: 13, height: 13, cursor: 'nwse-resize' } },
    { esquina: 's', estilo: { left: '50%', bottom: 0, width: 24, height: 9, cursor: 'ns-resize', transform: 'translateX(-50%)' } },
    { esquina: 'sw', estilo: { left: 0, bottom: 0, width: 13, height: 13, cursor: 'nesw-resize' } },
    { esquina: 'w', estilo: { left: 0, top: '50%', width: 9, height: 24, cursor: 'ew-resize', transform: 'translateY(-50%)' } },
];

const limpiar = (valor: number, minimo: number, maximo: number) =>
    Math.min(Math.max(valor, minimo), maximo);

export function RotuladoEmpaquetado({ producto, puedeEditar }: RotuladoEmpaquetadoProps) {
    const clave = `/rotulado/productos/${producto.id}/empaquetado`;
    const { data, error, isLoading } = useApi<EmpaquetadoProducto>(clave);
    // El aviso de borrador va arriba del editor y se puede cerrar (queda cerrado aunque se guarde una versión)
    const [mostrarAviso, setMostrarAviso] = useState(true);

    if (isLoading) {
        return (
            <div className="d-flex align-items-center gap-2 text-muted">
                <Spinner animation="border" size="sm" /> Cargando la vista previa del empaquetado…
            </div>
        );
    }

    if (error || !data) {
        return <p className="text-muted mb-0">No se pudo cargar la vista previa del empaquetado.</p>;
    }

    return (
        <>
            {mostrarAviso && (
                <Alert variant="danger" className="py-2" dismissible onClose={() => setMostrarAviso(false)}>
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <strong>{data.leyenda}</strong>
                </Alert>
            )}
            <EditorEmpaquetado
                key={`${producto.id}-${data.vigente?.id ?? 'inicial'}`}
                producto={producto}
                empaquetado={data}
                clave={clave}
                puedeEditar={puedeEditar}
            />
        </>
    );
}

interface EditorProps {
    producto: Producto;
    empaquetado: EmpaquetadoProducto;
    clave: string;
    puedeEditar: boolean;
}

function EditorEmpaquetado({ producto, empaquetado, clave, puedeEditar }: EditorProps) {
    const [foto, setFoto] = useState<string | null>(empaquetado.foto);
    const [elementos, setElementos] = useState<ElementoEmpaquetado[]>(empaquetado.elementos);
    const [observacion, setObservacion] = useState(empaquetado.vigente?.observacion ?? '');
    const [seleccionado, setSeleccionado] = useState<ClaveElementoEmpaquetado | null>(null);
    const [relacion, setRelacion] = useState(1.25);
    const [guardando, setGuardando] = useState(false);
    const [previsualizando, setPrevisualizando] = useState(false);
    const [versionCargada, setVersionCargada] = useState<number | null>(null);
    const [errorFoto, setErrorFoto] = useState<string | null>(null);
    const [disponible, setDisponible] = useState({ ancho: 0, alto: 0 });
    const [zoom, setZoom] = useState(1);
    const [resolucion, setResolucion] = useState<{ ancho: number; alto: number } | null>(null);
    const [desplazando, setDesplazando] = useState(false);

    const areaRef = useRef<HTMLDivElement>(null);
    const lienzoRef = useRef<HTMLDivElement>(null);
    const zoomRef = useRef(zoom);
    zoomRef.current = zoom;
    const arrastre = useRef<{
        elementoClave: ClaveElementoEmpaquetado;
        modo: ModoArrastre;
        inicioX: number;
        inicioY: number;
        elemento: ElementoEmpaquetado;
        rect: DOMRect;
    } | null>(null);

    useEffect(() => {
        const nodo = lienzoRef.current;
        if (!nodo) return;
        const observador = new ResizeObserver(([entrada]) => {
            setDisponible({ ancho: entrada.contentRect.width, alto: entrada.contentRect.height });
        });
        observador.observe(nodo);
        return () => observador.disconnect();
    }, []);

    // Ctrl + ruedita sobre la foto: acerca o aleja manteniendo quieto el punto que apunta el puntero.
    // Sin Ctrl la ruedita sigue desplazando la mesa de trabajo como siempre.
    useEffect(() => {
        const contenedor = lienzoRef.current;
        if (!contenedor) return;

        const alDesplazar = (evento: WheelEvent) => {
            if (!evento.ctrlKey) return;
            const area = areaRef.current;
            if (!area) return;
            evento.preventDefault();

            const anterior = zoomRef.current;
            const siguiente = limpiar(anterior * Math.pow(1.1, -evento.deltaY / 100), 0.05, 8);
            if (Math.abs(siguiente - anterior) < 0.0001) return;

            const rect = area.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            const relX = (evento.clientX - rect.left) / rect.width;
            const relY = (evento.clientY - rect.top) / rect.height;

            zoomRef.current = siguiente;
            setZoom(siguiente);

            // Después del re-render se corrige el desplazamiento para anclar el punto bajo el puntero.
            requestAnimationFrame(() => requestAnimationFrame(() => {
                const nodo = lienzoRef.current;
                const nuevo = areaRef.current;
                if (!nodo || !nuevo) return;
                const nuevoRect = nuevo.getBoundingClientRect();
                nodo.scrollLeft += nuevoRect.left + relX * nuevoRect.width - evento.clientX;
                nodo.scrollTop += nuevoRect.top + relY * nuevoRect.height - evento.clientY;
            }));
        };

        contenedor.addEventListener('wheel', alDesplazar, { passive: false });
        return () => contenedor.removeEventListener('wheel', alDesplazar);
    }, []);

    const anchoDisponible = disponible.ancho || 640;
    const altoDisponible = Math.max(disponible.alto || 720, 200);
    const anchoAjustado = Math.max(180, Math.min(anchoDisponible, altoDisponible / relacion));
    // Con foto, el 100 % del zoom es la resolución real de la imagen (1:1); sin foto, el lienzo ajustado.
    const anchoLienzo = Math.max(120, (resolucion?.ancho ?? anchoAjustado) * zoom);
    const altoFoto = anchoLienzo * relacion;

    const cambiarZoom = (factor: number) => setZoom((actual) => limpiar(actual * factor, 0.05, 8));

    const ajustarZoom = () =>
        setZoom(
            resolucion
                ? limpiar(
                    Math.min(anchoDisponible / resolucion.ancho, altoDisponible / resolucion.alto),
                    0.05,
                    8,
                )
                : 1,
        );

    const cargarFoto = (ancho: number, alto: number) => {
        if (!ancho || !alto) return;
        setResolucion({ ancho, alto });
        setRelacion(alto / ancho);
    };

    const cambiarElemento = (claveElemento: ClaveElementoEmpaquetado, cambios: Partial<ElementoEmpaquetado>) =>
        setElementos((previos) =>
            previos.map((elemento) => (elemento.clave === claveElemento ? { ...elemento, ...cambios } : elemento)),
        );

    const iniciarArrastre = (
        evento: React.PointerEvent,
        elementoClave: ClaveElementoEmpaquetado,
        modo: ModoArrastre,
    ) => {
        if (!puedeEditar) return;
        const area = areaRef.current;
        const elemento = elementos.find((item) => item.clave === elementoClave);
        if (!area || !elemento) return;

        evento.preventDefault();
        evento.stopPropagation();
        setSeleccionado(elementoClave);
        arrastre.current = {
            elementoClave,
            modo,
            inicioX: evento.clientX,
            inicioY: evento.clientY,
            elemento: { ...elemento },
            rect: area.getBoundingClientRect(),
        };

        const mover = (movimiento: PointerEvent) => {
            const actual = arrastre.current;
            if (!actual) return;
            const deltaX = ((movimiento.clientX - actual.inicioX) / actual.rect.width) * 100;
            const deltaY = ((movimiento.clientY - actual.inicioY) / actual.rect.height) * 100;
            const base = actual.elemento;

            setElementos((previos) =>
                previos.map((item) => {
                    if (item.clave !== actual.elementoClave) return item;
                    if (actual.modo === 'mover') {
                        return {
                            ...item,
                            x: limpiar(base.x + deltaX, 0, 100 - item.ancho),
                            y: limpiar(base.y + deltaY, 0, 100 - item.alto),
                        };
                    }

                    const derecha = base.x + base.ancho;
                    const abajo = base.y + base.alto;
                    const desdeIzquierda = actual.modo.includes('w');
                    const desdeDerecha = actual.modo.includes('e');
                    const desdeArriba = actual.modo.includes('n');
                    const desdeAbajo = actual.modo.includes('s');

                    // La manija de borde superior/inferior cambia solo el alto: el ancho queda igual.
                    let x = base.x;
                    let ancho = base.ancho;
                    if (desdeIzquierda) {
                        x = limpiar(base.x + deltaX, 0, derecha - 6);
                        ancho = derecha - x;
                    } else if (desdeDerecha) {
                        ancho = limpiar(base.ancho + deltaX, 6, 100 - base.x);
                    }

                    let y = base.y;
                    let alto = base.alto;
                    if (desdeArriba) {
                        y = limpiar(base.y + deltaY, 0, abajo - 4);
                        alto = abajo - y;
                    } else if (desdeAbajo) {
                        alto = limpiar(base.alto + deltaY, 4, 100 - base.y);
                    }

                    return { ...item, x, y, ancho, alto };
                }),
            );
        };

        const soltar = () => {
            arrastre.current = null;
            window.removeEventListener('pointermove', mover);
            window.removeEventListener('pointerup', soltar);
        };

        window.addEventListener('pointermove', mover);
        window.addEventListener('pointerup', soltar);
    };

    // Arrastrar la foto de fondo (fuera de los bloques) desplaza la mesa de trabajo.
    const iniciarDesplazamiento = (evento: React.PointerEvent) => {
        setSeleccionado(null);
        const contenedor = lienzoRef.current;
        if (!contenedor || evento.button !== 0) return;

        evento.preventDefault();
        const inicio = {
            x: evento.clientX,
            y: evento.clientY,
            scrollLeft: contenedor.scrollLeft,
            scrollTop: contenedor.scrollTop,
        };
        setDesplazando(true);

        const mover = (movimiento: PointerEvent) => {
            contenedor.scrollLeft = inicio.scrollLeft - (movimiento.clientX - inicio.x);
            contenedor.scrollTop = inicio.scrollTop - (movimiento.clientY - inicio.y);
        };

        const soltar = () => {
            setDesplazando(false);
            window.removeEventListener('pointermove', mover);
            window.removeEventListener('pointerup', soltar);
        };

        window.addEventListener('pointermove', mover);
        window.addEventListener('pointerup', soltar);
    };

    const subirFoto = (evento: React.ChangeEvent<HTMLInputElement>) => {
        setErrorFoto(null);
        const archivo = evento.target.files?.[0];
        if (!archivo) return;
        if (archivo.size > 8 * 1024 * 1024) {
            setErrorFoto('La foto no puede superar los 8 MB.');
            return;
        }
        const lector = new FileReader();
        lector.readAsDataURL(archivo);
        lector.onload = () => setFoto(lector.result as string);
        lector.onerror = () => setErrorFoto('No se pudo leer la imagen.');
    };

    const cargarVersion = async (id: number) => {
        if (!id) return;
        try {
            const { data } = await api.get<VersionEmpaquetado>(`/rotulado/empaquetado/versiones/${id}`);
            setFoto(data.foto);
            setElementos(data.elementos);
            setObservacion(data.observacion ?? '');
            setVersionCargada(data.version);
            setSeleccionado(null);
            if (!data.foto) {
                setRelacion(1.25);
                setResolucion(null);
            }
        } catch (error) {
            mostrarAlertaError('No se pudo cargar la versión del empaquetado.');
            console.log(error);
        }
    };

    const guardar = async () => {
        setGuardando(true);
        try {
            const { data } = await api.post<EmpaquetadoProducto>(clave, { foto, elementos, observacion });
            await mutate(clave, data, false);
            mostrarAlertaExito(
                `Versión ${data.vigente?.version ?? ''} del empaquetado guardada y vigente.`,
            );
        } catch (error) {
            let mensaje = `No se pudo guardar el empaquetado de '${producto.nombre}'.`;
            const detalle = isAxiosError(error) ? error.response?.data?.detail : undefined;
            if (typeof detalle === 'string') mensaje = detalle;
            if (Array.isArray(detalle) && detalle[0]?.msg) mensaje = detalle[0].msg;
            mostrarAlertaError(mensaje);
            console.log(error);
        } finally {
            setGuardando(false);
        }
    };

    return (
        <>
            {(empaquetado.faltantes.length > 0 || empaquetado.tabla_incompleta) && (
                <Alert variant="warning" className="py-2">
                    <div className="fw-bold mb-1">La vista previa está incompleta:</div>
                    {empaquetado.faltantes.length > 0 && (
                        <div className="small">
                            Faltan datos obligatorios: {empaquetado.faltantes.join(', ')}.
                        </div>
                    )}
                    {empaquetado.tabla_incompleta && (
                        <div className="small">
                            La tabla nutricional está incompleta o no está calculada (E11).
                        </div>
                    )}
                    <div className="small">Se puede guardar el borrador y completar estos datos después.</div>
                </Alert>
            )}

            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <Badge bg={empaquetado.vigente ? 'success' : 'secondary'}>
                    {empaquetado.vigente
                        ? `Versión vigente: ${empaquetado.vigente.version}`
                        : 'Sin versiones guardadas'}
                </Badge>
                {empaquetado.vigente?.creado_por && (
                    <span className="small text-muted">
                        {empaquetado.vigente.creado_por} ·{' '}
                        {new Date(empaquetado.vigente.fecha_desde_vigencia).toLocaleString('es-AR')}
                    </span>
                )}
                {!foto && <Badge bg="light" text="dark">Sin foto: se muestra el lienzo del rótulo</Badge>}
                {versionCargada !== null && (
                    <Badge bg="warning" text="dark">
                        Versión {versionCargada} cargada: al guardar se crea una nueva versión
                    </Badge>
                )}
            </div>

            <div className="d-flex flex-wrap align-items-end gap-2 mb-2">
                {puedeEditar && (
                    <>
                        <Form.Group controlId="empaquetado-foto" className="mb-0">
                            <Form.Label className="small mb-1">Foto del empaquetado</Form.Label>
                            <Form.Control type="file" size="sm" accept="image/*" onChange={subirFoto} isInvalid={!!errorFoto} />
                            <Form.Control.Feedback type="invalid">{errorFoto}</Form.Control.Feedback>
                        </Form.Group>
                        {foto && (
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => {
                                    setFoto(null);
                                    setRelacion(1.25);
                                    setResolucion(null);
                                }}
                            >
                                Quitar foto
                            </Button>
                        )}
                        {empaquetado.versiones.length > 0 && (
                            <Form.Group controlId="empaquetado-version" className="mb-0">
                                <Form.Label className="small mb-1">Cargar una versión</Form.Label>
                                <Form.Select
                                    size="sm"
                                    defaultValue=""
                                    onChange={(evento) => cargarVersion(Number(evento.target.value))}
                                >
                                    <option value="">Elegir versión…</option>
                                    {empaquetado.versiones.map((version) => (
                                        <option key={version.id} value={version.id}>
                                            Versión {version.version}{version.vigente ? ' (vigente)' : ''}
                                            {version.tiene_foto ? ' · con foto' : ' · sin foto'}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        )}
                    </>
                )}
                <Button variant="primary" size="sm" onClick={() => setPrevisualizando(true)}>
                    <i className="bi bi-eye me-1"></i>
                    Vista previa sin fondos
                </Button>
            </div>

            <div className="empaquetado-editor">
                <PanelCapasEmpaquetado
                    elementos={elementos}
                    seleccionado={seleccionado}
                    puedeEditar={puedeEditar}
                    onCambiar={cambiarElemento}
                />

                <div className="empaquetado-lienzo">
                    <div
                        ref={lienzoRef}
                        className="flex-grow-1 border rounded bg-light"
                        style={{ minHeight: '240px', overflow: 'auto', padding: '8px' }}
                    >
                        <div
                            className="d-flex align-items-center justify-content-center"
                            style={{ width: 'max-content', height: 'max-content', minWidth: '100%', minHeight: '100%' }}
                        >
                            <div
                                className="position-relative border rounded overflow-hidden bg-white flex-shrink-0"
                                style={{ width: anchoLienzo, height: altoFoto }}
                            >
                                <div
                                    ref={areaRef}
                                    className="position-absolute"
                                    style={{
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: altoFoto,
                                        cursor: desplazando ? 'grabbing' : 'grab',
                                        touchAction: 'none',
                                    }}
                                    onPointerDown={iniciarDesplazamiento}
                                >
                                    <FondoEmpaquetado foto={foto} onCargada={cargarFoto} />
                                    <CapaElementos
                                        empaquetado={empaquetado}
                                        elementos={elementos}
                                        modo="edicion"
                                        seleccionado={seleccionado}
                                        onMover={iniciarArrastre}
                                        onRedimensionar={iniciarArrastre}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex flex-wrap align-items-center gap-2 small text-muted">
                        <span className="fw-semibold">Zoom</span>
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => cambiarZoom(1 / 1.25)}
                            aria-label="Alejar"
                            title="Alejar"
                        >
                            <i className="bi bi-zoom-out"></i>
                        </Button>
                        <span className="text-center" style={{ minWidth: '52px' }}>
                            {Math.round(zoom * 100)} %
                        </span>
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => cambiarZoom(1.25)}
                            aria-label="Acercar"
                            title="Acercar"
                        >
                            <i className="bi bi-zoom-in"></i>
                        </Button>
                        <Button variant="outline-secondary" size="sm" onClick={ajustarZoom}>
                            Ajustar
                        </Button>
                        <Button variant="outline-secondary" size="sm" onClick={() => setZoom(1)}>
                            100 %
                        </Button>
                        <span>
                            {resolucion
                                ? `Foto a resolución real: ${resolucion.ancho} × ${resolucion.alto} px (100 % = 1:1)`
                                : 'Sin foto: el 100 % es el lienzo ajustado'}
                            {' · '}Ruedita sobre la foto para acercar o alejar donde apuntás y arrastrá el fondo para
                            desplazarla.
                        </span>
                    </div>
                </div>
            </div>

            {puedeEditar && (
                <div className="d-flex flex-wrap align-items-end gap-2 mt-3">
                    <Form.Group controlId="empaquetado-observacion" className="mb-0 flex-grow-1">
                        <Form.Label className="small mb-1">Observación de la versión (opcional)</Form.Label>
                        <Form.Control
                            size="sm"
                            value={observacion}
                            maxLength={300}
                            placeholder="Ej.: ajuste de la tabla nutricional al nuevo envase"
                            onChange={(evento) => setObservacion(evento.target.value)}
                        />
                    </Form.Group>
                    <Button variant="success" onClick={guardar} disabled={guardando}>
                        {guardando ? 'Guardando…' : 'Guardar como nueva versión vigente'}
                    </Button>
                </div>
            )}

            {empaquetado.versiones.length > 0 && (
                <details className="mt-3">
                    <summary className="fw-semibold">Versiones del empaquetado ({empaquetado.versiones.length})</summary>
                    <Table size="sm" className="mt-2 mb-0">
                        <thead>
                            <tr>
                                <th>Versión</th>
                                <th>Vigencia</th>
                                <th>Foto</th>
                                <th>Observación</th>
                                <th>Usuario</th>
                            </tr>
                        </thead>
                        <tbody>
                            {empaquetado.versiones.map((version) => (
                                <tr key={version.id}>
                                    <td>
                                        {version.version} {version.vigente && <Badge bg="success">Vigente</Badge>}
                                    </td>
                                    <td className="small">
                                        {new Date(version.fecha_desde_vigencia).toLocaleString('es-AR')}
                                        {version.fecha_hasta_vigencia && (
                                            <div className="text-muted">
                                                hasta {new Date(version.fecha_hasta_vigencia).toLocaleString('es-AR')}
                                            </div>
                                        )}
                                    </td>
                                    <td>{version.tiene_foto ? 'Sí' : 'No'}</td>
                                    <td className="small">{version.observacion ?? '—'}</td>
                                    <td className="small">{version.creado_por ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </details>
            )}

            <Modal
                show={previsualizando}
                onHide={() => setPrevisualizando(false)}
                size="xl"
                fullscreen="lg-down"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title className="fs-6">
                        Vista previa sin fondos · {producto.nombre}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-body-secondary">
                    <LienzoPrevisualizacion
                        empaquetado={empaquetado}
                        foto={foto}
                        elementos={elementos}
                        relacion={relacion}
                    />
                    <p className="small text-muted text-center mt-2 mb-0">
                        Así se vería el rótulo sobre el envase, sin los fondos de los bloques.
                    </p>
                </Modal.Body>
            </Modal>
        </>
    );
}

interface FondoProps {
    foto: string | null;
    onCargada?: (ancho: number, alto: number) => void;
}

function FondoEmpaquetado({ foto, onCargada }: FondoProps) {
    if (foto) {
        return (
            <img
                src={foto}
                alt="Empaquetado del producto"
                className="position-absolute w-100 h-100"
                style={{ objectFit: 'fill' }}
                onLoad={(evento) => {
                    const imagen = evento.currentTarget;
                    if (imagen.naturalWidth && imagen.naturalHeight && onCargada) {
                        onCargada(imagen.naturalWidth, imagen.naturalHeight);
                    }
                }}
            />
        );
    }

    return (
        <div
            className="position-absolute w-100 h-100 d-flex align-items-start justify-content-center text-muted small pt-1"
            style={{ background: 'repeating-linear-gradient(45deg, #fafafa, #fafafa 10px, #f2f2f2 10px, #f2f2f2 20px)' }}
        >
            Sin foto del paquete
        </div>
    );
}

interface CapaProps {
    empaquetado: EmpaquetadoProducto;
    elementos: ElementoEmpaquetado[];
    modo: 'edicion' | 'limpio';
    seleccionado?: ClaveElementoEmpaquetado | null;
    onMover?: (evento: React.PointerEvent, clave: ClaveElementoEmpaquetado, modo: ModoArrastre) => void;
    onRedimensionar?: (evento: React.PointerEvent, clave: ClaveElementoEmpaquetado, modo: ModoArrastre) => void;
}

function CapaElementos({
    empaquetado,
    elementos,
    modo,
    seleccionado,
    onMover,
    onRedimensionar,
}: CapaProps) {
    const edicion = modo === 'edicion';

    return (
        <div className="position-absolute w-100 h-100" style={{ top: 0, left: 0, containerType: 'size' }}>
            {elementos.filter((elemento) => elemento.visible).map((elemento) => {
                const sinFondo = !edicion || elemento.clave === 'sellos';
                const activo = seleccionado === elemento.clave;
                // La tabla escala con el ancho: al estirarla en vertical solo gana espacio (las filas se
                // reparten), el texto no crece como si se estirara desde la esquina.
                const escalaContenido = elemento.clave === 'tabla_nutricional'
                    ? `${(elemento.ancho / 16).toFixed(3)}cqw`
                    : `${(elemento.alto / 7).toFixed(2)}cqh`;

                return (
                    <div
                        key={elemento.clave}
                        role={edicion ? 'button' : undefined}
                        aria-label={ETIQUETAS_EMPAQUETADO[elemento.clave]}
                        onPointerDown={
                            edicion && onMover
                                ? (evento) => onMover(evento, elemento.clave, 'mover')
                                : undefined
                        }
                        style={{
                            position: 'absolute',
                            left: `${elemento.x}%`,
                            top: `${elemento.y}%`,
                            width: `${elemento.ancho}%`,
                            height: `${elemento.alto}%`,
                            padding: edicion ? '3px 4px' : 0,
                            background: sinFondo ? 'transparent' : 'rgba(255,255,255,0.92)',
                            border: edicion
                                ? activo
                                    ? '2px solid #0d6efd'
                                    : `1px dashed ${elemento.clave === 'sellos'
                                        ? 'rgba(0,0,0,0.15)'
                                        : 'rgba(0,0,0,0.35)'}`
                                : 'none',
                            borderRadius: edicion ? '2px' : 0,
                            overflow: 'hidden',
                            cursor: edicion ? 'move' : 'default',
                            userSelect: 'none',
                            touchAction: 'none',
                            fontSize: `max(6px, ${escalaContenido})`,
                            lineHeight: 1.15,
                            textAlign: 'left',
                            textShadow: edicion
                                ? undefined
                                : '0 0 2px #fff, 0 0 4px #fff, 0 0 8px rgba(255,255,255,0.9)',
                        }}
                    >
                        <ContenidoEmpaquetado
                            clave={elemento.clave}
                            empaquetado={empaquetado}
                            sinFondo={!edicion}
                        />

                        {edicion && activo && onRedimensionar && (
                            <>
                                {MANIJAS.map((manija) => (
                                    <span
                                        key={manija.esquina}
                                        onPointerDown={(evento) =>
                                            onRedimensionar(evento, elemento.clave, manija.esquina)
                                        }
                                        title="Estirar"
                                        style={{
                                            position: 'absolute',
                                            background: '#0d6efd',
                                            border: '1px solid #fff',
                                            borderRadius: '2px',
                                            ...manija.estilo,
                                        }}
                                    />
                                ))}
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function LienzoPrevisualizacion({
    empaquetado,
    foto,
    elementos,
    relacion,
}: {
    empaquetado: EmpaquetadoProducto;
    foto: string | null;
    elementos: ElementoEmpaquetado[];
    relacion: number;
}) {
    const contenedorRef = useRef<HTMLDivElement>(null);
    const [disponible, setDisponible] = useState({ ancho: 0, alto: 0 });

    useEffect(() => {
        const nodo = contenedorRef.current;
        if (!nodo) return;
        const observador = new ResizeObserver(([entrada]) => {
            setDisponible({ ancho: entrada.contentRect.width, alto: entrada.contentRect.height });
        });
        observador.observe(nodo);
        return () => observador.disconnect();
    }, []);

    const anchoMaximo = disponible.ancho || 800;
    const altoMaximo = disponible.alto || 640;
    const anchoLienzo = Math.max(200, Math.min(anchoMaximo, Math.max(altoMaximo, 200) / relacion));
    const altoFoto = anchoLienzo * relacion;

    return (
        <div
            ref={contenedorRef}
            className="d-flex align-items-center justify-content-center"
            style={{ height: 'calc(100vh - 190px)', minHeight: '320px' }}
        >
            <div
                className="position-relative border rounded overflow-hidden bg-white shadow-sm"
                style={{ width: anchoLienzo, height: altoFoto }}
            >
                <div className="position-absolute" style={{ top: 0, left: 0, width: '100%', height: altoFoto }}>
                    <FondoEmpaquetado foto={foto} />
                    <CapaElementos empaquetado={empaquetado} elementos={elementos} modo="limpio" />
                </div>
            </div>
        </div>
    );
}

function ContenidoEmpaquetado({
    clave,
    empaquetado,
    sinFondo = false,
}: {
    clave: ClaveElementoEmpaquetado;
    empaquetado: EmpaquetadoProducto;
    sinFondo?: boolean;
}) {
    const {
        datos,
        tabla_nutricional: tabla,
        sellos,
        mensaje_sellos: mensajeSellos,
        descripcion,
        codigo_barras: codigoBarras,
        alergenos,
        conservacion,
        porciones_por_envase: porciones,
        leyendas_obligatorias: leyendas,
        fecha_elaboracion: fechaElaboracion,
        fecha_vencimiento: fechaVencimiento,
    } = empaquetado;

    if (clave === 'denominacion') {
        return <strong>{datos.denominacion_venta || 'Denominación de venta pendiente'}</strong>;
    }
    if (clave === 'contenido_neto') {
        return <>Contenido neto: {datos.contenido_neto || '—'}</>;
    }
    if (clave === 'descripcion') {
        return descripcion
            ? <>{descripcion}</>
            : <span className="text-muted">Sin descripción del producto</span>;
    }
    if (clave === 'ingredientes') {
        return <>Ingredientes: {datos.lista_ingredientes || '—'}</>;
    }
    if (clave === 'alergenos') {
        if (!alergenos.length) {
            return <span className="text-muted">Sin leyendas de alérgenos declaradas</span>;
        }
        return (
            <>
                {alergenos.map((leyenda) => (
                    <div key={leyenda} className="fw-bold">{leyenda}</div>
                ))}
            </>
        );
    }
    if (clave === 'origen') {
        const elaborador = [datos.razon_social, datos.domicilio].filter(Boolean).join(' - ');
        return (
            <>
                {elaborador ? <>Elaborado por: {elaborador}<br /></> : null}
                RNPA/RPPA: {datos.numero_registro || '—'}
            </>
        );
    }
    if (clave === 'lote_fecha') {
        const comoFecha = (valor: string) =>
            new Date(`${valor}T00:00:00`).toLocaleDateString('es-AR');
        const vencimiento = fechaVencimiento ?? datos.fecha_duracion;
        return (
            <>
                {datos.identificacion_lote ? <>Lote: {datos.identificacion_lote}<br /></> : null}
                {fechaElaboracion ? <>Elaborado el: {comoFecha(fechaElaboracion)}<br /></> : null}
                {vencimiento
                    ? `Consumir preferentemente antes del: ${comoFecha(vencimiento)}`
                    : 'Fecha de duración: —'}
            </>
        );
    }
    if (clave === 'conservacion') {
        return <>Conservación: {conservacion || '—'}</>;
    }
    if (clave === 'porciones') {
        return <>Porciones por envase: {porciones || '—'}</>;
    }
    if (clave === 'leyendas') {
        if (!leyendas.length) {
            return <span className="text-muted">Sin leyendas de edulcorantes ni cafeína</span>;
        }
        return (
            <>
                {leyendas.map((leyenda) => (
                    <div key={leyenda} className="fw-bold">{leyenda}</div>
                ))}
            </>
        );
    }
    if (clave === 'instrucciones') {
        return <>Preparación e instrucciones de uso: {datos.instrucciones_uso || '—'}</>;
    }
    if (clave === 'codigo_barras') {
        if (!codigoBarras) {
            return <span className="text-muted">Sin código de barras asignado</span>;
        }
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    background: '#fff',
                }}
            >
                <CodigoBarras codigo={codigoBarras} altura={38} anchoBarra={1} />
            </div>
        );
    }
    if (clave === 'importador') {
        if (!datos.es_importado) return <span className="text-muted">Producto no importado</span>;
        const importador = [datos.importador_razon_social, datos.importador_domicilio].filter(Boolean).join(' - ');
        return <>Importado por: {importador || '—'}{datos.importador_cuit ? ` (CUIT ${datos.importador_cuit})` : ''}</>;
    }
    if (clave === 'sellos') {
        if (!sellos.length) {
            return <>Sellos de advertencia: {mensajeSellos || 'no corresponde'}.</>;
        }

        const columnas = sellos.length > 1 ? 2 : 1;
        const filas = Math.ceil(sellos.length / columnas);
        const tamano = `min(${(100 / columnas - 8).toFixed(1)}cqw, ${(100 / filas - 10).toFixed(1)}cqh)`;

        return (
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    alignContent: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    width: '100%',
                    height: '100%',
                    containerType: 'size',
                }}
            >
                {sellos.map((sello) => (
                    <SelloOctogono key={sello} sello={sello} tamano={tamano} />
                ))}
            </div>
        );
    }

    return (
        <table
            className="w-100"
            style={{
                fontSize: '0.88em',
                lineHeight: 1.1,
                height: '100%',
                borderCollapse: 'collapse',
                background: sinFondo ? 'transparent' : undefined,
            }}
        >
            <thead>
                <tr>
                    <th style={{ borderBottom: '1px solid #666' }}>Nutriente</th>
                    <th style={{ borderBottom: '1px solid #666' }}>Porción</th>
                    <th style={{ borderBottom: '1px solid #666' }}>%VD</th>
                    <th style={{ borderBottom: '1px solid #666' }}>100 g/ml</th>
                </tr>
            </thead>
            <tbody>
                {tabla?.length ? tabla.map((fila) => (
                    <tr key={fila.codigo}>
                        <td>{fila.nombre}</td>
                        <td>{fila.texto_porcion} {fila.unidad}</td>
                        <td>{fila.porcentaje_vd ?? '-'}</td>
                        <td>{fila.texto_100g} {fila.unidad}</td>
                    </tr>
                )) : (
                    <tr><td colSpan={4} className="text-muted">Sin información nutricional calculada</td></tr>
                )}
            </tbody>
        </table>
    );
}
