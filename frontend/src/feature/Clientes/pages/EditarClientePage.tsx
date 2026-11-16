import { Container, Alert, Col, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { ClienteForm } from "../components/ClienteForm";
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks/useApi";
import type { Cliente, NewCliente, NewDireccionCliente } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import { PageLoading } from "../../../components/PageLoading";

export function EditarClientePage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const { data: cliente, isLoading, error } = useApi<Cliente>(`/clientes/${id}`);

    const actualizarCliente = async (datos: NewCliente, direcciones: NewDireccionCliente[]) => {
    try {
        await api.put(`/clientes/${id}`, datos);

        const direccionesGuardadas = (cliente?.direcciones || []).filter(d => d.activo);

        for (const dirGuardada of direccionesGuardadas) {
            const sigueEstando = direcciones.some(
                d => d.calle_altura === dirGuardada.calle_altura && d.localidad === dirGuardada.localidad);

            if (!sigueEstando) {
                await api.delete(`/direcciones-cliente/${dirGuardada.id}`);
            }
        }

        for (const dir of direcciones) {
            const yaExiste = direccionesGuardadas.some(
                d => d.calle_altura === dir.calle_altura && d.localidad === dir.localidad
            );

            if (!yaExiste) {
                await api.post("/direcciones-cliente/", {
                    cliente_id: Number(id),
                    calle_altura: dir.calle_altura,
                    provincia: dir.provincia,
                    localidad: dir.localidad,
                    codigo_postal: dir.codigo_postal,
                    descripcion: dir.descripcion,
                });
            }
        }

        await mutate("/clientes/");
        await mutate(`/clientes/${id}`);

        mostrarAlertaExito("El cliente se edito correctamente.");
        navigate("/clientes");
    } catch (error: any) {
        let mensajeFinal = "No se pudo editar el cliente.";
        if (error.response?.data?.detail) {
            const detail = error.response.data.detail;
            mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
        }
        mostrarAlertaError(mensajeFinal);
        console.log(error);
    }
};

    const tituloPagina = "Editar Cliente";

    if (isLoading) return <PageLoading title={tituloPagina} />;

    if (!cliente) return (
        <Container>
            <PageHeader title="Cliente no encontrado" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">El cliente ingresado no existe</Alert>
                </Col>
            </Row>
        </Container>
    );

    if (error) return (
        <Container>
            <PageHeader title={tituloPagina} />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrio un error al cargar el Cliente</Alert>
                </Col>
            </Row>
        </Container>
    );

    if (!cliente.activo) return (
        <Container>
            <PageHeader title={tituloPagina} />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="warning">No se puede editar un cliente dado de baja.</Alert>
                </Col>
            </Row>
        </Container>
    );

    return (
        <>
            <PageHeader title={tituloPagina} />

            <Container>
                <ClienteForm
                    textoBoton="Editar Cliente"
                    onSubmit={actualizarCliente}
                    valoresIniciales={{
                        razon_social: cliente.razon_social,
                        cuit: cliente.cuit,
                        telefono: cliente.telefono,
                        email: cliente.email,
                    }}
                    direccionesIniciales={
                        cliente.direcciones?.filter(d => d.activo).map(d => ({
                            calle_altura: d.calle_altura,
                            provincia: d.provincia,
                            localidad: d.localidad,
                            codigo_postal: d.codigo_postal,
                            descripcion: d.descripcion,
                        })) || []
                    }
                />
            </Container>
        </>
    );
}