import { useEffect, useState } from "react";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { PageLoading } from "../../../components/PageLoading";
import { PageError } from "../../../components/PageError";
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
            <PageHeader title={TITULO} />

            <Row className="justify-content-center">
                <Col md={7} lg={6}>
                    <Form onSubmit={handleSubmit}>
                        <Card className="shadow-sm mb-3">
                            <Card.Header className="fw-bold">
                                <i className="bi bi-person me-2"></i>Datos personales
                            </Card.Header>
                            <Card.Body>
                                <Form.Group className="mb-3 text-start" controlId="formUsername">
                                    <Form.Label className="p-1 fw-bold">Nombre de usuario</Form.Label>
                                    <Form.Control type="text" value={currentUser.username} disabled readOnly />
                                    <Form.Text className="text-muted">
                                        El nombre de usuario no se puede modificar.
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3 text-start" controlId="formNombre">
                                    <Form.Label className="p-1 fw-bold">Nombre</Form.Label>
                                    <Form.Control
                                        required
                                        type="text"
                                        maxLength={50}
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3 text-start" controlId="formApellido">
                                    <Form.Label className="p-1 fw-bold">Apellido</Form.Label>
                                    <Form.Control
                                        required
                                        type="text"
                                        maxLength={50}
                                        value={apellido}
                                        onChange={(e) => setApellido(e.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3 text-start" controlId="formMail">
                                    <Form.Label className="p-1 fw-bold">Correo electrónico</Form.Label>
                                    <Form.Control
                                        required
                                        type="email"
                                        maxLength={100}
                                        value={mail}
                                        onChange={(e) => setMail(e.target.value)}
                                    />
                                </Form.Group>
                            </Card.Body>
                        </Card>

                        <Card className="shadow-sm mb-3">
                            <Card.Header className="fw-bold">
                                <i className="bi bi-key me-2"></i>Cambiar contraseña
                            </Card.Header>
                            <Card.Body>
                                <Form.Text className="text-muted d-block mb-3">
                                    Dejá estos campos vacíos si no querés cambiar la contraseña.
                                </Form.Text>

                                <Form.Group className="mb-3 text-start" controlId="formPasswordActual">
                                    <Form.Label className="p-1 fw-bold">Contraseña actual</Form.Label>
                                    <Form.Control
                                        type="password"
                                        autoComplete="current-password"
                                        value={passwordActual}
                                        onChange={(e) => setPasswordActual(e.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3 text-start" controlId="formPasswordNueva">
                                    <Form.Label className="p-1 fw-bold">Nueva contraseña</Form.Label>
                                    <Form.Control
                                        type="password"
                                        minLength={4}
                                        autoComplete="new-password"
                                        value={passwordNueva}
                                        onChange={(e) => setPasswordNueva(e.target.value)}
                                    />
                                    <Form.Text className="text-muted">Mínimo 4 caracteres.</Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3 text-start" controlId="formPasswordConfirmacion">
                                    <Form.Label className="p-1 fw-bold">Confirmar nueva contraseña</Form.Label>
                                    <Form.Control
                                        type="password"
                                        autoComplete="new-password"
                                        value={passwordConfirmacion}
                                        onChange={(e) => setPasswordConfirmacion(e.target.value)}
                                    />
                                </Form.Group>
                            </Card.Body>
                        </Card>

                        <Button variant="primary" type="submit" disabled={guardando}>
                            <i className="bi bi-floppy me-1"></i>
                            {guardando ? "Guardando..." : "Guardar cambios"}
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}