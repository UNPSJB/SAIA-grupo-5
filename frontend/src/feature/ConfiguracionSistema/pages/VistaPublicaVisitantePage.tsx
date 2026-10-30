import { useParams } from "react-router-dom";
import { Alert, Card, Col, Container, Row, Spinner } from "react-bootstrap";
import useSWR from "swr";
import axios from "axios";
import { API_BASE_URL } from "../../../constants/api";

type IndicadorPublico = { clave: string; titulo: string; descripcion: string; valor: string; icono: string };
type DatosPublicos = { establecimiento: string; actualizado: string; indicadores: IndicadorPublico[] };

export function VistaPublicaVisitantePage() {
    const { token } = useParams<{ token: string }>();
    const { data, error, isLoading } = useSWR<DatosPublicos>(
        token ? `${API_BASE_URL}/vista-publica/${token}` : null,
        async (url: string) => (await axios.get(url, { params: { t: Date.now() } })).data,
        { revalidateOnFocus: true, revalidateOnReconnect: true },
    );

    return (
        <main className="min-vh-100" style={{ background: "#f4f8f6" }}>
            <Container className="py-4 py-md-5" style={{ maxWidth: 920 }}>
                {(!data || error || isLoading) && <header className="d-flex align-items-center gap-3 mb-5">
                    <span className="d-grid place-items-center rounded-3 text-white" style={{ width: 48, height: 48, background: "#06794f" }}><i className="bi bi-shield-check fs-4" /></span>
                    <div><span className="text-success fw-semibold small text-uppercase">SAIA</span><div className="fw-bold">Indicadores de cumplimiento</div></div>
                </header>}

                {isLoading && <div className="text-center py-5"><Spinner animation="border" variant="success" /><p className="text-secondary mt-3">Cargando indicadores</p></div>}
                {error && <Alert variant="light" className="border text-center py-5">
                    <i className="bi bi-link-45deg fs-2 text-secondary d-block mb-2" />
                    <h1 className="h5">Vista pública no disponible</h1>
                    <p className="text-secondary mb-0">El enlace no existe o fue desactivado.</p>
                </Alert>}

                {data && !error && <>
                    <section className="mb-4">
                        <h1 className="display-6 fw-bold mb-2" style={{ color: "#25343a" }}>{data.establecimiento}</h1>
                        <p className="text-secondary mb-0">Indicadores de cumplimiento</p>
                    </section>
                    {data.indicadores.length > 0 && <Row className="g-3">
                        {data.indicadores.map((indicador) => <Col xs={12} md={6} key={indicador.clave}>
                            <Card className="h-100 border-0 shadow-sm"><Card.Body className="p-4">
                                <span className="d-inline-grid place-items-center rounded-3 mb-3" style={{ width: 44, height: 44, background: "#e7f5ee", color: "#06794f" }}><i className={`bi ${indicador.icono} fs-5`} /></span>
                                <div className="display-5 fw-bold" style={{ color: "#06794f" }}>{indicador.valor}</div>
                                <h2 className="h6 fw-bold mt-2">{indicador.titulo}</h2>
                                <p className="text-secondary small mb-0">{indicador.descripcion}</p>
                            </Card.Body></Card>
                        </Col>)}
                    </Row>}
                    {data.indicadores.length > 0 && <div className="text-secondary small mt-4">Actualizado el {data.actualizado}</div>}
                </>}
            </Container>
        </main>
    );
}
