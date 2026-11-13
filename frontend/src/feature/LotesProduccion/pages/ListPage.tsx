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
import { ListFilter } from '../../../components/ListFilter';
import { AsociarInsumosModal } from '../components/AsociarInsumosModal';
import type { EstadoLote, LoteProduccion } from '../types';
import { CrearEnvioModal } from '../../EnviosLote/components/CrearEnvioLoteModal';

const ESTILOS_ESTADO: Record<EstadoLote, { bg: string; color: string }> = {
    "En produccion": { bg: "#fef9c3", color: "#854d0e" },
    "Empaquetando": { bg: "#dbeafe", color: "#1e40af" },
    "Terminado": { bg: "#dcfce7", color: "#166534" },
    "Parcialmente despachado": { bg: "#e0e7ff", color: "#3730a3" },
    "Enviado": { bg: "#f3f4f6", color: "#374151" }
}

const CONFIG_BOTON: Record<EstadoLote, { tooltip: string; icon: string; variant: string }> = {
    "En produccion": { tooltip: "Pasar a Empaquetando", icon: "bi bi-box-seam", variant: "outline-warning" },
    "Empaquetando": { tooltip: "Marcar como Terminado", icon: "bi bi-check2-circle", variant: "outline-success" },
    "Terminado": { tooltip: "Lote terminado", icon: "bi bi-check2-all", variant: "outline-secondary" },
"Parcialmente despachado": { tooltip: "Lote parcialmente despachado", icon: "bi bi-truck", variant: "outline-secondary" },
    "Enviado": { tooltip: "Lote enviado", icon: "bi bi-check-all", variant: "outline-secondary" },
};

const ORDEN_ESTADOS: Record<EstadoLote, number> = {
    "En produccion": 1,
    "Empaquetando": 2,
    "Terminado": 3,
    "Parcialmente despachado": 4,
    "Enviado": 5
}

