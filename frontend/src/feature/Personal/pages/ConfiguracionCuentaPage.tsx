import { useEffect, useRef, useState } from "react";
import { Button, Card, Container, Form, Row, Tab } from "react-bootstrap";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { PageLoading } from "../../../components/PageLoading";
import { PageError } from "../../../components/PageError";
import { AppTabs } from "../../../components/AppTabs";
import { Dato } from "../../../components/Dato";
import { useAuth } from "../../../hooks/useAuth";
import { api } from "../../../libs/axios";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import type { Persona } from "../types";

const CUENTA_URL = "/personal/me";
const TITULO = "Configuración de la cuenta";

export function ConfiguracionCuentaPage() {
    const { currentUser, refreshCurrentUser } = useAuth();

    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [mail, setMail] = useState("");
    const [passwordActual, setPasswordActual] = useState("");
    const [passwordNueva, setPasswordNueva] = useState("");
    const [passwordConfirmacion, setPasswordConfirmacion] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [pestania, setPestania] = useState("datos");
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        const form = formRef.current;
        if (!form) return;
        const alInvalido = (evento: Event) => {
            const tab = (evento.target as HTMLElement).closest<HTMLElement>("[data-tab]")?.dataset.tab;
            if (tab) setPestania(tab);
        };
        form.addEventListener("invalid", alInvalido, true);
        return () => form.removeEventListener("invalid", alInvalido, true);
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser) return;
        setNombre(currentUser.nombre);
        setApellido(currentUser.apellido);
        setMail(currentUser.mail);
    }, [currentUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const cambiaPassword = passwordNueva.length > 0;

        if (cambiaPassword && passwordNueva !== passwordConfirmacion) {
            mostrarAlertaError("La nueva contraseña y su confirmación no coinciden.");
            return;
        }
        if (cambiaPassword && !passwordActual) {
            mostrarAlertaError("Debe indicar la contraseña actual para cambiarla.");
            return;
        }

        const datos: Record<string, string> = { nombre, apellido, mail };
        if (cambiaPassword) {
            datos.password_actual = passwordActual;
            datos.password = passwordNueva;
        }

        setGuardando(true);
        try {
            await api.put<Persona>(CUENTA_URL, datos);
            await refreshCurrentUser();
            await mutate("/personal/");
            setPasswordActual("");
            setPasswordNueva("");
            setPasswordConfirmacion("");
            mostrarAlertaExito("Los datos de tu cuenta se guardaron correctamente.");
        } catch (err: any) {
            let mensajeFinal = "No se pudieron guardar los datos de la cuenta.";
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

    if (!currentUser) return <PageLoading title={TITULO} />;

    if (!currentUser.activo) return (
        <PageError title={TITULO} message="No se puede editar una cuenta dada de baja." />
    );

    return (
        <Container>
            <PageHeader
                eyebrow="MI CUENTA"
                title={TITULO}
                subtitle="Actualizá tus datos personales o cambiá tu contraseña."
            />

            <Form ref={formRef} onSubmit={handleSubmit}>
                <AppTabs
                    activeKey={pestania}
                    onSelect={(clave) => setPestania(clave ?? "datos")}
                    id="secciones-cuenta"
                    className="mb-3"
                >
                    <Tab eventKey="datos" title="Datos personales">
                        <Card className="shadow-sm border-0 rounded-3 mb-4 text-start" data-tab="datos">
                            <Card.Body className="p-4">
                                <h6 className="detalle-seccion-titulo">Datos personales</h6>
                                <Row className="g-3">
                                    <Dato etiqueta="Nombre de usuario" md={6} lg={4}>
                                        <Form.Group controlId="formUsername">
                                            <Form.Label className="visually-hidden">Nombre de usuario</Form.Label>
                                            <Form.Control type="text" value={currentUser.username} disabled readOnly />
                                            <Form.Text className="text-muted">El nombre de usuario no se puede modificar.</Form.Text>
                                        </Form.Group>
                                    </Dato>
                                    <Dato etiqueta="Correo electrónico (*)" md={6} lg={8}>
                                        <Form.Group controlId="formMail">
                                            <Form.Label className="visually-hidden">Correo electrónico</Form.Label>
                                            <Form.Control
                                                required
                                                type="email"
                                                maxLength={100}
                                                value={mail}
                                                onChange={(e) => setMail(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Dato>
                                    <Dato etiqueta="Nombre (*)" md={6}>
                                        <Form.Group controlId="formNombre">
                                            <Form.Label className="visually-hidden">Nombre</Form.Label>
                                            <Form.Control
                                                required
                                                type="text"
                                                maxLength={50}
                                                value={nombre}
                                                onChange={(e) => setNombre(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Dato>
                                    <Dato etiqueta="Apellido (*)" md={6}>
                                        <Form.Group controlId="formApellido">
                                            <Form.Label className="visually-hidden">Apellido</Form.Label>
                                            <Form.Control
                                                required
                                                type="text"
                                                maxLength={50}
                                                value={apellido}
                                                onChange={(e) => setApellido(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Dato>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Tab>

                    <Tab eventKey="password" title="Contraseña">
                        <Card className="shadow-sm border-0 rounded-3 mb-4 text-start" data-tab="password">
                            <Card.Body className="p-4">
                                <h6 className="detalle-seccion-titulo">Cambiar contraseña</h6>
                                <p className="text-muted small mb-3">
                                    Dejá estos campos vacíos si no querés cambiar la contraseña.
                                </p>
                                <Row className="g-3">
                                    <Dato etiqueta="Contraseña actual" md={4}>
                                        <Form.Group controlId="formPasswordActual">
                                            <Form.Label className="visually-hidden">Contraseña actual</Form.Label>
                                            <Form.Control
                                                type="password"
                                                autoComplete="current-password"
                                                value={passwordActual}
                                                onChange={(e) => setPasswordActual(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Dato>
                                    <Dato etiqueta="Nueva contraseña" md={4}>
                                        <Form.Group controlId="formPasswordNueva">
                                            <Form.Label className="visually-hidden">Nueva contraseña</Form.Label>
                                            <Form.Control
                                                type="password"
                                                minLength={4}
                                                autoComplete="new-password"
                                                value={passwordNueva}
                                                onChange={(e) => setPasswordNueva(e.target.value)}
                                            />
                                            <Form.Text className="text-muted">Mínimo 4 caracteres.</Form.Text>
                                        </Form.Group>
                                    </Dato>
                                    <Dato etiqueta="Confirmar nueva contraseña" md={4}>
                                        <Form.Group controlId="formPasswordConfirmacion">
                                            <Form.Label className="visually-hidden">Confirmar nueva contraseña</Form.Label>
                                            <Form.Control
                                                type="password"
                                                autoComplete="new-password"
                                                value={passwordConfirmacion}
                                                onChange={(e) => setPasswordConfirmacion(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Dato>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Tab>
                </AppTabs>

                <div className="d-flex justify-content-end mb-4">
                    <Button variant="primary" type="submit" disabled={guardando}>
                        <i className="bi bi-floppy me-1"></i>
                        {guardando ? "Guardando..." : "Guardar cambios"}
                    </Button>
                </div>
            </Form>
        </Container>
    );
}
