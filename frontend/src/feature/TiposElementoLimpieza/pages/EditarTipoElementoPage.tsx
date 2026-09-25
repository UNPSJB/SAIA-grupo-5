import { Container, Spinner, Alert, Col, Row, Button, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { mutate } from "swr";

import { PageHeader } from "../../../components/PageHeader";
import { useApi } from "../../../hooks/useApi";
import { api } from "../../../libs/axios";
import type { TipoElementoLimpieza } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

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
            let mensaje = "No se pudo editar el tipo de elemento.";

            if (error.response?.data?.detail) {
                if (Array.isArray(error.response.data.detail)) {
                    mensaje = error.response.data.detail[0].msg;
                } else {
                    mensaje = error.response.data.detail;
                }
            }

            mostrarAlertaError(mensaje);
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

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Nombre</Form.Label>
                            <Form.Control
                                {...register("nombre", {
                                    required: "El nombre es obligatorio."
                                })}
                                isInvalid={!!errors.nombre}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.nombre?.message}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Prefijo</Form.Label>
                            <Form.Control
                                value={tipo.prefijo}
                                disabled
                            />
                        </Form.Group>

                        <Button
                            variant="secondary"
                            type="button"
                            onClick={() => navigate("/tipos-elementos-limpieza")}
                        >
                            Cancelar
                        </Button>

                        <Button className="ms-2" type="submit">
                            Editar Tipo
                        </Button>
                    </Form>
                </div>
            </Container>
        </>
    );
}