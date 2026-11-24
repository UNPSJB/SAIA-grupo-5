import { useState } from 'react';
import { Alert, Button, ButtonGroup, Card, Container, Form, Row, Tab, Table, ToggleButton } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { mutate } from 'swr';
import { isAxiosError } from 'axios';
import { AppTabs } from '../../../components/AppTabs';
import { Dato } from '../../../components/Dato';
import { EstadoBadge } from '../../../components/EstadoBadge';
import { PageHeader } from '../../../components/PageHeader';
import { PageLoading } from '../../../components/PageLoading';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../libs/axios';
import { mostrarAlertaError, mostrarAlertaExito } from '../../../libs/alertas';
import type { Producto } from '../../Productos/types';
import { RotuladoFrontal } from '../components/RotuladoFrontal';
import { RotuladoCAAForm } from '../components/RotuladoCAAForm';
import { RotuladoEmpaquetado } from '../components/RotuladoEmpaquetado';
import './RotuladoProductoPage.css';
import { CAMPO_DECLARACION_POR_MARCA, type CampoDeclaracion, type EvaluacionRotulado, type RotuladoProductoUpdate } from '../types';

const TITULO = 'Rótulo del producto';

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

export function RotuladoProductoPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const puedeEditar = Boolean(currentUser?.administrar);

    const { data: producto, isLoading: cargandoProducto } = useApi<Producto>(id ? `/productos/${id}` : null);
    const clave = id ? `/rotulado/productos/${id}` : null;
    const { data: evaluacion, error, isLoading } = useApi<EvaluacionRotulado>(clave);
    const [exportando, setExportando] = useState(false);

    if (cargandoProducto || isLoading) return <PageLoading title={TITULO} />;

    if (!producto || error || !evaluacion) return (
        <Container>
            <PageHeader title={TITULO} />
            <Alert variant="danger">No se pudo cargar el rotulado del producto.</Alert>
            <Button variant="outline-secondary" onClick={() => navigate('/productos')}>
                <i className="bi bi-arrow-left me-1"></i>Volver al listado
            </Button>
        </Container>
    );

    const exportarBorrador = async () => {
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
        <Container fluid className="rotulado-producto" style={{ maxWidth: '1400px' }}>
            <PageHeader
                eyebrow="ROTULADO"
                title={producto.nombre}
                subtitle="Rotulado frontal, datos del rótulo según el CAA y vista previa del empaquetado."
                actions={puedeEditar ? (
                    <Button variant="outline-primary" onClick={exportarBorrador} disabled={exportando}>
                        <i className="bi bi-file-earmark-pdf me-1"></i>
                        {exportando ? 'Generando…' : 'Exportar borrador (PDF)'}
                    </Button>
                ) : undefined}
            />

            <AppTabs defaultActiveKey="frontal" id="secciones-rotulado" className="mb-3 mt-3" mountOnEnter>
                <Tab eventKey="frontal" title="Rotulado frontal">
                    <FormularioRotulado
                        key={`${producto.id}-${JSON.stringify(evaluacion)}`}
                        producto={producto}
                        evaluacion={evaluacion}
                        puedeEditar={puedeEditar}
                        onGuardado={(nueva) => clave && mutate(clave, nueva, false)}
                    />
                </Tab>
                <Tab eventKey="caa" title="Datos del rótulo (CAA)">
                    <Card className="shadow-sm border-0 rounded-3 mb-4 text-start">
                        <Card.Body className="p-4">
                            <RotuladoCAAForm producto={producto} puedeEditar={puedeEditar} />
                        </Card.Body>
                    </Card>
                </Tab>
                <Tab eventKey="empaquetado" title="Vista previa del empaquetado">
                    <Card className="shadow-sm border-0 rounded-3 mb-4 text-start">
                        <Card.Body className="p-4">
                            <RotuladoEmpaquetado producto={producto} puedeEditar={puedeEditar} />
                        </Card.Body>
                    </Card>
                </Tab>
            </AppTabs>

            <div className="d-flex flex-wrap justify-content-start gap-2 mb-4">
                <Button variant="outline-secondary" onClick={() => navigate('/productos')}>
                    <i className="bi bi-arrow-left me-1"></i>Volver al listado
                </Button>
                <Button variant="outline-primary" onClick={() => navigate(`/productos/${producto.id}`)}>
                    <i className="bi bi-eye me-1"></i>Ver producto
                </Button>
            </div>
        </Container>
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
        <Card className="shadow-sm border-0 rounded-3 mb-4 text-start">
            <Card.Body className="p-4">
                <h6 className="detalle-seccion-titulo">Condición de comercialización</h6>
                <Row className="g-3 mb-4">
                    <Dato etiqueta="¿Se comercializa envasado en ausencia del cliente?" md={8}>
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
                    </Dato>
                    <Dato etiqueta="Reglas aplicadas" md={4}>
                        <EstadoBadge tono="info" icono="bi-journal-check">Versión {evaluacion.reglas_version}</EstadoBadge>
                    </Dato>
                </Row>

                <h6 className="detalle-seccion-titulo">Agregados, edulcorantes y cafeína</h6>
                <p className="text-muted small mb-2">
                    Se toman de las marcas de los ingredientes y aditivos de la receta. Podés corregirlas si no reflejan el producto.
                </p>
                <Table responsive bordered hover size="sm" className="align-middle mb-4">
                    <thead className="table-light">
                        <tr>
                            <th className="px-3">Marca</th>
                            <th className="px-3">Según ingredientes</th>
                            <th className="px-3">Valor del producto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {evaluacion.marcas.map((marca) => (
                            <tr key={marca.clave}>
                                <td className="px-3 py-2">
                                    <span className="fw-semibold">{marca.nombre}</span>
                                    {!marca.considerada && <div className="text-muted small">No se considera en las reglas vigentes</div>}
                                </td>
                                <td className="px-3 py-2">
                                    <span className={marca.sugerido ? 'fw-semibold' : 'text-muted'}>{marca.sugerido ? 'Sí' : 'No'}</span>
                                    {marca.insumos.length > 0 && <div className="text-muted small">{marca.insumos.join(', ')}</div>}
                                </td>
                                <td className="px-3 py-2">
                                    <ButtonGroup size="sm" className="valor-marca" aria-label={`Valor de ${marca.nombre}`}>
                                        {([
                                            ["", `Según ingredientes (${marca.sugerido ? 'Sí' : 'No'})`],
                                            ["si", "Sí"],
                                            ["no", "No"],
                                        ] as const).map(([valor, etiqueta]) => (
                                            <ToggleButton
                                                key={valor || 'auto'}
                                                id={`marca-${marca.clave}-${valor || 'auto'}`}
                                                type="radio"
                                                name={`marca-${marca.clave}`}
                                                variant="outline-primary"
                                                value={valor}
                                                checked={declarados[marca.clave] === valor}
                                                disabled={!puedeEditar}
                                                onChange={() => setDeclarados({ ...declarados, [marca.clave]: valor })}
                                            >
                                                {etiqueta}
                                            </ToggleButton>
                                        ))}
                                    </ButtonGroup>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                <h6 className="detalle-seccion-titulo">Resultado del rotulado frontal</h6>
                <RotuladoFrontal evaluacion={evaluacion} />

                {puedeEditar && (
                    <div className="d-flex justify-content-end mt-3">
                        <Button variant="success" onClick={guardar} disabled={guardando}>
                            <i className="bi bi-floppy me-1"></i>{guardando ? "Guardando..." : "Guardar y evaluar"}
                        </Button>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
}
