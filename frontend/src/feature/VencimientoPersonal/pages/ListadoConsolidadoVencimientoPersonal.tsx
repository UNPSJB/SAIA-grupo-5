import React, { useState, useMemo } from 'react';
import { mutate } from 'swr';
import { Alert, Col, Container, Form, Row, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { type TableColumn } from 'react-data-table-component';
import { ActionButton } from '../../../components/ActionButton';

import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { PageLoading } from '../../../components/PageLoading';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/useAuth';

import type { VencimientoPersonal } from '../types';
import type { ConfiguracionSistema } from '../../ConfiguracionSistema/types';
import { RenovarVencimientoModal } from '../components/RenovarVencimientoModal';
import { HistoricoVencimientoModal } from '../components/HistoricoVencimientoModal';


export function VencimientoConsolidadoPage() {
    const navigate = useNavigate();    
    const { currentUser } = useAuth();
    const [search, setSearch] = useState('');

    const { data: vencimientos, error, isLoading } = useApi<VencimientoPersonal[]>(`/vencimiento-personal/`);

    const { data: configuracion } = useApi<ConfiguracionSistema>(currentUser?.administrar ? '/configuracion-sistema/' : null);
    const diasAntelacion = configuracion?.dias_antelacion_vencimiento ?? 15;

    const [vencimientoToRenovar, setVencimientoToRenovar] = useState<VencimientoPersonal | null>(null);
    const [vencimientoHistorico, setVencimientoHistorico] = useState<VencimientoPersonal | null>(null);

    const filteredVencimientos = useMemo(() => {
        if (!Array.isArray(vencimientos)) return [];     // Se agrego una validacion para preguntar si insumos es un array
        const termino = search.toLowerCase().trim();        // Limpia lo que se escribio en la busqueda

        return[...vencimientos].filter((vencimiento) => {       // Creamos una copia de la lista original antes de filtrarla pq el sort modificaria el arreglo original
            const nombreCompleto = `${vencimiento.persona.nombre} ${vencimiento.persona.apellido}`.toLowerCase();
            const apellidoNombre = `${vencimiento.persona.apellido} ${vencimiento.persona.nombre}`.toLowerCase();
            const tipoNombre = vencimiento.tipo_vencimiento.nombre.toLowerCase();

            {/* Si lo que buscaste coincide con cualquiera de los 3 deja esa fila en la tabla */}
            return (
                nombreCompleto.includes(termino) ||
                apellidoNombre.includes(termino) ||
                tipoNombre.includes(termino)
            );
        }).sort((v1, v2) => v1.dias_restantes - v2.dias_restantes)      // Ordena las filas de mas urgente a menos urgente
    }, [search, vencimientos]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                type="text"
                placeholder="Buscar por persona o tipo..."
                className=" mr-sm-2"
                style={{ minWidth: '250px' }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
        );
    }, []);

    const tituloPagina = "Vencimientos del Personal"

    if (isLoading) return <PageLoading title={tituloPagina} />;

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
            name: 'Persona',
            selector: row => `${row.persona.nombre} ${row.persona.apellido}`,
            sortable: true,
            center: true,
            minWidth: '180px',
            grow:1.2,
        },
        {
            name: 'Tipo de Vencimiento',
            selector: row => row.tipo_vencimiento.nombre,
            sortable: true,
            center: true,
            grow: 1.2,
            cell: row => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                        style={{
                            padding: '4px 12px',
                            borderRadius: '16px',
                            background: '#00d9ff5b',
                            color: '#000294',
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
            grow: 0.6,
        },
        {
            name: 'Fecha Hasta',
            selector: row => row.fecha_hasta.split("-").reverse().join("/"),
            sortable: true,
            center: true,
            grow: 0.6,
        },
        {
            name: 'Estado',
            selector: row => row.dias_restantes,
            sortable: true,
            center: true,
            minWidth: '190px',
            grow: 1,
            cell: row => {
                const vencido = row.dias_restantes <= 0;
                const proximo = row.dias_restantes > 0 && row.dias_restantes <= diasAntelacion;
                const badge = vencido ? '#fee2e2' : proximo ? '#fef3c7' : '#dcfce7';
                const color = vencido ? '#991b1b' : proximo ? '#92400e' : '#166534';
                const texto = vencido
                    ? `Vencido (${Math.abs(row.dias_restantes)} dias)`
                    : proximo
                    ? `Proximo a vencer (${row.dias_restantes} dias)`
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
            minWidth: '190px',
            grow: 0.2,
            cell: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ActionButton
                        variant="outline-info"
                        size="sm"
                        tooltip="Ver vencimiento"
                        icon="bi bi-eye"
                        onClick={() => navigate (`/vencimiento-personal/${row.id}`, { state: { rutaVolver: '/vencimiento-personal' } })}
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
                                disabled={!row.persona?.activo}
                                onClick={() => navigate(`/vencimiento-personal/${row.id}/edit`, { state: { rutaVolver: '/vencimiento-personal' } })}
                            />
                            <ActionButton
                                variant="outline-success"
                                size="sm"
                                tooltip="Renovar"
                                icon="bi bi-arrow-repeat"
                                disabled={!row.persona?.activo}
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
            <Row className="p-2 align-items-center justify-content-between" >
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
            </Row>
            <AppTable columns={columns} data={filteredVencimientos} />
            <RenovarVencimientoModal
                vencimiento={vencimientoToRenovar}
                onHide={() => setVencimientoToRenovar(null)}
                onRenovado={() => mutate(`/vencimiento-personal/`)}
            />
            <HistoricoVencimientoModal
                vencimiento={vencimientoHistorico}
                onHide={() => setVencimientoHistorico(null)}
            />
        </Container>
    );
}