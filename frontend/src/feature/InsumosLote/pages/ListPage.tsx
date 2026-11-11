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
import { ListFilter } from '../../../components/ListFilter';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/useAuth';

import type { InsumoLote } from '../types';
import { CambiarEstadoInsumoLoteModal } from '../components/CambiarEstadoInsumoLoteModal';

type FiltroVencimientoInsumo = 'todos' | 'activos' | 'inactivos' | 'bajo_stock' | 'vencido' | 'proximo' | 'vigente';

const FILTRO_LABELS: Record<FiltroVencimientoInsumo, string> = {
    todos: 'Todos',
    activos: 'Solo Activos',
    inactivos: 'Inactivos / Agotados',
    bajo_stock: 'Bajo stock',
    vencido: 'Vencidos',
    proximo: 'Próximos a vencer',
    vigente: 'Vigentes',
};

const DIAS_ANTELACION_INSUMO = 15;

function calcularDiasRestantes(fechaVencimientoStr: string): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const partes = fechaVencimientoStr.split('-');
    const fechaVenc = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
    fechaVenc.setHours(0, 0, 0, 0);

    const diferenciaMs = fechaVenc.getTime() - hoy.getTime();
    return Math.round(diferenciaMs / (1000 * 60 * 60 * 24));
}

export function ListPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [search, setSearch] = useState('');
    const [estadoFiltro, setEstadoFiltro] = useState<FiltroVencimientoInsumo>('todos');
    const [insumoParaCambiarEstado, setInsumoParaCambiarEstado] = useState<InsumoLote | null>(null);

    const { data: insumosLote, error, isLoading } = useApi<InsumoLote[]>('/insumos-lote/');

    const filteredInsumos = useMemo(() => {
        if (!Array.isArray(insumosLote)) return [];

        const busqueda = search.toLowerCase();

        return insumosLote.filter((insumo) => {
            const diasRestantes = calcularDiasRestantes(insumo.fecha_vencimiento);

            const coincideBusqueda =
                insumo.insumo.nombre.toLowerCase().includes(busqueda) ||
                insumo.marca.toLowerCase().includes(busqueda) ||
                (insumo.lote_proveedor?.numero_lote.toLowerCase().includes(busqueda) ?? false) ||
                (insumo.lote_proveedor?.proveedor?.nombre.toLowerCase().includes(busqueda) ?? false);

            let coincideEstado = true;
            if (estadoFiltro === 'activos') {
                coincideEstado = insumo.activo;
            } else if (estadoFiltro === 'inactivos') {
                coincideEstado = !insumo.activo;
            } else if (estadoFiltro === 'bajo_stock') {
                coincideEstado = insumo.cantidad_restante > 0 && insumo.cantidad_restante <= insumo.minimo_alerta;
            } else if (estadoFiltro === 'vencido') {
                coincideEstado = diasRestantes <= 0;
            } else if (estadoFiltro === 'proximo') {
                coincideEstado = diasRestantes > 0 && diasRestantes <= DIAS_ANTELACION_INSUMO;
            } else if (estadoFiltro === 'vigente') {
                coincideEstado = diasRestantes > DIAS_ANTELACION_INSUMO;
            }

            return coincideBusqueda && coincideEstado;
        });
    }, [search, estadoFiltro, insumosLote]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                type="text"
                placeholder="Buscar por insumo, marca, lote o proveedor..."
                className="mr-sm-2"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
        );
    }, []);

    const tituloPagina = 'Stock de Insumos Alimenticios';

    if (isLoading) return <PageLoading title={tituloPagina} />;

    if (!insumosLote || error) return (
        <PageError title={tituloPagina} message="Ocurrió un error al cargar el stock de insumos" />
    );

    const columns: TableColumn<InsumoLote>[] = [
        {
            name: 'Insumo',
            selector: row => row.insumo.nombre,
            sortable: true,
            center: true,
            grow: 1.2,
            cell: row => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                        style={{
                            padding: '4px 12px',
                            borderRadius: '16px',
                            background: row.activo ? '#00d9ff5b' : '#e2e8f0',
                            color: row.activo ? '#000294' : '#64748b',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {row.insumo.nombre}
                    </div>
                </div>
            ),
        },
        {
            name: 'Marca',
            selector: row => row.marca,
            sortable: true,
            center: true,
            grow: 0.8,
        },
        {
            name: 'Origen / Lote',
            center: true,
            minWidth: '220px',
            grow: 1.1,
            cell: row => {
                const loteId = row.lote_proveedor?.id || row.lote_proveedor_id;
                const textoLote = row.lote_proveedor?.numero_lote || `ID #${row.lote_proveedor_id}`;
                const proveedorNombre = row.lote_proveedor?.proveedor?.nombre || 'N/A';

                return (
                    <div style={{ whiteSpace: 'nowrap', fontSize: '0.88rem' }}>
                        <Button
                            variant="link"
                            className="p-0 fw-bold text-decoration-none me-2"
                            onClick={() => navigate(`/recepciones/${loteId}`)}
                            title="Ir a la recepción del lote"
                        >
                            <i className="bi bi-box-arrow-up-right me-1 small"></i>
                            {textoLote}
                        </Button>
                        <span className="text-muted">({proveedorNombre})</span>
                    </div>
                );
            },
        },
        {
            name: 'Stock',
            selector: row => row.cantidad_restante,
            sortable: true,
            center: true,
            minWidth: '120px',
            cell: row => {
                const esCero = row.cantidad_restante === 0;
                const esBajoStock = row.cantidad_restante <= row.minimo_alerta;
                return (
                    <span className={esCero ? 'text-muted fw-bold' : esBajoStock ? 'text-danger fw-bold' : 'fw-bold text-success'}>
                        {row.cantidad_restante} <span className="text-muted fw-normal">/ {row.cantidad}</span>
                    </span>
                );
            },
        },
        {
            name: 'Estado Fisico',
            center: true,
            minWidth: '130px',
            cell: row => {
                const agotado = row.cantidad_restante === 0;
                const activo = row.activo;

                const bg = agotado ? '#f1f5f9' : activo ? '#dcfce7' : '#fee2e2';
                const color = agotado ? '#64748b' : activo ? '#166534' : '#991b1b';
                const texto = agotado ? 'Agotado' : activo ? 'Disponible' : 'Baja manual';

                return (
                    <div
                        style={{
                            padding: '4px 10px',
                            borderRadius: '16px',
                            background: bg,
                            color: color,
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {texto}
                    </div>
                );
            },
        },
        {
            name: 'Fecha Venc.',
            selector: row => row.fecha_vencimiento.split('-').reverse().join('/'),
            sortable: true,
            center: true,
            grow: 0.7,
        },
        {
            name: 'Estado Vencimiento',
            selector: row => calcularDiasRestantes(row.fecha_vencimiento),
            sortable: true,
            center: true,
            minWidth: '180px',
            grow: 1,
            cell: row => {
                const diasRestantes = calcularDiasRestantes(row.fecha_vencimiento);
                const vencido = diasRestantes <= 0;
                const proximo = diasRestantes > 0 && diasRestantes <= DIAS_ANTELACION_INSUMO;
                const badge = vencido ? '#fee2e2' : proximo ? '#fef3c7' : '#dcfce7';
                const color = vencido ? '#991b1b' : proximo ? '#92400e' : '#166534';
                const texto = vencido
                    ? `Vencido (${Math.abs(diasRestantes)} d)`
                    : proximo
                    ? `Próximo (${diasRestantes} d)`
                    : `Vigente (${diasRestantes} d)`;

                return (
                    <div
                        style={{
                            padding: '4px 12px',
                            borderRadius: '16px',
                            background: badge,
                            color: color,
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            whiteSpace: 'nowrap',
                            fontSize: '0.82rem',
                        }}
                    >
                        {texto}
                    </div>
                );
            },
        },
        {
            name: 'Acciones',
            center: true,
            minWidth: '110px',
            cell: row => {
                const tieneStock = row.cantidad_restante > 0;
                const estaDeshabilitado = !row.activo && !tieneStock;

                let tooltipTexto = row.activo ? 'Dar de baja' : 'Dar de alta';
                if (estaDeshabilitado) {
                    tooltipTexto = 'No se puede dar de alta sin stock';
                }

                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                        <ActionButton
                            variant="outline-info"
                            size="sm"
                            tooltip="Ver detalle"
                            icon="bi bi-eye"
                            onClick={() => navigate(`/insumos-lote/${row.id}`)}
                        />
                        {currentUser?.operar && (
                            <ActionButton
                                variant={row.activo ? 'outline-danger' : 'outline-success'}
                                size="sm"
                                tooltip={tooltipTexto}
                                icon={row.activo ? 'bi-dash-circle' : 'bi-check-circle'}
                                disabled={estaDeshabilitado}
                                onClick={() => setInsumoParaCambiarEstado(row)}
                            />
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <Container>
            <Row className="p-2 align-items-center">
                <Col>
                    <PageHeader
                        eyebrow="STOCK"
                        title={tituloPagina}
                        subtitle="Control de insumos recibidos, stock disponible y trazabilidad de origen."
                    />
                </Col>
                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>
                <Col xs="auto" className="align-self-center">
                    <ListFilter
                        value={estadoFiltro}
                        options={FILTRO_LABELS}
                        onChange={(value) => setEstadoFiltro(value as FiltroVencimientoInsumo)}
                    />
                </Col>
            </Row>

            <AppTable columns={columns} data={filteredInsumos} />

            <CambiarEstadoInsumoLoteModal
                insumoLote={insumoParaCambiarEstado}
                onHide={() => setInsumoParaCambiarEstado(null)}
                onActualizado={() => mutate('/insumos-lote/')}
            />
        </Container>
    );
}