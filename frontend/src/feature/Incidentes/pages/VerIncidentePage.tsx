import { Container, Alert, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import { ACTIVO_ESTILOS, ESTADO_INCIDENTE_ESTILOS, type Incidente } from "../types";
import { EstadoBadge } from "../../../components/EstadoBadge";
import { Dato } from "../../../components/Dato";
import { useAuth } from '../../../hooks';
import { PageLoading } from "../../../components/PageLoading";

const obtenerNombreArchivo = (base64: string | null | undefined): string => {
    if (!base64) return "";

    const matchNombre = base64.match(/;name=([^;]+);base64,/);      // Esto busca adentro del texto Base64 si esta guardado la parte ';name=([^;]+);base64,' y saca lo que esta en el medio que es el nombre del archivo

    if (matchNombre?.[1]) {
        return decodeURIComponent(matchNombre[1]);      // Convierte los espacios o acentos en texto normal para que se vea bien en la pantalla.
    }

    {/* Estos if y return son por si entras al editar y no seleccionaste otro archivo */}
    if (base64.startsWith("data:image/")) return "Foto adjunta";
    return "Foto adjunta";
};

export function VerIncidentePage() {
    const navigate = useNavigate();
    const { id } = useParams(); 
    const { data: incidente, isLoading, error } = useApi<Incidente>(`/incidentes/${id}`);
    const { currentUser } = useAuth();
    const isAdmin = Boolean(currentUser?.administrar);

    const location = useLocation();
    const origen = location.state?.origen;
    const volverA = origen === "historial"
        ? "/incidentes-historial"
        : "/incidentes/";
        
    if (isLoading) return <PageLoading title="Detalle del Incidente" />;


    if (!incidente || error) return (
        <Container>
            <PageHeader title="Incidente no encontrado." />
            <Row className="justify-content-center mt-4">
                <Col md={6}>
                    <Alert variant="danger" className="text-center shadow-sm">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error ? "Ocurrio un error al cargar los datos." : "El Incidente ingresado no existe."}
                    </Alert>
                </Col>
            </Row>
        </Container>
    );

    const tieneRelaciones = Boolean(incidente.lote_produccion_id || incidente.lote_proveedor_id || incidente.insumo_lote_id);
    const formatearFechaHora = (fecha: string) => new Date(fecha).toLocaleString("es-AR", { hour12: false });

    return (
        <Container>
            <PageHeader title="Detalle del Incidente" />

            <Card className="shadow-sm border-0 rounded-3 mb-4 mt-3 text-start">
                <Card.Body className="p-4">
                    <h6 className="detalle-seccion-titulo">Datos del incidente</h6>
                    <Row className="g-3 mb-4">
                        <Dato etiqueta="Incidente" md={6} lg={4}>
                            <span className="fw-semibold">{incidente.nombre}</span>
                        </Dato>
                        <Dato etiqueta="Tipo de Incidente" md={6} lg={4}>{incidente.tipo?.nombre || "-"}</Dato>
                        <Dato etiqueta="Sector" md={6} lg={4}>
                            {incidente.sector?.nombre || <span className="text-muted fst-italic">Sin sector asignado</span>}
                        </Dato>
                        <Dato etiqueta="Reportado por" md={6} lg={4}>
                            {incidente.operario?.nombre || <span className="text-muted fst-italic">Sin datos del reportante</span>}
                        </Dato>
                        <Dato etiqueta="Descripción" md={12} lg={8}>{incidente.descripcion}</Dato>
                    </Row>

                    {tieneRelaciones && (
                        <>
                            <h6 className="detalle-seccion-titulo">Relacionado con</h6>
                            <Row className="g-3 mb-4">
                                {incidente.lote_produccion_id && (
                                    <Dato etiqueta="Lote de Producción" md={6} lg={4}>
                                        <Button
                                            variant="link"
                                            className="p-0 fw-semibold text-decoration-none text-start"
                                            onClick={() => navigate(`/lotes-produccion/${incidente.lote_produccion_id}`)}
                                        >
                                            Lote #{incidente.lote_produccion_id}
                                            {incidente.lote_produccion?.estado ? ` (${incidente.lote_produccion.estado})` : ""}
                                        </Button>
                                    </Dato>
                                )}
                                {incidente.lote_proveedor_id && (
                                    <Dato etiqueta="Recepción / Lote Proveedor" md={6} lg={4}>
                                        <Button
                                            variant="link"
                                            className="p-0 fw-semibold text-decoration-none text-start"
                                            onClick={() => navigate(`/recepciones/${incidente.lote_proveedor_id}`)}
                                        >
                                            {incidente.lote_proveedor?.numero_remito
                                                ? `Remito ${incidente.lote_proveedor.numero_remito}`
                                                : `Recepción #${incidente.lote_proveedor_id}`}
                                        </Button>
                                    </Dato>
                                )}
                                {incidente.insumo_lote_id && (
                                    <Dato etiqueta="Insumo Alimenticio" md={6} lg={4}>
                                        <Button
                                            variant="link"
                                            className="p-0 fw-semibold text-decoration-none text-start"
                                            onClick={() => navigate(`/insumos-lote/${incidente.insumo_lote_id}`)}
                                        >
                                            {incidente.insumo_lote
                                                ? `Lote ${incidente.insumo_lote.numero_lote} (${incidente.insumo_lote.marca})`
                                                : `Insumo Lote #${incidente.insumo_lote_id}`}
                                        </Button>
                                    </Dato>
                                )}
                            </Row>
                        </>
                    )}

                    <h6 className="detalle-seccion-titulo">Seguimiento</h6>
                    <Row className="g-3">
                        <Dato etiqueta="Fecha de apertura" md={6} lg={3}>
                            {incidente.fecha_abierto ? formatearFechaHora(incidente.fecha_abierto) : "-"}
                        </Dato>
                        <Dato etiqueta="Fecha de cierre" md={6} lg={3}>
                            {incidente.fecha_cierre
                                ? formatearFechaHora(incidente.fecha_cierre)
                                : <span className="text-muted fst-italic">Sin cerrar</span>}
                        </Dato>
                        <Dato etiqueta="Estado del incidente" md={6} lg={3}>
                            <EstadoBadge tono={ESTADO_INCIDENTE_ESTILOS[incidente.estado].tono} icono={ESTADO_INCIDENTE_ESTILOS[incidente.estado].icono}>
                                {incidente.estado}
                            </EstadoBadge>
                        </Dato>
                        <Dato etiqueta="Estado actual" md={6} lg={3}>
                            <EstadoBadge tono={ACTIVO_ESTILOS[incidente.activo ? 'Activo' : 'Inactivo'].tono} icono={ACTIVO_ESTILOS[incidente.activo ? 'Activo' : 'Inactivo'].icono}>
                                {incidente.activo ? 'Activo' : 'Inactivo'}
                            </EstadoBadge>
                        </Dato>
                        <Dato etiqueta="Foto">
                            {incidente.foto_opcional ? (
                                <div>
                                    <img
                                        src={incidente.foto_opcional}
                                        alt="Foto"
                                        style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px' }}
                                        className="border shadow-sm"
                                    />
                                    <div className="small text-muted mt-1 mb-2">
                                        {obtenerNombreArchivo(incidente.foto_opcional)}
                                    </div>
                                    <a
                                        href={incidente.foto_opcional}
                                        download={`incidente_${incidente.nombre}`}
                                        className="btn btn-outline-primary btn-sm"
                                    >
                                        <i className="bi bi-download me-1"></i>Descargar Foto Adjunta
                                    </a>
                                </div>
                            ) : (
                                <span className="text-muted fst-italic">Sin foto adjunta</span>
                            )}
                        </Dato>
                    </Row>
                </Card.Body>
            </Card>

            <div className="d-flex flex-wrap justify-content-start gap-2 mb-4">
                <Button
                    variant="outline-secondary"
                    onClick={() => navigate(volverA)}
                >
                    <i className="bi bi-arrow-left me-1"></i>Volver a la lista
                </Button>
                {isAdmin && (
                    <Button
                        variant="primary"
                        disabled={!incidente.activo}
                        onClick={() => navigate(`/incidentes/${incidente.id}/edit`)}
                    >
                        <i className="bi bi-pencil me-1"></i>Editar Incidente
                    </Button>
                )}
            </div>
        </Container>
    );
}
