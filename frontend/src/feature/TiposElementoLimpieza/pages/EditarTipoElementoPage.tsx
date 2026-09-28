import { Container, Spinner, Alert, Col, Row, Button, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { mutate } from "swr";

import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import { api } from "../../../libs/axios";
import type { TipoElementoLimpieza } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import { getErrorMessage } from "../../../libs/errors";

export function EditarTipoElementoPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const { data: tipo, isLoading, error } = useApi<TipoElementoLimpieza>(`/elementos-limpieza/tipos/${id}`);

    const { register, handleSubmit, formState: { errors } } = useForm<{ nombre: string }>({
        values: {
            nombre: tipo?.nombre || ""
        }
    });

    const actualizarTipo = async (datos: { nombre: string }) => {
        try {
            await api.put(`/elementos-limpieza/tipos/${id}`, {
                nombre: datos.nombre.trim()
            });

            await mutate("/elementos-limpieza/tipos");
            await mutate(`/elementos-limpieza/tipos/${id}`);

            mostrarAlertaExito("El tipo de elemento se editó correctamente.");
            navigate("/tipos-elementos-limpieza");
        } catch (error: any) {
            mostrarAlertaError(
                getErrorMessage(error, "No se pudo editar el tipo de elemento.")
            );
            console.log(error);
        }
    };

    if (isLoading) return (
        <>
            <PageHeader title="Editar Tipo de Elemento" />
            <Spinner animation="border" />
        </>
    );

    if (!tipo || error) return (
        <Container>
            <PageHeader title="Tipo de elemento no encontrado" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">El tipo de elemento ingresado no existe</Alert>
                </Col>
            </Row>
        </Container>
    );

    return (
        <>
            <PageHeader title="Editar Tipo de Elemento" />

            <Container>
                <div className="col-md-6 mx-auto">
                    <Form onSubmit={handleSubmit(actualizarTipo)} className="p-4 border rounded bg-white shadow-sm mt-3">

                        <Form.Group className="mb-3 text-start" controlId="formNombreTipo">
                            <Form.Label className="p-1 fw-bold">
                                Nombre del Tipo *
                            </Form.Label>

                            <Form.Control
                                {...register("nombre", {
                                    required: "El nombre es obligatorio.",
                                    minLength: {
                                        value: 3,
                                        message: "El nombre debe tener al menos 3 caracteres."
                                    },
                                    maxLength: {
                                        value: 100,
                                        message: "El nombre no puede superar los 100 caracteres."
                                    },
                                    validate: (value) =>
                                        value.trim() !== "" ||
                                        "El nombre no puede ser solo espacios en blanco."
                                })}
                                isInvalid={!!errors.nombre}
                            />

                            <Form.Control.Feedback type="invalid">
                                {errors.nombre?.message}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3 text-start" controlId="formPrefijoTipo">
                            <Form.Label className="p-1 fw-bold">
                                Prefijo
                            </Form.Label>

                            <Form.Control
                                value={tipo.prefijo}
                                disabled
                            />
                        </Form.Group>

                        <div className="d-flex justify-content-center gap-2">
                            <Button
                                variant="secondary"
                                type="button"
                                onClick={() => navigate("/tipos-elementos-limpieza")}
                            >
                                <i className="bi bi-x-circle me-1"></i>
                                Cancelar
                            </Button>

                            <Button
                                variant="primary"
                                type="submit"
                            >
                                <i className="bi bi-floppy me-1"></i>
                                Editar Tipo
                            </Button>
                        </div>
                    </Form>
                </div>
            </Container>
        </>
    );
}