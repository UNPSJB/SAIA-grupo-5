import { useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, ListGroup, Modal, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { mutate } from 'swr';
import { isAxiosError } from 'axios';
import { type TableColumn } from 'react-data-table-component';
import { AppTable } from '../../../components/AppTable';
import { ActionButton } from '../../../components/ActionButton';
import { EstadoBadge } from '../../../components/EstadoBadge';
import { PageHeader } from '../../../components/PageHeader';
import { PageLoading } from '../../../components/PageLoading';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../libs/axios';
import { mostrarAlertaError, mostrarAlertaExito } from '../../../libs/alertas';
import { REGLAS_POR_MARCA, type NewReglasRotulado, type ReglasRotulado } from '../types';

const formatearFecha = (fecha: string | null) =>
    fecha ? new Date(fecha).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" }) : "-";

const vigencia = (reglas: ReglasRotulado) =>
    reglas.vigente
        ? `Desde ${formatearFecha(reglas.fecha_desde_vigencia)}`
        : `Del ${formatearFecha(reglas.fecha_desde_vigencia)} al ${formatearFecha(reglas.fecha_hasta_vigencia)}`;

export function ReglasRotuladoPage() {
    const { currentUser } = useAuth();
    const { data: versiones, error, isLoading } = useApi<ReglasRotulado[]>("/rotulado/reglas");
    const [versionVer, setVersionVer] = useState<ReglasRotulado | null>(null);

    const tituloPagina = "Reglas de rotulado frontal";

    if (isLoading) return <PageLoading title={tituloPagina} />;

    const vigente = versiones?.find((reglas) => reglas.vigente);

    if (error || !versiones || !vigente) return (
        <Container>
            <PageHeader title={tituloPagina} />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar las reglas de rotulado.</Alert>
                </Col>
            </Row>
        </Container>
    );

    const columns: TableColumn<ReglasRotulado>[] = [
        { name: 'Versión', selector: (row) => row.version, sortable: true, center: true, maxWidth: '110px' },
        { name: 'Vigencia', selector: (row) => vigencia(row), minWidth: '240px' },
        { name: 'Motivo del cambio', selector: (row) => row.observacion, grow: 2, wrap: true },
        {
            name: 'Estado',
            center: true,
            cell: (row) => row.vigente
                ? <EstadoBadge tono="success" icono="bi-check-circle-fill">Vigente</EstadoBadge>
                : <EstadoBadge tono="secondary" icono="bi-lock-fill">Solo lectura</EstadoBadge>,
        },
        {
            name: 'Acciones',
            center: true,
            cell: (row) => (
                <ActionButton variant="outline-info" size="sm" tooltip="Ver" icon="bi bi-eye" onClick={() => setVersionVer(row)} />
            ),
        },
    ];

    return (
        <Container>
            <Row className="p-2 align-items-center">
                <Col>
                    <PageHeader
                        eyebrow="DATOS MAESTROS"
                        title={tituloPagina}
                        subtitle="Reglas que definen cuándo le corresponde el rotulado frontal a un producto. Cada cambio genera una nueva versión."
                    />
                </Col>
            </Row>

            <FormularioReglas key={vigente.id} vigente={vigente} puedeEditar={Boolean(currentUser?.administrar)} />

            <h5 className="text-start fw-bold mt-4 mb-2">Historial de versiones</h5>
            <AppTable columns={columns} data={versiones} />

            <Modal show={versionVer !== null} onHide={() => setVersionVer(null)}>
                <Modal.Header closeButton>
                    <Modal.Title>Versión {versionVer?.version} de las reglas</Modal.Title>
                </Modal.Header>
                {versionVer && (
                    <Modal.Body className="text-start">
                        <p className="text-muted small">{vigencia(versionVer)} · {versionVer.observacion}</p>
                        <ListGroup className="mb-3">
                            <ListGroup.Item className="d-flex justify-content-between">
                                Exige comercialización envasada en ausencia del cliente
                                <strong>{versionVer.requiere_envasado_ausencia_cliente ? 'Sí' : 'No'}</strong>
                            </ListGroup.Item>
                            {REGLAS_POR_MARCA.map(({ campo, nombre }) => (
                                <ListGroup.Item key={campo} className="d-flex justify-content-between">
                                    Aplica por {nombre.toLowerCase()}
                                    <strong>{versionVer[campo] ? 'Sí' : 'No'}</strong>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                        <p className="small mb-1"><strong>Mensaje si no corresponde:</strong> {versionVer.mensaje_no_corresponde}</p>
                        <p className="small mb-0"><strong>Mensaje si queda exceptuado:</strong> {versionVer.mensaje_exceptuado}</p>
                    </Modal.Body>
                )}
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setVersionVer(null)}>Cerrar</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

interface FormularioReglasProps {
    vigente: ReglasRotulado;
    puedeEditar: boolean;
}

function FormularioReglas({ vigente, puedeEditar }: FormularioReglasProps) {
    const [guardando, setGuardando] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<NewReglasRotulado>({
        defaultValues: {
            requiere_envasado_ausencia_cliente: vigente.requiere_envasado_ausencia_cliente,
            aplica_por_azucares: vigente.aplica_por_azucares,
            aplica_por_grasas: vigente.aplica_por_grasas,
            aplica_por_sodio: vigente.aplica_por_sodio,
            aplica_por_edulcorantes: vigente.aplica_por_edulcorantes,
            aplica_por_cafeina: vigente.aplica_por_cafeina,
            mensaje_no_corresponde: vigente.mensaje_no_corresponde,
            mensaje_exceptuado: vigente.mensaje_exceptuado,
            observacion: "",
        },
    });

    const onSubmit = async (datos: NewReglasRotulado) => {
        setGuardando(true);
        try {
            const { data } = await api.post<ReglasRotulado>("/rotulado/reglas", {
                ...datos,
                mensaje_no_corresponde: datos.mensaje_no_corresponde.trim(),
                mensaje_exceptuado: datos.mensaje_exceptuado.trim(),
                observacion: datos.observacion.trim(),
            });
            await mutate("/rotulado/reglas");
            mostrarAlertaExito(`Se creó la versión ${data.version} de las reglas de rotulado.`);
        } catch (error) {
            let mensajeFinal = "No se pudo guardar la nueva versión de las reglas.";
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

    const validarTexto = (minimo: number, campo: string) => ({
        required: `${campo} es obligatorio.`,
        validate: (valor: string | boolean) => String(valor).trim().length >= minimo || `${campo} debe tener al menos ${minimo} caracteres.`,
        maxLength: { value: 300, message: `${campo} no puede superar los 300 caracteres.` },
    });

    return (
        <Card className="shadow-sm border-0 text-start">
            <Card.Header className="bg-white d-flex flex-wrap align-items-center gap-2">
                <span className="fw-bold">Versión {vigente.version}</span>
                <EstadoBadge tono="success" icono="bi-check-circle-fill">Vigente</EstadoBadge>
                <span className="text-muted small">{vigencia(vigente)}</span>
            </Card.Header>
            <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Card.Body>
                    <fieldset disabled={!puedeEditar}>
                        <Form.Check
                            type="switch"
                            id="requiere_envasado"
                            className="mb-3"
                            label="Solo corresponde el rotulado si el producto se comercializa envasado en ausencia del cliente"
                            {...register("requiere_envasado_ausencia_cliente")}
                        />
                        <Form.Label className="fw-bold mb-1">El producto queda alcanzado por el rotulado si tiene:</Form.Label>
                        <div className="d-flex flex-wrap gap-3 mb-1">
                            {REGLAS_POR_MARCA.map(({ campo, nombre }) => (
                                <Form.Check key={campo} type="checkbox" id={campo} label={nombre} {...register(campo)} />
                            ))}
                        </div>
                        <Form.Text className="text-muted d-block mb-3">
                            Si el producto no tiene ninguna de las marcas seleccionadas, queda exceptuado del rotulado frontal.
                        </Form.Text>

                        <Form.Group className="mb-3" controlId="mensaje_no_corresponde">
                            <Form.Label className="fw-bold">Mensaje cuando no corresponde el rotulado</Form.Label>
                            <Form.Control as="textarea" rows={2} {...register("mensaje_no_corresponde", validarTexto(5, "El mensaje"))}
                                isInvalid={!!errors.mensaje_no_corresponde} />
                            <Form.Control.Feedback type="invalid">{errors.mensaje_no_corresponde?.message}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="mensaje_exceptuado">
                            <Form.Label className="fw-bold">Mensaje cuando el producto queda exceptuado</Form.Label>
                            <Form.Control as="textarea" rows={2} {...register("mensaje_exceptuado", validarTexto(5, "El mensaje"))}
                                isInvalid={!!errors.mensaje_exceptuado} />
                            <Form.Control.Feedback type="invalid">{errors.mensaje_exceptuado?.message}</Form.Control.Feedback>
                        </Form.Group>
                        {puedeEditar && (
                            <Form.Group controlId="observacion">
                                <Form.Label className="fw-bold">Motivo del cambio *</Form.Label>
                                <Form.Control type="text" placeholder="Ej. Actualización por nueva resolución"
                                    {...register("observacion", validarTexto(5, "El motivo"))} isInvalid={!!errors.observacion} />
                                <Form.Control.Feedback type="invalid">{errors.observacion?.message}</Form.Control.Feedback>
                            </Form.Group>
                        )}
                    </fieldset>
                </Card.Body>
                {puedeEditar && (
                    <Card.Footer className="bg-light">
                        <Button type="submit" variant="success" disabled={guardando}>
                            <i className="bi bi-floppy me-1"></i>{guardando ? "Guardando..." : "Guardar como nueva versión"}
                        </Button>
                        <span className="text-muted small ms-3">La versión {vigente.version} quedará en el historial como solo lectura.</span>
                    </Card.Footer>
                )}
            </Form>
        </Card>
    );
}
