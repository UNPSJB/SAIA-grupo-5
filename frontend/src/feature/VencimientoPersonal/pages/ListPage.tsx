import React, { useState, useMemo } from 'react';
import { mutate } from 'swr';
import { Alert, Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { type TableColumn } from 'react-data-table-component';
import { ActionButton } from '../../../components/ActionButton';

import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/useAuth';

import type { VencimientoPersonal } from '../types';
import type { Persona } from '../../Personal/types';
import type { ConfiguracionSistema } from '../../ConfiguracionSistema/types';
import { RenovarVencimientoModal } from '../components/RenovarVencimientoModal';
import { HistoricoVencimientoModal } from '../components/HistoricoVencimientoModal';


export function ListPage() {
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el insumo
    const { currentUser } = useAuth();
    const { personaId } = useParams();
    const [search, setSearch] = useState('');

    const { data: persona } = useApi<Persona>(`/personal/${personaId}`);
    const { data: vencimientos, error, isLoading } = useApi<VencimientoPersonal[]>(`/vencimiento-personal/persona/${personaId}`);

    const { data: configuracion } = useApi<ConfiguracionSistema>(currentUser?.administrar ? '/configuracion-sistema/' : null);
    const diasAntelacion = configuracion?.dias_antelacion_vencimiento ?? 15;

    const [vencimientoToRenovar, setVencimientoToRenovar] = useState<VencimientoPersonal | null>(null);
    const [vencimientoHistorico, setVencimientoHistorico] = useState<VencimientoPersonal | null>(null);

    // useMemo infiere que retorna un array de tipo Insumo[]
    const filteredVencimientos = useMemo(() => {
        if (!Array.isArray(vencimientos)) return [];     // Se agrego una validacion para preguntar si insumos es un array
        return (vencimientos ?? []).filter((vencimiento) => {
            return (
                vencimiento.tipo_vencimiento.nombre.toLowerCase().includes(search.toLowerCase())
            );
        });
    }, [search, vencimientos]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                type="text"
                placeholder="Buscar tipo vencimiento..."
                className=" mr-sm-2"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
        );
    }, [search]);

    const tituloPagina = persona ? `Vencimientos de ${persona.nombre} ${persona.apellido}` : "Listado de Vencimientos";

    if (isLoading) return (
        <>
            <PageHeader title={tituloPagina} />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
            </Spinner>
        </>
    )
    if (!vencimientos || error) return (
        <Container>
            <PageHeader title={tituloPagina} />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar los Vencimientos</Alert>
                </Col>
            </Row>
        </Container>
    )

    const columns: TableColumn<VencimientoPersonal>[] = [
        {
            name: 'Tipo de Vencimiento',
            selector: row => row.tipo_vencimiento.nombre,
            sortable: true,
            center: true,
            grow: 2,
            cell: row => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                        style={{
                            padding: '4px 12px',
                            borderRadius: '16px',
                            background: '#ffaaed',
                            color: '#ff27db',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {row.tipo_vencimiento.nombre}
                    </div>
                </div>
            ),
        },
        {
            name: 'Fecha Desde',
            selector: row => row.fecha_desde.split("-").reverse().join("/"),
            sortable: true,
            center: true,
        },
        {
            name: 'Vencimiento',
            selector: row => row.fecha_hasta.split("-").reverse().join("/"),
            sortable: true,
            center: true,
        },
        {
            name: 'Estado',
            selector: row => row.dias_restantes,
            sortable: true,
            center: true,
            minWidth: '190px',
            cell: row => {
                const vencido = row.dias_restantes <= 0;
                const proximo = row.dias_restantes > 0 && row.dias_restantes <= diasAntelacion;
                const badge = vencido ? '#fee2e2' : proximo ? '#fef3c7' : '#dcfce7';
                const color = vencido ? '#991b1b' : proximo ? '#92400e' : '#166534';
                const texto = vencido
                    ? `Vencido (${Math.abs(row.dias_restantes)} dias)`
                    : proximo
                    ? `Proximo a vencer (${row.dias_restantes} d)`
                    : `Vigente (${row.dias_restantes} dias)`;

                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                            style={{
                                padding: '4px 12px',
                                borderRadius: '16px',
                                background: badge,
                                color: color,
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {texto}
                        </div>
                    </div>
                );
            },
        },
        {
            name: "Acciones",
            center: true,
            minWidth: '280px',
            cell: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ActionButton
                        variant="outline-info"
                        size="sm"
                        tooltip="Ver vencimiento"
                        icon="bi bi-eye"
                        onClick={() => navigate (`/vencimiento-personal/${row.id}`)}
                    />

                    <ActionButton
                        variant="outline-warning"
                        size="sm"
                        tooltip="Historico"
                        icon="bi bi-clock-history"
                        onClick={() => setVencimientoHistorico(row)}
                    />
                    {currentUser?.administrar && (
                        <>
                            <ActionButton
                                variant="outline-primary"
                                size="sm"
                                tooltip="Editar"
                                icon="bi bi-pencil"
                                disabled={!persona?.activo}
                                onClick={() => navigate(`/vencimiento-personal/${row.id}/edit`)}
                            />
                            <ActionButton
                                variant="outline-success"
                                size="sm"
                                tooltip="Renovar"
                                icon="bi bi-arrow-repeat"
                                disabled={!persona?.activo}
                                onClick={() => setVencimientoToRenovar(row)}
                            />
                        </>
                    )}
                </div>
            )
        },
    ];

    return (
        <Container>
            <Row className="p-2 align-items-center" >
                <Col>
                    <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        onClick={() => navigate("/personal")}
                    >
                        <i className="bi bi-arrow-left me-1"></i>Volver
                    </Button>               
                </Col>
                <Col>
                    <PageHeader title={tituloPagina} />
                </Col>
                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>

                {currentUser?.administrar && (
                    <Col xs="auto" className="d-flex justify-content-end">
                        <Button
                            variant="primary"
                            size='sm'
                            disabled={!persona?.activo}
                            onClick={() => navigate(`/personal/${personaId}/vencimientos/new`)}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            + Nuevo Vencimiento
                        </Button>
                    </Col>
                )}
            </Row>
            <AppTable columns={columns} data={filteredVencimientos} />
            <RenovarVencimientoModal
                vencimiento={vencimientoToRenovar}
                onHide={() => setVencimientoToRenovar(null)}
                onRenovado={() => mutate(`/vencimiento-personal/persona/${personaId}`)}
            />
            <HistoricoVencimientoModal
                vencimiento={vencimientoHistorico}
                onHide={() => setVencimientoHistorico(null)}
            />
        </Container>
    );
}