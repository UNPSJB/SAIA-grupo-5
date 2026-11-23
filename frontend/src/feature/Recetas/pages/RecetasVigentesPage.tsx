import { useMemo, useState } from 'react';
import { Alert, Container, Form, InputGroup, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/PageHeader';
import { PageLoading } from '../../../components/PageLoading';
import { useApi } from '../../../hooks/useApi';
import type { Producto } from '../../Productos/types';
import './ConsultaReceta.css';

const TITULO = 'Recetas';

// Consulta de solo lectura para quien opera: solo productos activos que tienen receta vigente.
export function RecetasVigentesPage() {
    const navigate = useNavigate();
    const [busqueda, setBusqueda] = useState('');
    const { data: productos, isLoading, error } = useApi<Producto[]>('/productos/');

    const conReceta = useMemo(
        () => (productos ?? [])
            .filter((producto) => producto.activo && producto.receta)
            .sort((a, b) => a.nombre.localeCompare(b.nombre)),
        [productos],
    );

    const filtrados = useMemo(() => {
        const texto = busqueda.toLowerCase().trim();
        if (texto === '') return conReceta;
        return conReceta.filter((producto) =>
            [producto.nombre, producto.codigo_producto ?? ''].some((valor) => valor.toLowerCase().includes(texto)));
    }, [conReceta, busqueda]);

    if (isLoading) return <PageLoading title={TITULO} />;

    return (
        <Container className="consulta-receta">
            <PageHeader
                eyebrow="PRODUCCIÓN"
                title={TITULO}
                subtitle="Consultá la versión vigente antes de elaborar."
            />

            {error ? (
                <Alert variant="danger">No se pudieron cargar los productos.</Alert>
            ) : (
                <>
                    <InputGroup className="mb-3">
                        <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
                        <Form.Control
                            type="search"
                            placeholder="Buscar producto..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </InputGroup>

                    {filtrados.length === 0 ? (
                        <p className="text-muted text-center py-4">
                            {conReceta.length === 0 ? 'Todavía no hay productos con receta cargada.' : 'No se encontraron productos.'}
                        </p>
                    ) : (
                        <ListGroup className="consulta-receta-lista shadow-sm">
                            {filtrados.map((producto) => (
                                <ListGroup.Item
                                    key={producto.id}
                                    action
                                    onClick={() => navigate(`/recetas/${producto.id}`)}
                                    className="d-flex align-items-center gap-3"
                                >
                                    <span className="consulta-receta-icono"><i className="bi bi-journal-text"></i></span>
                                    <span className="flex-grow-1 text-start text-truncate">
                                        <span className="d-block fw-semibold text-truncate">{producto.nombre}</span>
                                        {producto.codigo_producto && (
                                            <small className="text-muted">Cód. {producto.codigo_producto}</small>
                                        )}
                                    </span>
                                    <i className="bi bi-chevron-right text-muted"></i>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </>
            )}
        </Container>
    );
}
