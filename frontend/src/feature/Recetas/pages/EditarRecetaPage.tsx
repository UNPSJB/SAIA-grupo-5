
import { Alert, Button, Container } from 'react-bootstrap';
import { mutate } from 'swr';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../../components/PageHeader';
import { PageLoading } from '../../../components/PageLoading';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/useAuth';
import type { Producto } from '../../Productos/types';
import type { Receta } from '../types';
import { RecetaForm } from '../components/RecetaForm';

export function EditarRecetaPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const { data: producto, error: errorProducto, isLoading: cargandoProducto } =
        useApi<Producto>(id ? `/productos/${id}` : null);

    const { data: receta, error: errorReceta, isLoading: cargandoReceta } =
        useApi<Receta>(producto ? `/recetas/producto/${producto.id}` : null);

    const volver = () => navigate(`/productos/${id}/receta`);

    if (cargandoProducto || (producto && cargandoReceta)) return <PageLoading title="Editar receta" />;

    if (errorProducto || errorReceta || !producto || !receta) return (
        <Container>
            <PageHeader title="Editar receta" />
            <Alert variant="danger" className="mt-3">No se pudo cargar la receta.</Alert>
            <Button variant="secondary" onClick={volver}>Volver</Button>
        </Container>
    );

    if (!currentUser?.administrar || !receta.vigente) return (
        <Container>
            <PageHeader title="Editar receta" />
            <Alert variant="warning" className="mt-3">No tenés permiso para editar esta receta.</Alert>
            <Button variant="secondary" onClick={volver}>Volver</Button>
        </Container>
    );

    return (
        <Container fluid style={{ maxWidth: '1140px' }}>
            <PageHeader title="Editar receta" />
            <RecetaForm
                producto={producto}
                receta={receta}
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
