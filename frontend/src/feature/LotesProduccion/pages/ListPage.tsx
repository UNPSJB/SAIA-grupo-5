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
import { CambiarEstadoLoteModal } from '../components/CambiarEstadoLoteProduccionModal';
import type { EstadoLote, LoteProduccion } from '../types';

const ESTILOS_ESTADO: Record<EstadoLote, { bg: string; color: string }> = {
    "En produccion": { bg: "#fef9c3", color: "#854d0e" },
    "Empaquetando": { bg: "#dbeafe", color: "#1e40af" },
    "Terminado": { bg: "#dcfce7", color: "#166534" },
    "Enviado": { bg: "#f3f4f6", color: "#374151" }
}

const CONFIG_BOTON: Record<EstadoLote, { tooltip: string; icon: string; variant: string }> = {
    "En produccion": { tooltip: "Pasar a Empaquetando", icon: "bi bi-box-seam", variant: "outline-warning" },
    "Empaquetando": { tooltip: "Marcar como Terminado", icon: "bi bi-check2-circle", variant: "outline-success" },
    "Terminado": { tooltip: "Marcar como Enviado", icon: "bi bi-truck", variant: "outline-secondary" },
    "Enviado": { tooltip: "Lote enviado", icon: "bi bi-check-all", variant: "outline-secondary" },
};

const ORDEN_ESTADOS: Record<EstadoLote, number> = {
    "En produccion": 1,
    "Empaquetando": 2,
    "Terminado": 3,
    "Enviado": 4
}

export function ListPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [search, setSearch] = useState('');
    const { data: lotes, error, isLoading } = useApi<LoteProduccion[]>("/lotes-produccion/");
    const [loteToChange, setLoteToChange] = useState<LoteProduccion | null>(null);

    const filteredLoteProduccion = useMemo(() => {
        if (!Array.isArray(lotes)) return [];

        return lotes.filter((lote) => lote.producto.nombre.toLowerCase().includes(search.toLowerCase())).sort((a, b) => {
            const pesoA = ORDEN_ESTADOS[a.estado] ?? 99;
            const pesoB = ORDEN_ESTADOS[b.estado] ?? 99;

            if (pesoA !== pesoB) {
                return pesoA - pesoB;
            }

            return b.id - a.id;
        });
}, [search, lotes]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                type="text"
                placeholder="Buscar lote de produccion..."
                className="mr-sm-2"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
        );
    }, []);

    if (isLoading) return <PageLoading title="Listado de Lotes de Produccion" />;

    if (!lotes || error) return (
        <PageError title="Listado de Lotes de Produccion" message="Ocurrió un error al cargar Lotes de Produccion" />
    );

    const columns: TableColumn<LoteProduccion>[] = [
        {
            name: 'Numero de lote',
            selector: row => row.id,
            sortable: true,
            center: true,
            minWidth: '151px',
            grow: 0.2,
        },
        {
            name: 'Producto',
            selector: row => row.producto.nombre,
            sortable: true,
            center: true,
            grow: 1.2,
        },
        {
            name: 'Fecha de produccion',
            selector: row => row.fecha_produccion.split("-").reverse().join("/"),
            sortable: true,
            center: true,
            minWidth: '188px',
            grow: 1.2,
        },
        {
            name: 'Fecha de vencimiento',
            selector: row => row.fecha_vencimiento.split("-").reverse().join("/"),
            sortable: true,
            center: true,
            minWidth: '191px',
            grow: 1.2,
        },
        {
            name: 'Cantidad producida',
            selector: row => row.cantidad_producida,
            sortable: true,
            center: true,
            minWidth: '185px',
            grow: 1,
        },
        {
            name: 'Estado',
            selector: row => row.estado,
            sortable: true,
            center: true,
            minWidth: '150px',
            grow: 2,
            cell: row => {
                const estilo = ESTILOS_ESTADO[row.estado] || ESTILOS_ESTADO["En produccion"];
                return (
                    <div
                        style={{
                            padding: '4px 12px',
                            borderRadius: '16px',
                            background: estilo.bg,
                            color: estilo.color,
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {row.estado}
                    </div>
                );
            }
        },
        {
            name: "Acciones",
            center: true,
            minWidth: '150px',
            cell: (row) => {
                const config = CONFIG_BOTON[row.estado] || CONFIG_BOTON["En produccion"];
                const completado = row.estado === "Enviado";

                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                        <ActionButton
                            variant="outline-info"
                            size="sm"
                            tooltip="Ver"
                            icon="bi bi-eye"
                            onClick={() => navigate(`/lotes-produccion/${row.id}`)}
                        />
                        {currentUser?.operar && (
                            <>
                                <ActionButton
                                    variant="outline-primary"
                                    size="sm"
                                    tooltip="Editar"
                                    icon="bi bi-pencil"
                                    disabled={completado}
                                    onClick={() => navigate(`/lotes-produccion/${row.id}/edit`)}
                                />
                                <ActionButton
                                    variant={config.variant}
                                    size="sm"
                                    tooltip={config.tooltip}
                                    icon={config.icon}
                                    disabled={completado}
                                    onClick={() => setLoteToChange(row)}
                                />
                            </>
                        )}
                    </div>
                );
            }
        }
    ];

    return (
        <Container>
            <Row className="p-2 align-items-center">
                <Col>
                    <PageHeader
                        eyebrow="PRODUCCION"
                        title="Listado de Lotes de Produccion"
                        subtitle="Revisá el listado de lotes de produccion creados hasta la fecha."
                    />
                </Col>
                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>
                {currentUser?.operar && (
                    <Col xs="auto" className="d-flex justify-content-end">
                        <Button
                            variant="primary"
                            size='sm'
                            onClick={() => navigate("/lotes-produccion/new")}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            + Nuevo Lote de Produccion
                        </Button>
                    </Col>
                )}
            </Row>
            <AppTable columns={columns} data={filteredLoteProduccion} />
            <CambiarEstadoLoteModal
                lote={loteToChange}
                onHide={() => setLoteToChange(null)}
                onChanged={() => mutate("/lotes-produccion/")}
            />
        </Container>
    );
}