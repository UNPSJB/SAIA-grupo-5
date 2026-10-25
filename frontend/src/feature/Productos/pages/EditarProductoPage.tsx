import { Container, Alert, Col, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { ProductoForm } from "../components/ProductoForm";
import { api } from "../../../libs/axios";
import { useApi } from "../../../hooks/useApi";
import type { Producto, NewProducto } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import { PageLoading } from "../../../components/PageLoading";

export function EditarProductoPage(){
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el insumo
    const { id } = useParams();         //

    const { data: producto, isLoading, error } = useApi<Producto>(`/productos/${id}`);

    const actualizarProducto = async (datos: NewProducto) => {
        try{
            await api.put(`/productos/${id}`, datos);
            await mutate("/productos/");
            await mutate(`/productos/${id}`);     // Se agrego esto ya que habia un bug en el editar
            mostrarAlertaExito("El producto se edito correctamente.");
            navigate("/productos");
        } catch (error: any){
            let mensajeFinal = "No se pudo editar el producto.";        // Si falla el servidor por alguna razon, creamos este mensaje predeterminado
            if (error.response?.data?.detail){      // Se le pregunta a Axios si el error tiene una respuesta del backend
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        }
    };

    const tituloPagina = "Editar Producto";

    if (isLoading) return <PageLoading title={tituloPagina} />;

    if (!producto) return (
        <Container>
            <PageHeader title="Producto no encontrado" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">El producto ingresado no existe</Alert>
                </Col>
            </Row>
        </Container>
    )

    if (error) return (
        <Container>
            <PageHeader title={tituloPagina} />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar el Producto</Alert>
                </Col>
            </Row>
        </Container>
    )

    if (!producto.activo) return (
        <Container>
            <PageHeader title={tituloPagina} />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="warning">No se puede editar un producto dado de baja.</Alert>
                </Col>
            </Row>
        </Container>
    )


    return(
        <>
            <PageHeader title={tituloPagina}/>

            <Container>
                <ProductoForm textoBoton="Editar Producto"
                    onSubmit={actualizarProducto}
                    valoresIniciales={{ nombre: producto.nombre, unidad_medida_id: producto.unidad_medida_id,
                                        cantidad_neta: producto.cantidad_neta, fecha_lanzamiento: producto.fecha_lanzamiento,
                                        foto_producto: producto.foto_producto, descripcion: producto.descripcion
                    }}/>
            </Container>
        </>
    )
}