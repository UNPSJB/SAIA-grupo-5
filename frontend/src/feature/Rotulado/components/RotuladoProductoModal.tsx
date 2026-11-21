import { useState } from 'react';
import { Button, Form, Modal, Nav, Spinner, Tab, Table } from 'react-bootstrap';
import { mutate } from 'swr';
import { isAxiosError } from 'axios';
import { api } from '../../../libs/axios';
import { useApi } from '../../../hooks/useApi';
import { mostrarAlertaError, mostrarAlertaExito } from '../../../libs/alertas';
import type { Producto } from '../../Productos/types';
import { RotuladoFrontal } from './RotuladoFrontal';
import { RotuladoCAAForm } from './RotuladoCAAForm';
import { RotuladoEmpaquetado } from './RotuladoEmpaquetado';
import { CAMPO_DECLARACION_POR_MARCA, type CampoDeclaracion, type EvaluacionRotulado, type RotuladoProductoUpdate } from '../types';

interface RotuladoProductoModalProps {
    producto: Producto | null;
    onHide: () => void;
    puedeEditar?: boolean;
}

type DetalleError = string | { msg?: string }[] | undefined;

const mensajeDeError = (detail: DetalleError, porDefecto: string) => {
    if (!detail) return porDefecto;
    return Array.isArray(detail) ? (detail[0]?.msg ?? porDefecto) : detail;
};

// El endpoint devuelve un PDF, así que ante un error el detalle llega dentro del blob.
const detalleDesdeBlob = async (error: unknown): Promise<string | undefined> => {
    if (!isAxiosError(error) || !(error.response?.data instanceof Blob)) return undefined;
    try {
        const cuerpo = JSON.parse(await error.response.data.text()) as { detail?: DetalleError };
        return mensajeDeError(cuerpo.detail, "");
    } catch {
        return undefined;
    }
};

export function RotuladoProductoModal({ producto, onHide, puedeEditar = false }: RotuladoProductoModalProps) {
    const clave = producto ? `/rotulado/productos/${producto.id}` : null;
    const { data: evaluacion, error, isLoading } = useApi<EvaluacionRotulado>(clave);
    const [exportando, setExportando] = useState(false);
    const [pestania, setPestania] = useState('frontal');
    // El editor del empaquetado necesita toda la pantalla para arrastrar y estirar los bloques.
    const pantallaCompleta = pestania === 'empaquetado';

    const exportarBorrador = async () => {
        if (!producto) return;
        setExportando(true);
        try {
            const { data } = await api.get<Blob>(`/rotulado/productos/${producto.id}/borrador.pdf`, {
                responseType: 'blob',
            });
            const url = URL.createObjectURL(data);
            const enlace = document.createElement('a');
            enlace.href = url;
            enlace.download = `borrador_rotulo_${producto.id}.pdf`;
            enlace.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            const detalle = await detalleDesdeBlob(error);
            mostrarAlertaError(detalle ?? `No se pudo generar el borrador del rótulo de '${producto.nombre}'.`);
            console.log(error);
        } finally {
            setExportando(false);
        }
    };

    return (
        <Modal
            show={producto !== null}
            onHide={onHide}
            size={pantallaCompleta ? undefined : 'xl'}
            fullscreen={pantallaCompleta ? true : undefined}
            scrollable={!pantallaCompleta}
        >
            <Modal.Header closeButton>
                <Modal.Title>Rótulo</Modal.Title>
            </Modal.Header>
            {isLoading || !producto ? (
                <Modal.Body>
                    <div className="d-flex align-items-center gap-2 text-muted">
                        <Spinner animation="border" size="sm" /> Cargando…
                    </div>
                </Modal.Body>
            ) : error || !evaluacion ? (
                <Modal.Body><p className="text-muted">No se pudo cargar el rotulado del producto.</p></Modal.Body>
            ) : (
                <Tab.Container activeKey={pestania} onSelect={(nueva) => setPestania(nueva ?? 'frontal')}>
                    <Modal.Body
                        className={`text-start${pantallaCompleta ? ' d-flex flex-column' : ''}`}
                        style={pantallaCompleta ? { minHeight: 0, overflowY: 'auto' } : undefined}
                    >
                        <Nav variant="tabs" className="mb-3">
                            <Nav.Item>
                                <Nav.Link eventKey="frontal">Rotulado frontal</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="caa">Datos del rótulo (CAA)</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="empaquetado">Vista previa del empaquetado</Nav.Link>
                            </Nav.Item>
                        </Nav>
                        <Tab.Content className={pantallaCompleta ? 'd-flex flex-column flex-grow-1' : undefined}>
                            <Tab.Pane eventKey="frontal">
                                <FormularioRotulado
                                    key={`${producto.id}-${JSON.stringify(evaluacion)}`}
                                    producto={producto}
                                    evaluacion={evaluacion}
                                    puedeEditar={puedeEditar}
                                    onGuardado={(nueva) => clave && mutate(clave, nueva, false)}
                                />
                            </Tab.Pane>
                            <Tab.Pane eventKey="caa">
                                <RotuladoCAAForm producto={producto} puedeEditar={puedeEditar} />
                            </Tab.Pane>
                            <Tab.Pane
                                eventKey="empaquetado"
                                className={pantallaCompleta ? 'd-flex flex-column flex-grow-1' : undefined}
                            >
                                <RotuladoEmpaquetado producto={producto} puedeEditar={puedeEditar} />
                            </Tab.Pane>
                        </Tab.Content>
                    </Modal.Body>
                    <Modal.Footer>
                        {puedeEditar && (
                            <Button
                                variant="outline-primary"
                                className="me-auto"
                                onClick={exportarBorrador}
                                disabled={exportando}
                            >
                                <i className="bi bi-file-earmark-pdf me-1"></i>
                                {exportando ? "Generando…" : "Exportar borrador (PDF)"}
                            </Button>
                        )}
                        <Button variant="secondary" onClick={onHide}>Cerrar</Button>
                    </Modal.Footer>
                </Tab.Container>
            )}
        </Modal>
    );
}

