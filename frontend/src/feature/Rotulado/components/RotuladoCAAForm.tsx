import { useState } from 'react';
import { Alert, Badge, Button, Form, ProgressBar, Row, Spinner, Table } from 'react-bootstrap';
import { mutate } from 'swr';
import { isAxiosError } from 'axios';
import { api } from '../../../libs/axios';
import { Dato } from '../../../components/Dato';
import { useApi } from '../../../hooks/useApi';
import { mostrarAlertaError, mostrarAlertaExito } from '../../../libs/alertas';
import type { Producto } from '../../Productos/types';
import type { BorradorRotuladoCAA, CampoCompletitud, DatosRotuladoCAA, ListaIngredientesRotulo } from '../types';

interface RotuladoCAAFormProps {
    producto: Producto;
    puedeEditar: boolean;
}

export function RotuladoCAAForm({ producto, puedeEditar }: RotuladoCAAFormProps) {
    const clave = `/rotulado/productos/${producto.id}/borrador`;
    const { data, error, isLoading } = useApi<BorradorRotuladoCAA>(clave);

    if (isLoading) {
        return (
            <div className="d-flex align-items-center gap-2 text-muted">
                <Spinner animation="border" size="sm" /> Cargando los datos del rótulo…
            </div>
        );
    }

    if (error || !data) {
        return <p className="text-muted mb-0">No se pudieron cargar los datos del rótulo del producto.</p>;
    }

    return (
        <FormularioCAA
            key={`${producto.id}-${data.fecha_actualizacion ?? 'nuevo'}`}
            producto={producto}
            borrador={data}
            clave={clave}
            puedeEditar={puedeEditar}
        />
    );
}
interface OrdenIngredientesProps {
    lista: ListaIngredientesRotulo;
    producto: Producto;
    claveBorrador: string;
    puedeEditar: boolean;
    sinGuardar: boolean;
    textoEditado: boolean;
}

