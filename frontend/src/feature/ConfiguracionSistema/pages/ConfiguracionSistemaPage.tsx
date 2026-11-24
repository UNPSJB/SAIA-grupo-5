import { useEffect, useState } from "react";
import { Button, Card, Col, Container, Form, Row, Tab } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { PageLoading } from "../../../components/PageLoading";
import { PageError } from "../../../components/PageError";
import { Dato } from "../../../components/Dato";
import { AppTabs } from "../../../components/AppTabs";
import { AppSwitch } from "../../../components/AppSwitch";
import { useApi } from "../../../hooks/useApi";
import { api } from "../../../libs/axios";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import type { ConfiguracionSistema } from "../types";
import { getTamanioLetra, setTamanioLetra } from "../../Tutoriales/engine";

const CONFIGURACION_URL = "/configuracion-sistema/";

function aHoraMinuto(hora: number, minuto: number): string {
    return `${String(hora).padStart(2, "0")}:${String(minuto).padStart(2, "0")}`;
}

export function ConfiguracionSistemaPage() {
    const navigate = useNavigate();
    const { data: configuracion, error, isLoading } = useApi<ConfiguracionSistema>(CONFIGURACION_URL);

    const [diasAntelacion, setDiasAntelacion] = useState(15);
    const [diasAntelacionElementos, setDiasAntelacionElementos] = useState(15);
    const [horaGeneracion, setHoraGeneracion] = useState("07:00");
    const [guardando, setGuardando] = useState(false);
    const [tamanioTutorial, setTamanioTutorial] = useState(getTamanioLetra());
    const cambiarTamanioTutorial = (px: number) => {
        setTamanioTutorial(px);
        setTamanioLetra(px);
    };

    const [nombrePyme, setNombrePyme] = useState("");
    const [telefonoPyme, setTelefonoPyme] = useState("");
    const [emailPyme, setEmailPyme] = useState("");
    const [direccionPyme, setDireccionPyme] = useState("");
    const [logoBase64, setLogoBase64] = useState<string | null>(null);
    const [mostrarLogoPdf, setMostrarLogoPdf] = useState(true);
    const [logoError, setLogoError] = useState<string | null>(null);
    const [guardandoPyme, setGuardandoPyme] = useState(false);
    const [leyendoLogo, setLeyendoLogo] = useState(false);

    const [razonSocialElaborador, setRazonSocialElaborador] = useState("");
    const [domicilioElaborador, setDomicilioElaborador] = useState("");
    const [numeroRnpaRppa, setNumeroRnpaRppa] = useState("");
    const [guardandoElaborador, setGuardandoElaborador] = useState(false);

    const [prefijoGs1, setPrefijoGs1] = useState("779");
    const [prefijoEmpresa, setPrefijoEmpresa] = useState("");
    const [guardandoPrefijos, setGuardandoPrefijos] = useState(false);

    useEffect(() => {
        if (!configuracion) return;
        setDiasAntelacion(configuracion.dias_antelacion_vencimiento);
        setDiasAntelacionElementos(configuracion.dias_antelacion_elementos);
        setHoraGeneracion(aHoraMinuto(configuracion.hora_generacion_checklists, configuracion.minuto_generacion_checklists));
        setNombrePyme(configuracion.nombre_pyme);
        setTelefonoPyme(configuracion.telefono_pyme ?? "");
        setEmailPyme(configuracion.email_pyme ?? "");
        setDireccionPyme(configuracion.direccion_pyme ?? "");
        setLogoBase64(configuracion.logo_pyme);
        setMostrarLogoPdf(configuracion.mostrar_logo_pdf ?? true);
        setRazonSocialElaborador(configuracion.razon_social_elaborador ?? "");
        setDomicilioElaborador(configuracion.domicilio_elaborador ?? "");
        setNumeroRnpaRppa(configuracion.numero_rnpa_rppa ?? "");
        setPrefijoGs1(configuracion.prefijo_gs1);
        setPrefijoEmpresa(configuracion.prefijo_empresa ?? "");
    }, [configuracion]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLogoError(null);
        const file = e.target.files?.[0];
        if (!file) return;

        const tiposPermitidos = ["image/png", "image/jpeg", "image/webp"];
        if (!tiposPermitidos.includes(file.type)) {
            setLogoError("El logo debe ser una imagen PNG, JPG o WebP.");
            e.target.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setLogoError("El logo no puede superar los 2 MB.");
            e.target.value = "";
            return;
        }

        setLeyendoLogo(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setLogoBase64(reader.result as string);
            setLeyendoLogo(false);
        };
        reader.onerror = () => {
            setLogoError("Ocurrió un problema al cargar el logo.");
            setLeyendoLogo(false);
        };
    };

    const handleSubmitPyme = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombrePyme.trim()) {
            mostrarAlertaError("El nombre de la PyME es obligatorio.");
            return;
        }

        setGuardandoPyme(true);
        try {
            await api.put(CONFIGURACION_URL, {
                nombre_pyme: nombrePyme.trim(),
                logo_pyme: logoBase64,
                mostrar_logo_pdf: mostrarLogoPdf,
                telefono_pyme: telefonoPyme.trim(),
                email_pyme: emailPyme.trim(),
                direccion_pyme: direccionPyme.trim(),
            });
            await mutate(CONFIGURACION_URL);
            mostrarAlertaExito("Los datos de la PyME se guardaron correctamente.");
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            mostrarAlertaError(Array.isArray(detail) ? detail[0]?.msg : detail || "No se pudieron guardar los datos de la PyME.");
        } finally {
            setGuardandoPyme(false);
        }
    };

    const handleSubmitElaborador = async (e: React.FormEvent) => {
        e.preventDefault();
        setGuardandoElaborador(true);
        try {
            await api.put(CONFIGURACION_URL, {
                razon_social_elaborador: razonSocialElaborador.trim(),
                domicilio_elaborador: domicilioElaborador.trim(),
                numero_rnpa_rppa: numeroRnpaRppa.trim(),
            });
            await mutate(CONFIGURACION_URL);
            mostrarAlertaExito("Los datos del elaborador se guardaron correctamente.");
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            mostrarAlertaError(Array.isArray(detail) ? detail[0]?.msg : detail || "No se pudieron guardar los datos del elaborador.");
        } finally {
            setGuardandoElaborador(false);
        }
    };

    const handleSubmitPrefijos = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!/^[0-9]{3}$/.test(prefijoGs1) || (prefijoEmpresa && !/^[0-9]{4}$/.test(prefijoEmpresa))) {
            mostrarAlertaError("El prefijo GS1 debe tener 3 dígitos y el de empresa 4.");
            return;
        }

        setGuardandoPrefijos(true);
        try {
            await api.put(CONFIGURACION_URL, {
                prefijo_gs1: prefijoGs1,
                prefijo_empresa: prefijoEmpresa || null
            });
            await mutate(CONFIGURACION_URL);
            mostrarAlertaExito("Los prefijos se guardaron correctamente.");
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            mostrarAlertaError(Array.isArray(detail) ? detail[0]?.msg : detail || "No se pudieron guardar los prefijos.");
        } finally {
            setGuardandoPrefijos(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const [hora, minuto] = horaGeneracion.split(":").map(Number);
        setGuardando(true);
        try {
            await api.put(CONFIGURACION_URL, {
                dias_antelacion_vencimiento: diasAntelacion,
                dias_antelacion_elementos: diasAntelacionElementos,
                hora_generacion_checklists: hora,
                minuto_generacion_checklists: minuto,
            });
            await mutate(CONFIGURACION_URL);
            mostrarAlertaExito("La configuración del sistema se guardó correctamente.");
        } catch (err: any) {
            let mensajeFinal = "No se pudo guardar la configuración del sistema.";
            if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(err);
        } finally {
            setGuardando(false);
        }
    };

    if (isLoading) return <PageLoading title="Configuración del Sistema" />;

    if (error || !configuracion) return (
        <PageError title="Configuración del Sistema" message="Ocurrió un error al cargar la configuración del sistema." />
    );

    return (
        <Container fluid style={{ maxWidth: '1400px' }}>
            <PageHeader
                eyebrow="CONFIGURACIÓN"
                title="Configuración del Sistema"
                subtitle="Parámetros de alertas y checklists, datos de la PyME y del elaborador, códigos de barras y preferencias."
                actions={
                    <Button variant="outline-success" onClick={() => navigate("/configuracion-sistema/vista-publica")}>
                        <i className="bi bi-qr-code me-2" />Vista pública
                    </Button>
                }
            />

            <AppTabs defaultActiveKey="parametros" id="secciones-configuracion" className="mb-3">
                <Tab eventKey="parametros" title="Parámetros generales">
                    <Card className="shadow-sm border-0 rounded-3 mb-4 text-start">
                        <Card.Body className="p-4">
                            <Form onSubmit={handleSubmit} data-tour="form-configuracion">
                                <h6 className="detalle-seccion-titulo">Parámetros generales</h6>
                                <Row className="g-3 mb-3">
                                    <Dato etiqueta="Alerta de vencimientos de personal (días antes)" md={4}>
                                        <Form.Group controlId="formDiasAntelacion" data-tour="antelacion-personal">
                                            <Form.Label className="visually-hidden">Antelación de alerta de vencimientos de personal en días</Form.Label>
                                            <Form.Control required type="number" min={0} value={diasAntelacion} onChange={(e) => setDiasAntelacion(Number(e.target.value))} />
                                            <Form.Text className="text-muted">Con cuántos días de anticipación se avisa que un vencimiento de personal está por vencer.</Form.Text>
                                        </Form.Group>
                                    </Dato>
                                    <Dato etiqueta="Alerta de vencimientos de elementos de limpieza (días antes)" md={4}>
                                        <Form.Group controlId="formDiasAntelacionElementos" data-tour="antelacion-elementos">
                                            <Form.Label className="visually-hidden">Antelación de alerta de vencimientos de elementos en días</Form.Label>
                                            <Form.Control required type="number" min={0} value={diasAntelacionElementos} onChange={(e) => setDiasAntelacionElementos(Number(e.target.value))} />
                                            <Form.Text className="text-muted">Con cuántos días de anticipación se avisa que un elemento está por vencer.</Form.Text>
                                        </Form.Group>
                                    </Dato>
                                    <Dato etiqueta="Hora de generación de checklists" md={4}>
                                        <Form.Group controlId="formHoraGeneracion" data-tour="hora-generacion-checklists">
                                            <Form.Label className="visually-hidden">Hora de generación de checklists</Form.Label>
                                            <Form.Control required type="time" value={horaGeneracion} onChange={(e) => setHoraGeneracion(e.target.value)} />
                                            <Form.Text className="text-muted">Hora en la que se generan las tareas pendientes del checklist diario.</Form.Text>
                                        </Form.Group>
                                    </Dato>
                                </Row>
                                <div className="d-flex justify-content-end">
                                    <Button variant="primary" type="submit" disabled={guardando}>
                                        <i className="bi bi-floppy me-1"></i> {guardando ? "Guardando..." : "Guardar cambios"}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Tab>
                <Tab eventKey="pyme" title="Datos de la PyME">
                    <Card className="shadow-sm border-0 rounded-3 mb-4 text-start">
                        <Card.Body className="p-4">
                            <Form onSubmit={handleSubmitPyme}>
                                <h6 className="detalle-seccion-titulo">Datos de la PyME</h6>
                                <Row className="g-3 mb-3">
                                    <Dato etiqueta="Logo" md={4}>
                                        <div className="d-flex flex-column align-items-center gap-2">
                                            {logoBase64 ? (
                                                <img
                                                    src={logoBase64}
                                                    alt="Logo de la PyME"
                                                    style={{ maxHeight: "120px", maxWidth: "100%", borderRadius: "8px", objectFit: "contain" }}
                                                    className="border shadow-sm bg-white p-1"
                                                />
                                            ) : (
                                                <div className="d-flex align-items-center justify-content-center border rounded text-muted bg-light w-100" style={{ height: "120px" }}>
                                                    <i className="bi bi-image fs-1"></i>
                                                </div>
                                            )}
                                            <Form.Group controlId="formLogoPyme" className="w-100">
                                                <Form.Label className="visually-hidden">Logo de la PyME</Form.Label>
                                                <Form.Control type="file" size="sm" accept="image/png,image/jpeg,image/webp" onChange={handleLogoChange} isInvalid={!!logoError} />
                                                <Form.Control.Feedback type="invalid">{logoError}</Form.Control.Feedback>
                                                <Form.Text className="text-muted">PNG, JPG o WebP. Máximo 2 MB.</Form.Text>
                                            </Form.Group>
                                            {logoBase64 && (
                                                <Button variant="outline-danger" size="sm" type="button" disabled={guardandoPyme} onClick={() => { setLogoBase64(null); setLogoError(null); }}>
                                                    <i className="bi bi-trash me-1"></i>Quitar logo
                                                </Button>
                                            )}
                                            <AppSwitch id="mostrarLogoPdf" label="Incluir logo en los PDF" checked={mostrarLogoPdf} onChange={(e) => setMostrarLogoPdf(e.target.checked)} disabled={!logoBase64 || guardandoPyme} className="align-self-start" />
                                        </div>
                                    </Dato>
                                    <Col md={8}>
                                        <Row className="g-3">
                                            <Dato etiqueta="Nombre de la PyME (*)">
                                                <Form.Group controlId="formNombrePyme">
                                                    <Form.Label className="visually-hidden">Nombre de la PyME</Form.Label>
                                                    <Form.Control required maxLength={100} value={nombrePyme} onChange={(e) => setNombrePyme(e.target.value)} />
                                                </Form.Group>
                                            </Dato>
                                            <Dato etiqueta="Teléfono" md={6}>
                                                <Form.Group controlId="formTelefonoPyme">
                                                    <Form.Label className="visually-hidden">Teléfono</Form.Label>
                                                    <Form.Control type="tel" maxLength={30} value={telefonoPyme} onChange={(e) => setTelefonoPyme(e.target.value)} />
                                                </Form.Group>
                                            </Dato>
                                            <Dato etiqueta="Correo electrónico" md={6}>
                                                <Form.Group controlId="formEmailPyme">
                                                    <Form.Label className="visually-hidden">Correo electrónico</Form.Label>
                                                    <Form.Control type="email" maxLength={150} value={emailPyme} onChange={(e) => setEmailPyme(e.target.value)} />
                                                </Form.Group>
                                            </Dato>
                                            <Dato etiqueta="Dirección">
                                                <Form.Group controlId="formDireccionPyme">
                                                    <Form.Label className="visually-hidden">Dirección</Form.Label>
                                                    <Form.Control maxLength={200} value={direccionPyme} onChange={(e) => setDireccionPyme(e.target.value)} />
                                                </Form.Group>
                                            </Dato>
                                        </Row>
                                    </Col>
                                </Row>
                                <div className="d-flex justify-content-end">
                                    <Button variant="primary" type="submit" disabled={guardandoPyme || leyendoLogo || !!logoError}>
                                        <i className="bi bi-floppy me-1"></i> {guardandoPyme ? "Guardando..." : "Guardar datos de la PyME"}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Tab>
                <Tab eventKey="elaborador" title="Datos del elaborador">
                    <Card className="shadow-sm border-0 rounded-3 mb-4 text-start">
                        <Card.Body className="p-4">
                            <Form onSubmit={handleSubmitElaborador}>
                                <h6 className="detalle-seccion-titulo">Datos del elaborador para el rótulo</h6>
                                <p className="text-muted small mb-3">Se precargan en la pestaña "Datos del rótulo (CAA)" de cada producto.</p>
                                <Row className="g-3 mb-3">
                                    <Dato etiqueta="Razón social del elaborador" md={8}>
                                        <Form.Group controlId="formRazonSocialElaborador">
                                            <Form.Label className="visually-hidden">Razón social del elaborador</Form.Label>
                                            <Form.Control maxLength={150} value={razonSocialElaborador} onChange={(e) => setRazonSocialElaborador(e.target.value)} />
                                        </Form.Group>
                                    </Dato>
                                    <Dato etiqueta="Número de RNPA/RPPA" md={4}>
                                        <Form.Group controlId="formNumeroRnpaRppa">
                                            <Form.Label className="visually-hidden">Número de RNPA/RPPA</Form.Label>
                                            <Form.Control maxLength={30} placeholder="RNPA 1234567" value={numeroRnpaRppa} onChange={(e) => setNumeroRnpaRppa(e.target.value)} />
                                        </Form.Group>
                                    </Dato>
                                    <Dato etiqueta="Domicilio del elaborador">
                                        <Form.Group controlId="formDomicilioElaborador">
                                            <Form.Label className="visually-hidden">Domicilio del elaborador</Form.Label>
                                            <Form.Control maxLength={200} value={domicilioElaborador} onChange={(e) => setDomicilioElaborador(e.target.value)} />
                                        </Form.Group>
                                    </Dato>
                                </Row>
                                <div className="d-flex justify-content-end">
                                    <Button variant="primary" type="submit" disabled={guardandoElaborador}>
                                        <i className="bi bi-floppy me-1"></i> {guardandoElaborador ? "Guardando..." : "Guardar datos del elaborador"}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Tab>
                <Tab eventKey="codigos" title="Códigos de barras">
                    <Card className="shadow-sm border-0 rounded-3 mb-4 text-start">
                        <Card.Body className="p-4">
                            <Form onSubmit={handleSubmitPrefijos}>
                                <h6 className="detalle-seccion-titulo">Códigos de barras</h6>
                                <Row className="g-3 mb-2">
                                    <Dato etiqueta="Prefijo GS1 (*)" md={6}>
                                        <Form.Group controlId="formPrefijoGs1">
                                            <Form.Label className="visually-hidden">Prefijo GS1</Form.Label>
                                            <Form.Control required type="text" inputMode="numeric" maxLength={3} value={prefijoGs1} onChange={(e) => setPrefijoGs1(e.target.value.replace(/\D/g, ""))} />
                                            <Form.Text className="text-muted">Por defecto, 779 (GS1 Argentina).</Form.Text>
                                        </Form.Group>
                                    </Dato>
                                    <Dato etiqueta="Prefijo de empresa" md={6}>
                                        <Form.Group controlId="formPrefijoEmpresa">
                                            <Form.Label className="visually-hidden">Prefijo de empresa</Form.Label>
                                            <Form.Control type="text" inputMode="numeric" maxLength={4} placeholder="Ej: 1234" value={prefijoEmpresa} onChange={(e) => setPrefijoEmpresa(e.target.value.replace(/\D/g, ""))} />
                                            <Form.Text className="text-muted">Dejar vacío para no generar códigos nuevos.</Form.Text>
                                        </Form.Group>
                                    </Dato>
                                </Row>
                                <Form.Text className="text-muted d-block mb-3">
                                    Los códigos generados son demostrativos hasta disponer de un prefijo oficial asignado por GS1.
                                    Al guardar, los productos con código de producto que todavía no tienen código de barras lo reciben.
                                    Modificar los prefijos no cambia los códigos ya guardados.
                                </Form.Text>
                                <div className="d-flex justify-content-end">
                                    <Button variant="primary" type="submit" disabled={guardandoPrefijos}>
                                        <i className="bi bi-floppy me-1"></i> {guardandoPrefijos ? "Guardando..." : "Guardar prefijos"}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Tab>
                <Tab eventKey="preferencias" title="Preferencias">
                    <Card className="shadow-sm border-0 rounded-3 mb-4 text-start" data-tour="tamanio-tutorial">
                        <Card.Body className="p-4">
                            <h6 className="detalle-seccion-titulo">Preferencias del tutorial</h6>
                            <Row className="g-3">
                                <Dato etiqueta="Tamaño de letra del tutorial" md={6} lg={4}>
                                    <Form.Group controlId="formTamanioTutorial">
                                        <Form.Label className="visually-hidden">Tamaño de letra del tutorial</Form.Label>
                                        <Form.Select value={tamanioTutorial} onChange={(e) => cambiarTamanioTutorial(Number(e.target.value))}>
                                            <option value={14}>Chico</option>
                                            <option value={16}>Normal</option>
                                            <option value={18}>Grande</option>
                                            <option value={22}>Muy grande</option>
                                        </Form.Select>
                                        <Form.Text className="text-muted">Se aplica automáticamente y se guarda solo en este navegador.</Form.Text>
                                    </Form.Group>
                                </Dato>
                            </Row>
                        </Card.Body>
                    </Card>
                </Tab>
            </AppTabs>
        </Container>
    );
}
