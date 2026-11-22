import { Alert, Button, Container } from 'react-bootstrap';
import { mutate } from 'swr';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../../components/PageHeader';
import { PageLoading } from '../../../components/PageLoading';
import { useApi } from '../../../hooks/useApi';
import type { Producto } from '../../Productos/types';
import { RecetaForm } from '../components/RecetaForm';

export function NuevaRecetaPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: producto, error, isLoading } = useApi<Producto>(id ? `/productos/${id}` : null);

    const volver = () => navigate('/productos');

    if (isLoading) return <PageLoading title="Nueva receta" />;

    if (error || !producto) return (
        <Container>
            <PageHeader title="Nueva receta" />
            <Alert variant="danger" className="mt-3">No se pudo cargar el producto.</Alert>
            <Button variant="secondary" onClick={volver}>Volver</Button>
        </Container>
    );

    if (producto.receta != null) return (
        <Container>
            <PageHeader title="Nueva receta" />
            <Alert variant="warning" className="mt-3">Este producto ya tiene una receta vigente.</Alert>
            <Button onClick={() => navigate(`/productos/${producto.id}/receta`)}>Ver receta</Button>
        </Container>
    );

    return (
        <Container fluid style={{ maxWidth: '1140px' }}>
            <PageHeader title="Nueva receta" />
            <RecetaForm
                producto={producto}
                receta={null}
                onHide={volver}
                onSaved={(guardada) => {
                    mutate('/productos/');
                    mutate(`/productos/${producto.id}`);
                    mutate(`/recetas/producto/${producto.id}`);
                    mutate(`/recetas/producto/${producto.id}/versiones`);
                    mutate(`/recetas/${guardada.id}`);
                    navigate(`/productos/${producto.id}/receta`);
                }}
            />
        </Container>
    );
}