function OrdenIngredientes({ lista, producto, claveBorrador, puedeEditar, sinGuardar, textoEditado }: OrdenIngredientesProps) {
    const [moviendo, setMoviendo] = useState(false);
    const { ingredientes } = lista;

    const enviar = async (orden: number[]) => {
        if (textoEditado && !window.confirm(
            'Reordenar vuelve a generar la lista de ingredientes y reemplaza el texto que editaste a mano. ¿Continuar?',
        )) return;
        setMoviendo(true);
        try {
            const { data } = await api.put<BorradorRotuladoCAA>(
                `/rotulado/productos/${producto.id}/ingredientes/orden`, { orden },
            );
            await mutate(claveBorrador, data, false);
        } catch (error) {
            const detail = isAxiosError(error) ? error.response?.data?.detail : undefined;
            mostrarAlertaError(typeof detail === 'string' ? detail : 'No se pudo cambiar el orden de los ingredientes.');
        } finally {
            setMoviendo(false);
        }
    };

    const mover = (indice: number, delta: number) => {
        const ids = ingredientes.map((i) => i.insumo_id);
        [ids[indice], ids[indice + delta]] = [ids[indice + delta], ids[indice]];
        enviar(ids);
    };

    const puedeMover = (indice: number, delta: number) => {
        const otro = ingredientes[indice + delta];
        const actual = ingredientes[indice];
        return puedeEditar && !sinGuardar && !moviendo && !!otro
            && actual.porcentaje !== null && actual.porcentaje === otro.porcentaje;
    };

    return (
        <div className="mb-3">
            <div className="d-flex align-items-center mb-1">
                <span className="fw-semibold me-2">Orden de los ingredientes</span>
                {lista.orden_manual && <Badge bg="warning" text="dark">Orden ajustado a mano</Badge>}
                {lista.orden_manual && puedeEditar && (
                    <Button size="sm" variant="link" disabled={sinGuardar || moviendo} onClick={() => enviar([])}>
                        Volver al orden automático
                    </Button>
                )}
            </div>
            <Table size="sm" bordered className="mb-1">
                <tbody>
                    {ingredientes.map((ing, indice) => (
                        <tr key={ing.insumo_id}>
                            <td style={{ width: '2.5rem' }}>{indice + 1}</td>
                            <td>{ing.texto}</td>
                            <td style={{ width: '6rem' }}>{ing.porcentaje !== null ? `${ing.porcentaje} %` : 'sin %'}</td>
                            <td style={{ width: '6rem' }} className="text-end">
                                <Button size="sm" variant="outline-secondary" className="me-1"
                                    disabled={!puedeMover(indice, -1)} onClick={() => mover(indice, -1)}>
                                    <i className="bi bi-arrow-up" />
                                </Button>
                                <Button size="sm" variant="outline-secondary"
                                    disabled={!puedeMover(indice, 1)} onClick={() => mover(indice, 1)}>
                                    <i className="bi bi-arrow-down" />
                                </Button>
                            </td>
                        </tr>
                    ))}
                    {lista.aditivos.map((ad) => (
                        <tr key={ad.texto} className="text-muted">
                            <td>·</td>
                            <td colSpan={3}>{ad.texto}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Form.Text className="text-muted">
                Solo se pueden intercambiar ingredientes con el mismo porcentaje.
                {sinGuardar && ' Guardá el borrador antes de reordenar.'}
            </Form.Text>
        </div>
    );
}
interface FormularioCAAProps {
    producto: Producto;
    borrador: BorradorRotuladoCAA;
    clave: string;
    puedeEditar: boolean;
}

const OrigenBadge = ({ campo }: { campo?: CampoCompletitud }) => {
    if (!campo?.automatico) return null;
    return campo.origen === 'manual' ? (
        <Badge bg="warning" text="dark">Editado a mano</Badge>
    ) : (
        <Badge bg="secondary">Automático · {campo.referencia}</Badge>
    );
};

function FormularioCAA({ producto, borrador, clave, puedeEditar }: FormularioCAAProps) {
    const [datos, setDatos] = useState<DatosRotuladoCAA>(borrador.datos);
    const [guardando, setGuardando] = useState(false);

    const cambiar = <K extends keyof DatosRotuladoCAA>(campo: K, valor: DatosRotuladoCAA[K]) =>
        setDatos((previos) => ({ ...previos, [campo]: valor }));

    const campo = (claveCampo: string): CampoCompletitud | undefined =>
        borrador.campos.find((c) => c.clave === claveCampo);

    const valorTexto = (claveCampo: string) => {
        if (claveCampo === 'informacion_nutricional') {
            return borrador.tabla_nutricional?.length ? 'ok' : '';
        }
        const valor = datos[claveCampo as keyof DatosRotuladoCAA];
        return typeof valor === 'string' ? valor.trim() : valor ? 'ok' : '';
    };

    // El indicador se recalcula con lo que hay en pantalla, así se ve qué falta
    // antes de guardar (guardar nunca está bloqueado por datos faltantes).
    const obligatorios = borrador.campos.filter((c) => {
        if (!datos.es_importado && c.clave.startsWith('importador_')) return false;
        // Al marcar el producto como importado sus datos pasan a ser obligatorios
        // aunque el borrador guardado todavía no lo refleje.
        const obligatorio = c.obligatorio || (datos.es_importado && c.clave !== 'importador_cuit'
            && c.clave.startsWith('importador_'));
        return obligatorio;
    });
    const faltantes = obligatorios.filter((c) => valorTexto(c.clave) === '').map((c) => c.nombre);
    const clavesObligatorias = new Set(obligatorios.map((c) => c.clave));
    const etiqueta = (claveCampo: string, texto: string) =>
        clavesObligatorias.has(claveCampo) ? `${texto} (*)` : texto;
    const completitud = obligatorios.length
        ? Math.round((100 * (obligatorios.length - faltantes.length)) / obligatorios.length)
        : 100;

    const guardar = async () => {
        setGuardando(true);
        try {
            const { data } = await api.put<BorradorRotuladoCAA>(clave, {
                ...datos,
                fecha_duracion: datos.fecha_duracion || null,
            });
            await mutate(clave, data, false);
            mostrarAlertaExito(
                data.faltantes.length
                    ? `Borrador guardado. Faltan ${data.faltantes.length} datos obligatorios.`
                    : 'Borrador del rótulo guardado y completo.',
            );
        } catch (error) {
            let mensaje = `No se pudieron guardar los datos del rótulo de '${producto.nombre}'.`;
            const detail = isAxiosError(error) ? error.response?.data?.detail : undefined;
            if (typeof detail === 'string') mensaje = detail;
            if (Array.isArray(detail) && detail[0]?.msg) mensaje = detail[0].msg;
            mostrarAlertaError(mensaje);
            console.log(error);
        } finally {
            setGuardando(false);
        }
    };

    const textoAyuda = (claveCampo: string) =>
        campo(claveCampo)?.referencia ? `Completado desde ${campo(claveCampo)?.referencia}.` : undefined;

    return (
        <>
            <Alert variant={faltantes.length ? 'warning' : 'success'} className="py-2">
                <div className="d-flex justify-content-between align-items-center">
                    <strong>Completitud del rótulo: {completitud}%</strong>
                    <span className="small">
                        {faltantes.length
                            ? `Faltan ${faltantes.length} de ${obligatorios.length} campos obligatorios`
                            : 'Todos los campos obligatorios están completos'}
                    </span>
                </div>
                <ProgressBar
                    now={completitud}
                    variant={faltantes.length ? 'warning' : 'success'}
                    className="my-2"
                    style={{ height: '0.5rem' }}
                />
                {faltantes.length > 0 && (
                    <div className="small">
                        Faltan: {faltantes.join(', ')}. Podés guardar el borrador y completarlos después.
                    </div>
                )}
            </Alert>

            <p className="text-muted small mb-3">Los campos marcados con (*) son obligatorios para el rótulo.</p>

            <h6 className="detalle-seccion-titulo">Identificación del producto</h6>
            <Row className="g-3 mb-4">
                <Dato etiqueta={etiqueta('denominacion_venta', 'Denominación de venta')} accion={<OrigenBadge campo={campo('denominacion_venta')} />} md={7}>
                    <Form.Group controlId="caa-denominacion">
                        <Form.Label className="visually-hidden">Denominación de venta</Form.Label>
                        <Form.Control
                            value={datos.denominacion_venta}
                            maxLength={120}
                            disabled={!puedeEditar}
                            onChange={(e) => cambiar('denominacion_venta', e.target.value)}
                        />
                        <Form.Text className="text-muted">{textoAyuda('denominacion_venta')}</Form.Text>
                    </Form.Group>
                </Dato>
                <Dato etiqueta={etiqueta('contenido_neto', 'Contenido neto')} accion={<OrigenBadge campo={campo('contenido_neto')} />} md={5}>
                    <Form.Group controlId="caa-contenido">
                        <Form.Label className="visually-hidden">Contenido neto</Form.Label>
                        <Form.Control
                            value={datos.contenido_neto}
                            maxLength={60}
                            disabled={!puedeEditar}
                            onChange={(e) => cambiar('contenido_neto', e.target.value)}
                        />
                        <Form.Text className="text-muted">{textoAyuda('contenido_neto')}</Form.Text>
                    </Form.Group>
                </Dato>
            </Row>

            <h6 className="detalle-seccion-titulo">Identificación del origen</h6>
            <Row className="g-3 mb-4">
                <Dato etiqueta={etiqueta('razon_social', 'Razón social del elaborador')} accion={<OrigenBadge campo={campo('razon_social')} />} md={6}>
                    <Form.Group controlId="caa-razon-social">
                        <Form.Label className="visually-hidden">Razón social del elaborador</Form.Label>
                        <Form.Control
                            value={datos.razon_social}
                            maxLength={150}
                            disabled={!puedeEditar}
                            onChange={(e) => cambiar('razon_social', e.target.value)}
                        />
                        <Form.Text className="text-muted">{textoAyuda('razon_social')}</Form.Text>
                    </Form.Group>
                </Dato>
                <Dato etiqueta={etiqueta('domicilio', 'Domicilio del elaborador')} accion={<OrigenBadge campo={campo('domicilio')} />} md={6}>
                    <Form.Group controlId="caa-domicilio">
                        <Form.Label className="visually-hidden">Domicilio del elaborador</Form.Label>
                        <Form.Control
                            value={datos.domicilio}
                            maxLength={200}
                            disabled={!puedeEditar}
                            onChange={(e) => cambiar('domicilio', e.target.value)}
                        />
                        <Form.Text className="text-muted">{textoAyuda('domicilio')}</Form.Text>
                    </Form.Group>
                </Dato>
                <Dato etiqueta={etiqueta('numero_registro', 'Número de RNPA/RPPA')} accion={<OrigenBadge campo={campo('numero_registro')} />} md={6}>
                    <Form.Group controlId="caa-registro">
                        <Form.Label className="visually-hidden">Número de RNPA/RPPA</Form.Label>
                        <Form.Control
                            value={datos.numero_registro}
                            maxLength={30}
                            placeholder="RNPA 1234567"
                            disabled={!puedeEditar}
                            onChange={(e) => cambiar('numero_registro', e.target.value)}
                        />
                        <Form.Text className="text-muted">
                            {textoAyuda('numero_registro')} Dato declarado por el elaborador; el sistema no lo verifica contra registros oficiales.
                        </Form.Text>
                    </Form.Group>
                </Dato>
                <Dato etiqueta="Procedencia" md={6}>
                    <Form.Check
                        type="checkbox"
                        id="caa-importado"
                        label="El producto es importado"
                        checked={datos.es_importado}
                        disabled={!puedeEditar}
                        onChange={(e) => cambiar('es_importado', e.target.checked)}
                    />
                </Dato>
            </Row>

            {datos.es_importado && (
                <>
                    <h6 className="detalle-seccion-titulo">Importador</h6>
                    <Row className="g-3 mb-4">
                        <Dato etiqueta={etiqueta('importador_razon_social', 'Razón social del importador')} md={5}>
                            <Form.Group controlId="caa-importador-razon">
                                <Form.Label className="visually-hidden">Razón social del importador</Form.Label>
                                <Form.Control
                                    value={datos.importador_razon_social}
                                    maxLength={150}
                                    disabled={!puedeEditar}
                                    onChange={(e) => cambiar('importador_razon_social', e.target.value)}
                                />
                            </Form.Group>
                        </Dato>
                        <Dato etiqueta={etiqueta('importador_domicilio', 'Domicilio del importador')} md={4}>
                            <Form.Group controlId="caa-importador-domicilio">
                                <Form.Label className="visually-hidden">Domicilio del importador</Form.Label>
                                <Form.Control
                                    value={datos.importador_domicilio}
                                    maxLength={200}
                                    disabled={!puedeEditar}
                                    onChange={(e) => cambiar('importador_domicilio', e.target.value)}
                                />
                            </Form.Group>
                        </Dato>
                        <Dato etiqueta={etiqueta('importador_cuit', 'CUIT')} md={3}>
                            <Form.Group controlId="caa-importador-cuit">
                                <Form.Label className="visually-hidden">CUIT del importador</Form.Label>
                                <Form.Control
                                    value={datos.importador_cuit}
                                    maxLength={20}
                                    disabled={!puedeEditar}
                                    onChange={(e) => cambiar('importador_cuit', e.target.value)}
                                />
                            </Form.Group>
                        </Dato>
                    </Row>
                </>
            )}

            <h6 className="detalle-seccion-titulo">Lote y fecha de duración</h6>
            <Row className="g-3 mb-4">
                <Dato etiqueta={etiqueta('identificacion_lote', 'Identificación del lote')} accion={<OrigenBadge campo={campo('identificacion_lote')} />} md={7}>
                    <Form.Group controlId="caa-lote">
                        <Form.Label className="visually-hidden">Identificación del lote</Form.Label>
                        <Form.Control
                            value={datos.identificacion_lote}
                            maxLength={100}
                            disabled={!puedeEditar}
                            onChange={(e) => cambiar('identificacion_lote', e.target.value)}
                        />
                        <Form.Text className="text-muted">{textoAyuda('identificacion_lote')}</Form.Text>
                    </Form.Group>
                </Dato>
                <Dato etiqueta={etiqueta('fecha_duracion', 'Fecha de duración')} md={5}>
                    <Form.Group controlId="caa-fecha-duracion">
                        <Form.Label className="visually-hidden">Fecha de duración</Form.Label>
                        <Form.Control
                            type="date"
                            value={datos.fecha_duracion ?? ''}
                            disabled={!puedeEditar}
                            onChange={(e) => cambiar('fecha_duracion', e.target.value || null)}
                        />
                    </Form.Group>
                </Dato>
            </Row>

            <h6 className="detalle-seccion-titulo">Lista de ingredientes</h6>
            <Row className="g-3 mb-3">
                <Dato etiqueta={etiqueta('lista_ingredientes', 'Ingredientes')} accion={<OrigenBadge campo={campo('lista_ingredientes')} />}>
                    <Form.Group controlId="caa-ingredientes">
                        <Form.Label className="visually-hidden">Ingredientes</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={datos.lista_ingredientes}
                            maxLength={2000}
                            disabled={!puedeEditar}
                            onChange={(e) => cambiar('lista_ingredientes', e.target.value)}
                        />
                        <Form.Text className="text-muted">
                            {textoAyuda('lista_ingredientes')} Si lo editás, el cambio queda registrado en el historial.
                        </Form.Text>
                    </Form.Group>
                </Dato>
            </Row>
            {borrador.lista_ordenada && (
                <OrdenIngredientes
                    lista={borrador.lista_ordenada}
                    producto={producto}
                    claveBorrador={clave}
                    puedeEditar={puedeEditar}
                    sinGuardar={JSON.stringify(datos) !== JSON.stringify(borrador.datos)}
                    textoEditado={campo('lista_ingredientes')?.origen === 'manual'}
                />
            )}

            <h6 className="detalle-seccion-titulo mt-4">Preparación e instrucciones de uso</h6>
            <Row className="g-3 mb-4">
                <Dato etiqueta={etiqueta('instrucciones_uso', 'Instrucciones de uso (cuando corresponda)')}>
                    <Form.Group controlId="caa-instrucciones">
                        <Form.Label className="visually-hidden">Instrucciones de uso</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            value={datos.instrucciones_uso}
                            maxLength={2000}
                            disabled={!puedeEditar}
                            placeholder="Conservar en frío. Una vez abierto, consumir dentro de los 3 días."
                            onChange={(e) => cambiar('instrucciones_uso', e.target.value)}
                        />
                    </Form.Group>
                </Dato>
            </Row>

            <h6 className="detalle-seccion-titulo">Información nutricional y sellos</h6>
            <Row className="g-3 mb-4">
                <Dato etiqueta={etiqueta('informacion_nutricional', 'Tabla nutricional')} accion={<OrigenBadge campo={campo('informacion_nutricional')} />} lg={7}>
                    {borrador.tabla_nutricional?.length ? (
                        <Table size="sm" bordered responsive className="mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="px-3">Nutriente</th>
                                    <th className="px-3">Por porción</th>
                                    <th className="px-3">%VD</th>
                                    <th className="px-3">Cada 100 g/ml</th>
                                </tr>
                            </thead>
                            <tbody>
                                {borrador.tabla_nutricional.map((fila) => (
                                    <tr key={fila.codigo}>
                                        <td className="px-3">{fila.nombre}</td>
                                        <td className="px-3">{fila.texto_porcion} {fila.unidad}</td>
                                        <td className="px-3">{fila.porcentaje_vd ?? '-'}</td>
                                        <td className="px-3">{fila.texto_100g} {fila.unidad}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <span className="text-muted small">La receta todavía no tiene la información nutricional calculada (E11).</span>
                    )}
                </Dato>
                <Dato etiqueta={etiqueta('sellos', 'Sellos de advertencia')} accion={<OrigenBadge campo={campo('sellos')} />} lg={5}>
                    {borrador.sellos.length ? (
                        <div className="d-flex flex-wrap gap-1">
                            {borrador.sellos.map((sello) => (
                                <Badge key={sello} bg="danger">{sello}</Badge>
                            ))}
                        </div>
                    ) : (
                        <span className="text-muted small">Sin sellos según la evaluación vigente (E12).</span>
                    )}
                </Dato>
            </Row>

            {borrador.historial.length > 0 && (
                <details className="mb-3">
                    <summary className="fw-semibold">Historial de cambios ({borrador.historial.length})</summary>
                    <Table size="sm" className="mt-2 mb-0">
                        <thead>
                            <tr>
                                <th>Campo</th>
                                <th>Valor anterior</th>
                                <th>Valor nuevo</th>
                                <th>Usuario</th>
                                <th>Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {borrador.historial.map((cambio, indice) => (
                                <tr key={`${cambio.campo}-${cambio.fecha_hora}-${indice}`}>
                                    <td>{cambio.nombre_campo}</td>
                                    <td className="text-muted">{cambio.valor_anterior ?? '—'}</td>
                                    <td>{cambio.valor_nuevo ?? '—'}</td>
                                    <td>{cambio.usuario ?? '—'}</td>
                                    <td>{new Date(cambio.fecha_hora).toLocaleString('es-AR')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </details>
            )}

            {puedeEditar && (
                <div className="d-flex justify-content-end">
                    <Button variant="success" onClick={guardar} disabled={guardando}>
                        {guardando ? 'Guardando...' : 'Guardar borrador'}
                    </Button>
                </div>
            )}
        </>
    );
}
