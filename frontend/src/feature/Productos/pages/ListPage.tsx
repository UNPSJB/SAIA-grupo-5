import React, { useState, useMemo } from 'react';
import { mutate } from 'swr';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { type TableColumn } from 'react-data-table-component';

import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { PageLoading } from '../../../components/PageLoading';
import { PageError } from '../../../components/PageError';
import { ActionButton } from '../../../components/ActionButton';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/useAuth';

import { DeleteProductoModal } from '../components/DeleteProductoModal';
import { RecetaFormModal } from '../../Recetas/components/RecetaFormModal';
import { VerRecetaModal } from '../../Recetas/components/VerRecetaModal';
import type { Producto } from '../types';
import type { Receta } from '../../Recetas/types';
import { ListFilter } from "../../../components/ListFilter";

type EstadoFiltro = "todos" | "activo" | "inactivo";

const ESTADO_FILTRO_LABELS: Record<EstadoFiltro, string> = {
    todos: "Todos",
    activo: "Vigentes",
    inactivo: "Descontinuados",
};

export function ListPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [search, setSearch] = useState('');
    const { data: productos, error, isLoading } = useApi<Producto[]>("/productos/");
    const [productoToDelete, setProductoToDelete] = useState<Producto | null>(null);
    const [productoReceta, setProductoReceta] = useState<Producto | null>(null);
    const [productoVerReceta, setProductoVerReceta] = useState<Producto | null>(null);
    const [recetaEditar, setRecetaEditar] = useState<Receta | null>(null);
    const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>("todos");
    
    const filteredProducto = useMemo(() => {
        if (!Array.isArray(productos)) return [];

        const busqueda = search.toLowerCase().trim();

        return productos.filter((producto) => {
            const fechaFormateada = producto.fecha_lanzamiento
                .split("-")
                .reverse()
                .join("/");

            const coincideBusqueda =
                producto.nombre.toLowerCase().includes(busqueda) ||
                producto.unidad_medida.nombre.toLowerCase().includes(busqueda) ||
                producto.cantidad_neta.toString().includes(busqueda) ||
                producto.fecha_lanzamiento.includes(busqueda) ||
                fechaFormateada.includes(busqueda);

            const coincideEstado =
                estadoFiltro === "todos" ||
                (estadoFiltro === "activo" && producto.activo) ||
                (estadoFiltro === "inactivo" && !producto.activo);

            return coincideBusqueda && coincideEstado;
        });
    }, [search, estadoFiltro, productos]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                data-tour="buscador-productos"
                type="text"
                placeholder="Buscar producto..."
                className="mr-sm-2"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
        );
    }, []);

    if (isLoading) return <PageLoading title="Listado de Productos" />;

    if (!productos || error) return (
        <PageError title="Listado de Productos" message="Ocurrió un error al cargar Productos" />
    );

    const columns: TableColumn<Producto>[] = [
        {
            name: 'Nombre',
            selector: row => row.nombre,
            sortable: true,
            center: true,
            minWidth: '200px',
            grow: 1.4,
        },
        {
            name: 'Unidad de medida',
            selector: row => row.unidad_medida.nombre,
            sortable: true,
            center: true,
            cell: row => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                        data-tour="unidad-medida-producto"
                        style={{
                            padding: '4px 12px',
                            borderRadius: '16px',
                            background: '#dbeafe',
                            color: '#1d4ed8',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {row.unidad_medida.nombre}
                    </div>
                </div>
            ),
        },
        {
            name: 'Cantidad neta',
            selector: row => row.cantidad_neta,
            sortable: true,
            center: true,
            minWidth: '200px',
            grow: 0,
        },
        {
            name: 'Fecha de lanzamiento',
            selector: row => row.fecha_lanzamiento.split("-").reverse().join("/"),
            sortable: true,
            center: true,
            grow: 1.2,
        },
        {
            name: 'Estado',
            selector: row => row.activo ? 'Vigente' : 'Descontinuado',
            sortable: true,
            center: true,
            cell: row => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10}}>
                    <div
                        data-tour="estado-producto"
                        style={{
                            padding: '4px 12px',
                            borderRadius: '16px',
                            background: row.activo ? '#dcfce7' : '#fee2e2',
                            color: row.activo ? '#166534' : '#991b1b',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {row.activo ? 'Vigente' : 'Descontinuado'}
                    </div>
                </div>
            )
        },
        {
            name: "Acciones",
            center: true,
            grow: 1.25,
            minWidth: '220px',
            cell: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                    <span data-tour="btn-ver-producto">
                        <ActionButton
                            variant="outline-info"
                            size="sm"
                            tooltip="Ver"
                            icon="bi bi-eye"
                            onClick={() => navigate(`/productos/${row.id}`)}
                        />
                    </span>
                    {row.receta != null && (
                        <ActionButton
                            variant="outline-secondary"
                            size="sm"
                            tooltip="Ver receta"
                            icon="bi bi-journal-text"
                            onClick={() => setProductoVerReceta(row)}
                        />
                    )}

                    {currentUser?.administrar && (
                        <>
                            <span data-tour="btn-editar-producto">
                                <ActionButton
                                    variant="outline-primary"
                                    size="sm"
                                    tooltip="Editar"
                                    icon="bi bi-pencil"
                                    disabled={!row.activo}
                                    onClick={() => navigate(`/productos/${row.id}/edit`)}
                                />
                            </span>
                            {row.receta == null && (
                                <ActionButton
                                    variant="outline-secondary"
                                    size="sm"
                                    tooltip="Agregar receta"
                                    icon="bi bi-journal-plus"
                                    disabled={!row.activo}
                                    onClick={() => setProductoReceta(row)}
                                />
                            )}
                            <span data-tour="btn-baja-producto">
                                <ActionButton
                                    variant={row.activo ? 'outline-danger' : 'outline-success'}
                                    size="sm"
                                    tooltip={row.activo ? 'Dar de baja' : 'Dar de alta'}
                                    icon={row.activo ? 'bi-dash-circle' : 'bi-check-circle'}
                                    onClick={() => setProductoToDelete(row)}
                                />
                            </span>
                        </>
                    )}
                </div>
            )
        }
    ];

    return (
        <Container>
            <Row className="p-2 align-items-center">
                <Col>
                    <PageHeader
                        eyebrow="GESTIÓN"
                        title="Listado de Productos"
                        subtitle="Revisá el listado de productos creados hasta la fecha."
                    />
                </Col>
                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>
                <Col xs="auto" className="align-self-center">
                    <ListFilter
                        value={estadoFiltro}
                        options={ESTADO_FILTRO_LABELS}
                        onChange={(value) => setEstadoFiltro(value as EstadoFiltro)}
                    />
                </Col>
                {currentUser?.administrar && (
                    <Col xs="auto" className="d-flex justify-content-end">
                        <Button
                            data-tour="btn-nuevo-producto"
                            variant="primary"
                            size='sm'
                            onClick={() => navigate("/productos/new")}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            + Nuevo Producto
                        </Button>
                    </Col>
                )}
            </Row>
            <div data-tour="tabla-productos">
                <AppTable columns={columns} data={filteredProducto} />
            </div>
            <DeleteProductoModal
                producto={productoToDelete}
                onHide={() => setProductoToDelete(null)}
                onDeleted={() => mutate("/productos/")}
            />
            <RecetaFormModal
                producto={productoReceta}
                receta={recetaEditar}
                onHide={() => {
                    setProductoReceta(null);
                    setRecetaEditar(null);
                }}
                onSaved={(receta) => {
                    mutate(`/recetas/producto/${receta.producto_id}`, receta, false);
                    mutate("/productos/");
                }}
            />
            <VerRecetaModal
                producto={productoVerReceta}
                onHide={() => setProductoVerReceta(null)}
                onEditar={currentUser?.administrar ? (receta) => {
                    setRecetaEditar(receta);
                    setProductoReceta(productoVerReceta);
                    setProductoVerReceta(null);
                } : undefined}
            />
        </Container>
    );
}