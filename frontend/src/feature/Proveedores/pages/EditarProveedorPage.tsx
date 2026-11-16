import { Container, Alert, Col, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { ProveedorForm } from "../components/ProveedorForm";
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks/useApi";
import type { Proveedor, NewProveedor } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import { PageLoading } from "../../../components/PageLoading";

export function EditarProveedorPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const { data: proveedor, isLoading, error } = useApi<Proveedor>(`/proveedores/${id}`);

    const actualizarProveedor = async (datos: NewProveedor) => {
        try {
            await api.put(`/proveedores/${id}`, datos);
            await mutate("/proveedores/");
            await mutate(`/proveedores/${id}`);
            mostrarAlertaExito("El proveedor se edito correctamente.");
            navigate("/proveedores");
        } catch (error: any) {
            let mensajeFinal = "No se pudo editar el proveedor.";
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        }
    };

    const tituloPagina = "Editar Proveedor";

    if (isLoading) return <PageLoading title={tituloPagina} />;

    if (!proveedor) return (
        <Container>
            <PageHeader title="Proveedor no encontrado" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">El proveedor ingresado no existe.</Alert>
                </Col>
            </Row>
        </Container>
    );

    if (error) return (
        <Container>
            <PageHeader title={tituloPagina} />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar el proveedor.</Alert>
                </Col>
            </Row>
        </Container>
    );

    return (
        <>
            <PageHeader title={tituloPagina} />
            <Container>
                <ProveedorForm
                    textoBoton="Guardar Cambios"
                    onSubmit={actualizarProveedor}
                    valoresIniciales={{
                        nombre: proveedor.nombre,
                        cuit: proveedor.cuit,
                        telefono: proveedor.telefono,
                        email: proveedor.email,
                    }}
                />
            </Container>
        </>
    );
}