interface FormularioRotuladoProps {
    producto: Producto;
    evaluacion: EvaluacionRotulado;
    puedeEditar: boolean;
    onGuardado: (evaluacion: EvaluacionRotulado) => void;
}

type ValorDeclarado = "" | "si" | "no";

const aValor = (valor: boolean | null): ValorDeclarado => (valor === null ? "" : valor ? "si" : "no");
const aBooleano = (valor: ValorDeclarado): boolean | null => (valor === "" ? null : valor === "si");

function FormularioRotulado({ producto, evaluacion, puedeEditar, onGuardado }: FormularioRotuladoProps) {
    const [guardando, setGuardando] = useState(false);
    const [envasado, setEnvasado] = useState<ValorDeclarado>(aValor(evaluacion.envasado_ausencia_cliente));
    const [declarados, setDeclarados] = useState<Record<string, ValorDeclarado>>(
        Object.fromEntries(evaluacion.marcas.map((marca) => [marca.clave, aValor(marca.declarado)])),
    );

    const guardar = async () => {
        setGuardando(true);
        try {
            const datos = {
                envasado_ausencia_cliente: aBooleano(envasado),
                ...Object.fromEntries(
                    evaluacion.marcas.map((marca) => [CAMPO_DECLARACION_POR_MARCA[marca.clave], aBooleano(declarados[marca.clave])]),
                ) as Record<CampoDeclaracion, boolean | null>,
            } satisfies RotuladoProductoUpdate;
            const { data } = await api.put<EvaluacionRotulado>(`/rotulado/productos/${producto.id}`, datos);
            onGuardado(data);
            mostrarAlertaExito(data.mensaje);
        } catch (error) {
            let mensajeFinal = `No se pudo guardar el rotulado del producto '${producto.nombre}'.`;
            const detail = isAxiosError(error) ? error.response?.data?.detail : undefined;
            if (detail) {
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        } finally {
            setGuardando(false);
        }
    };

    return (
        <>
            <p className="mb-3"><strong>Producto:</strong> {producto.nombre}</p>

            <Form.Group className="mb-4">
                <Form.Label className="fw-bold">¿El producto se comercializa envasado en ausencia del cliente?</Form.Label>
                <div className="d-flex gap-4">
                    {([["si", "Sí"], ["no", "No"]] as const).map(([valor, etiqueta]) => (
                        <Form.Check
                            key={valor}
                            type="radio"
                            id={`envasado-${valor}`}
                            name="envasado"
                            label={etiqueta}
                            checked={envasado === valor}
                            disabled={!puedeEditar}
                            onChange={() => setEnvasado(valor)}
                        />
                    ))}
                </div>
                {!evaluacion.requiere_envasado_ausencia_cliente && (
                    <Form.Text className="text-muted">Las reglas vigentes no tienen en cuenta esta condición.</Form.Text>
                )}
            </Form.Group>

            <Form.Label className="fw-bold mb-1">Agregados, edulcorantes y cafeína</Form.Label>
            <p className="text-muted small mb-2">
                Se toman de las marcas de los ingredientes de la receta. Podés corregirlas si no reflejan el producto.
            </p>
            <Table size="sm" className="align-middle mb-4">
                <thead>
                    <tr>
                        <th>Marca</th>
                        <th>Según ingredientes</th>
                        <th style={{ width: '13rem' }}>Valor del producto</th>
                    </tr>
                </thead>
                <tbody>
                    {evaluacion.marcas.map((marca) => (
                        <tr key={marca.clave}>
                            <td>
                                {marca.nombre}
                                {!marca.considerada && <div className="text-muted small">No se considera en las reglas vigentes</div>}
                            </td>
                            <td>
                                <span className={marca.sugerido ? 'fw-semibold' : 'text-muted'}>{marca.sugerido ? 'Sí' : 'No'}</span>
                                {marca.insumos.length > 0 && <div className="text-muted small">{marca.insumos.join(', ')}</div>}
                            </td>
                            <td>
                                <Form.Select
                                    size="sm"
                                    aria-label={`Valor de ${marca.nombre}`}
                                    value={declarados[marca.clave]}
                                    disabled={!puedeEditar}
                                    onChange={(e) => setDeclarados({ ...declarados, [marca.clave]: e.target.value as ValorDeclarado })}
                                >
                                    <option value="">Según ingredientes ({marca.sugerido ? 'Sí' : 'No'})</option>
                                    <option value="si">Sí</option>
                                    <option value="no">No</option>
                                </Form.Select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <RotuladoFrontal evaluacion={evaluacion} />
            <p className="text-muted small mt-2 mb-3">Evaluado con la versión {evaluacion.reglas_version} de las reglas de rotulado.</p>

            {puedeEditar && (
                <div className="d-flex justify-content-end">
                    <Button variant="success" onClick={guardar} disabled={guardando}>
                        {guardando ? "Guardando..." : "Guardar y evaluar"}
                    </Button>
                </div>
            )}
        </>
    );
}