export function ListPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [search, setSearch] = useState('');
    const { data: lotes, error, isLoading } = useApi<LoteProduccion[]>("/lotes-produccion/");
    const [loteToChange, setLoteToChange] = useState<LoteProduccion | null>(null);
    const [loteInsumos, setLoteInsumos] = useState<LoteProduccion | null>(null);
    const [loteParaEnvio, setLoteParaEnvio] = useState<LoteProduccion | null>(null);
    const [filtroEstado, setFiltroEstado] = useState("todos");

    const filteredLoteProduccion = useMemo(() => {
        if (!Array.isArray(lotes)) return [];

        return lotes.filter((lote) =>
            lote.producto.nombre.toLowerCase().includes(search.toLowerCase()) &&
            (filtroEstado === "todos" || lote.estado === filtroEstado)
        ).sort((a, b) => {
            const pesoA = ORDEN_ESTADOS[a.estado] ?? 99;
            const pesoB = ORDEN_ESTADOS[b.estado] ?? 99;

            if (pesoA !== pesoB) {
                return pesoA - pesoB;
            }

            return b.id - a.id;
        });
    }, [search, filtroEstado, lotes]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                data-tour="buscador-lotes"
                type="text"
                placeholder="Buscar lote de produccion..."
                className="mr-sm-2"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
        );
    }, []);

    const handleInsumosAsociados = () => {
        mutate("/lotes-produccion/");
        if (loteInsumos) mutate(`/lotes-produccion/${loteInsumos.id}`);
        setLoteInsumos(null);
    };

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
            name: 'Stock',
            selector: row => row.cantidad_disponible ?? row.cantidad_producida,
            sortable: true,
            center: true,
            minWidth: '120px',
            cell: row => {
                const disponible = row.cantidad_disponible ?? row.cantidad_producida;
                return (
                    <span data-tour="stock-lote" className={disponible === 0 ? "text-danger fw-bold" : "fw-bold text-success"}>
                        {disponible} <span className="text-muted fw-normal">/ {row.cantidad_producida}</span>
                    </span>
                );
            }
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
                        data-tour="estado-lote"
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
            minWidth: '190px',
            cell: (row) => {
                const config = CONFIG_BOTON[row.estado] || CONFIG_BOTON["En produccion"];
                const stockActual = row.cantidad_disponible ?? row.cantidad_producida;
                const puedeAvanzar = row.estado === "En produccion" || row.estado === "Empaquetando";
                const puedeModificarInsumos = row.activo && row.estado === "En produccion";
                const tieneInsumos = (row.insumos_utilizados?.length ?? 0) > 0;
                const mostrarBotonAvanzar = row.estado === "En produccion" || row.estado === "Empaquetando";
                const mostrarBotonDespacho = (row.estado === "Terminado" || row.estado === "Parcialmente despachado");
                const puedeDespachar = currentUser?.operar && mostrarBotonDespacho && stockActual > 0;
                
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                        <span data-tour="btn-ver-lote">
                            <ActionButton
                                variant="outline-info"
                                size="sm"
                                tooltip="Ver"
                                icon="bi bi-eye"
                                onClick={() => navigate(`/lotes-produccion/${row.id}`, { state: { origen: "lista" }})}
                            />
                        </span>
                        {currentUser?.operar && (
                            <>
                                <span data-tour="btn-editar-lote">
                                    <ActionButton
                                        variant="outline-primary"
                                        size="sm"
                                        tooltip="Editar"
                                        icon="bi bi-pencil"
                                        disabled={row.estado === "Enviado" || row.estado === "Parcialmente despachado"}
                                        onClick={() => navigate(`/lotes-produccion/${row.id}/edit`)}
                                    />
                                </span>
                                <span data-tour="btn-insumos-lote">
                                    <ActionButton
                                        variant="outline-success"
                                        size="sm"
                                        tooltip={tieneInsumos ? "Modificar insumos" : "Asociar insumos"}
                                        icon={tieneInsumos ? "bi bi-pencil-square" : "bi bi-plus-circle"}
                                        disabled={!puedeModificarInsumos}
                                        onClick={() => setLoteInsumos(row)}
                                    />
                                </span>
                                {mostrarBotonAvanzar && (
                                    <span data-tour="btn-avanzar-lote">
                                        <ActionButton
                                            variant={config.variant}
                                            size="sm"
                                            tooltip={config.tooltip}
                                            icon={config.icon}
                                            disabled={!puedeAvanzar}
                                            onClick={() => setLoteToChange(row)}
                                        />
                                    </span>
                                )}
                                {mostrarBotonDespacho && (
                                    <span data-tour="btn-despachar-lote">
                                        <ActionButton
                                            variant="outline-secondary"
                                            size="sm"
                                            tooltip="Despachar Envío"
                                            icon="bi bi-truck"
                                            disabled={!puedeDespachar}
                                            onClick={() => setLoteParaEnvio(row)}
                                        />
                                    </span>
                                )}
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
                        eyebrow="PRODUCCIÓN"
                        title="Listado de Lotes de Produccion"
                        subtitle="Revisá el listado de lotes de produccion creados hasta la fecha."
                    />
                </Col>
                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>
                <Col xs="auto" className="align-self-center" data-tour="filtro-estado-lotes">
                    <ListFilter
                        value={filtroEstado}
                        onChange={setFiltroEstado}
                        options={{
                            todos: "Todos",
                            "En produccion": "En producción",
                            Empaquetando: "Empaquetando",
                            Terminado: "Terminado",
                            "Parcialmente despachado" : "Parcialmente despachado",
                            Enviado: "Enviado"
                        }}
                    />
                </Col>
                {currentUser?.operar && (
                    <Col xs="auto" className="d-flex justify-content-end">
                        <Button
                            data-tour="btn-nuevo-lote"
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
            <div data-tour="tabla-lotes">
                <AppTable columns={columns} data={filteredLoteProduccion} />
            </div>
            <CambiarEstadoLoteModal
                lote={loteToChange}
                onHide={() => setLoteToChange(null)}
                onChanged={() => mutate("/lotes-produccion/")}
            />
            {loteInsumos && (
                <AsociarInsumosModal
                    loteId={loteInsumos.id}
                    insumosAsociados={loteInsumos.insumos_utilizados ?? []}
                    onHide={() => setLoteInsumos(null)}
                    onAsociado={handleInsumosAsociados}
                />
            )}
            <CrearEnvioModal
                lote={loteParaEnvio}
                onHide={() => setLoteParaEnvio(null)}
                onEnviado={() => mutate("/lotes-produccion/")}
            />
        </Container>
    );
}
