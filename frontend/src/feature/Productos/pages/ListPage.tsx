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
import { NuevaRecetaModal } from '../../Recetas/components/NuevaRecetaModal';
import { VerRecetaModal } from '../../Recetas/components/VerRecetaModal';
import type { Producto } from '../types';

export function ListPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [search, setSearch] = useState('');
    const { data: productos, error, isLoading } = useApi<Producto[]>("/productos/");
    const [productoToDelete, setProductoToDelete] = useState<Producto | null>(null);
    const [productoReceta, setProductoReceta] = useState<Producto | null>(null);
    const [productoVerReceta, setProductoVerReceta] = useState<Producto | null>(null);

    const filteredProducto = useMemo(() => {
        if (!Array.isArray(productos)) return [];
        return (productos ?? []).filter((producto) => {
            return (
                producto.nombre.toLowerCase().includes(search.toLowerCase())
            );
        });
    }, [search, productos]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
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
                    
                    <ActionButton
                        variant="outline-info"
                        size="sm"
                        tooltip="Ver"
                        icon="bi bi-eye"
                        onClick={() => navigate(`/productos/${row.id}`)}
                    />
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
                            <ActionButton
                                variant="outline-primary"
                                size="sm"
                                tooltip="Editar"
                                icon="bi bi-pencil"
                                disabled={!row.activo}
                                onClick={() => navigate(`/productos/${row.id}/edit`)}
                            />
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
                            <ActionButton
                                variant={row.activo ? 'outline-danger' : 'outline-success'}
                                size="sm"
                                tooltip={row.activo ? 'Dar de baja' : 'Dar de alta'}
                                icon={row.activo ? 'bi-dash-circle' : 'bi-check-circle'}
                                onClick={() => setProductoToDelete(row)}
                            />
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
                {currentUser?.administrar && (
                    <Col xs="auto" className="d-flex justify-content-end">
                        <Button
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
            <AppTable columns={columns} data={filteredProducto} />
            <DeleteProductoModal
                producto={productoToDelete}
                onHide={() => setProductoToDelete(null)}
                onDeleted={() => mutate("/productos/")}
            />
            <NuevaRecetaModal
                producto={productoReceta}
                onHide={() => setProductoReceta(null)}
                onCreated={(receta) => {
                    mutate(`/recetas/producto/${receta.producto_id}`, receta, false);
                    mutate("/productos/");
                }}
            />
            <VerRecetaModal
                producto={productoVerReceta}
                onHide={() => setProductoVerReceta(null)}
            />
        </Container>
    );
}