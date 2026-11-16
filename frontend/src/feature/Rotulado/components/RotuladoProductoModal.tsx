import { useState } from 'react';
import { Button, Form, Modal, Spinner, Table } from 'react-bootstrap';
import { mutate } from 'swr';
import { isAxiosError } from 'axios';
import { api } from '../../../libs/axios';
import { useApi } from '../../../hooks/useApi';
import { mostrarAlertaError, mostrarAlertaExito } from '../../../libs/alertas';
import type { Producto } from '../../Productos/types';
import { RotuladoFrontal } from './RotuladoFrontal';
import { CAMPO_DECLARACION_POR_MARCA, type CampoDeclaracion, type EvaluacionRotulado, type RotuladoProductoUpdate } from '../types';

interface RotuladoProductoModalProps {
    producto: Producto | null;
    onHide: () => void;
    puedeEditar?: boolean;
}

export function RotuladoProductoModal({ producto, onHide, puedeEditar = false }: RotuladoProductoModalProps) {
    const clave = producto ? `/rotulado/productos/${producto.id}` : null;
    const { data: evaluacion, error, isLoading } = useApi<EvaluacionRotulado>(clave);

    return (
        <Modal show={producto !== null} onHide={onHide} size="lg" scrollable>
            <Modal.Header closeButton>
                <Modal.Title>Rotulado frontal</Modal.Title>
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
                <FormularioRotulado
                    key={`${producto.id}-${JSON.stringify(evaluacion)}`}
                    producto={producto}
                    evaluacion={evaluacion}
                    puedeEditar={puedeEditar}
                    onHide={onHide}
                    onGuardado={(nueva) => clave && mutate(clave, nueva, false)}
                />
            )}
        </Modal>
    );
}

interface FormularioRotuladoProps {
    producto: Producto;
    evaluacion: EvaluacionRotulado;
    puedeEditar: boolean;
    onHide: () => void;
    onGuardado: (evaluacion: EvaluacionRotulado) => void;
}

type ValorDeclarado = "" | "si" | "no";

const aValor = (valor: boolean | null): ValorDeclarado => (valor === null ? "" : valor ? "si" : "no");
const aBooleano = (valor: ValorDeclarado): boolean | null => (valor === "" ? null : valor === "si");

function FormularioRotulado({ producto, evaluacion, puedeEditar, onHide, onGuardado }: FormularioRotuladoProps) {
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
            <Modal.Body className="text-start">
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
                <p className="text-muted small mt-2 mb-0">Evaluado con la versión {evaluacion.reglas_version} de las reglas de rotulado.</p>
            </Modal.Body>
            <Modal.Footer className="justify-content-start">
                <Button variant="secondary" onClick={onHide} disabled={guardando}>Cerrar</Button>
                {puedeEditar && (
                    <Button variant="success" onClick={guardar} disabled={guardando}>
                        {guardando ? "Guardando..." : "Guardar y evaluar"}
                    </Button>
                )}
            </Modal.Footer>
        </>
    );
}
