import React, { useState, useMemo, useEffect } from 'react';
import { mutate } from 'swr';
import { Alert, Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { type TableColumn } from 'react-data-table-component';

import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { useApi } from '../../../hooks/useApi';
import { api } from '../../../libs/axios';

import { EstadoTareaOcurrencia } from '../types';
import type { TareaOcurrencia } from '../types';

import { TareaMovil } from '../components/TareaMovil';


const OPERARIO_ID = 1;      // TODO: esta momentaneo hasta implementar login

function fechaHoy(): string {  // Esta cuenta tira la fecha real, toISOString a la noche me daba el dia siguiente
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${hoy.getFullYear()}-${mes}-${dia}`;
}

export function ListPage() {
    const [search, setSearch] = useState('');
    const { data: tareas, error, isLoading } = useApi<TareaOcurrencia[]>("/tareas-ocurrencia/")

    //Cada 30 segundos el checklist se actualiza solo
    useEffect(() => {
        const intervalo = setInterval(() => mutate("/tareas-ocurrencia/"), 30000);
        return () => clearInterval(intervalo);
    }, []);


    const filteredTareas = useMemo(() => {
        if (!Array.isArray(tareas)) return [];
        const hoy = fechaHoy();
        return tareas.filter((tarea) => {
            return (
                tarea.fecha === hoy && (
                    tarea.tarea_nombre_snap.toLowerCase().includes(search.toLowerCase()) ||
                    tarea.plan_nombre_snap.toLowerCase().includes(search.toLowerCase())
                )
            );
        });
    }, [search, tareas]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                type="text"
                placeholder="Buscar tarea..."
                className=" mr-sm-2"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
        );
    }, [search]);

    const completarTarea = async (tarea: TareaOcurrencia) => {
        try {
            await api.put(`/tareas-ocurrencia/${tarea.id}/completar`, { operario_id: OPERARIO_ID });
            await mutate("/tareas-ocurrencia/");
        } catch (error: any) { 
            if (error.response && error.response.data && error.response.data.detail) {
                alert(error.response.data.detail);
            } else {
                alert("No se pudo completar la tarea."); 
            }

            console.log(error)
        }
    };

    if (isLoading) return (
        <>
            <PageHeader title="Checklist de limpieza" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </>
    )
    if (!tareas || error) return (
        <Container>
            <PageHeader title="Checklist de limpieza" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar el checklist</Alert>
                </Col>
            </Row>
        </Container>
    )

    const columns: TableColumn<TareaOcurrencia>[] = [
        {
            name: 'Tarea',
            selector: row => row.tarea_nombre_snap,
            sortable: true,
            center: true,
            wrap: true,
            minWidth: '240px',
            grow: 3,
            cell: row => (
                <div style={{ padding: '8px 0', minWidth: 0, maxWidth: '100%', overflowWrap: 'anywhere' }}>
                    <div
                        style={{
                            fontWeight: 600,
                            textDecoration: row.estado === EstadoTareaOcurrencia.COMPLETADA ? 'line-through' : 'none',
                        }}
                    >
                        {row.tarea_nombre_snap}
                    </div>
                    {row.tarea_descripcion_snap && (
                        <div className="text-muted small">{row.tarea_descripcion_snap}</div>
                    )}
                </div>
            ),
        },
        {
            name: 'Plan',
            selector: row => row.plan_nombre_snap,
            sortable: true,
            center: true,
            minWidth: '140px',
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
                            textAlign: 'center',
                        }}
                    >
                        {row.plan_nombre_snap}
                    </div>
                </div>
            ),
        },
        {
            name: 'Estado',
            selector: row => row.estado === EstadoTareaOcurrencia.COMPLETADA ? 'Realizada' : 'Pendiente',
            sortable: true,
            center: true,
            cell: row => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                        style={{
                            padding: '4px 12px',
                            borderRadius: '16px',
                            background: row.estado === EstadoTareaOcurrencia.COMPLETADA ? '#dcfce7' : '#fef9c3',
                            color: row.estado === EstadoTareaOcurrencia.COMPLETADA ? '#166534' : '#854d0e',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {row.estado === EstadoTareaOcurrencia.COMPLETADA ? 'Realizada' : 'Pendiente'}
                    </div>
                </div>
            )
        },
        {
            name: "Acciones",
            center: true,
            minWidth: '180px',
            cell: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {(row.estado === EstadoTareaOcurrencia.PENDIENTE &&
                        <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => completarTarea(row)}
                        >
                            <i className="bi bi-check2-circle me-1"></i>Marcar realizada
                        </Button>
                    )}
                </div>
            )
        },
    ];

    // Fecha para mostrar
    const fechaLarga = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
        <Container>
            <Row className="p-2 align-items-center">
                <Col>    
                    <PageHeader title={`Checklist de limpieza - ${fechaLarga}`} />               
                </Col>
                <Col 
                    xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>
            </Row>
            <div className="d-none d-lg-block">  {/*Si es tamaño lg muestra como bloque */}
                <AppTable columns={columns} data={filteredTareas} />
            </div>
            <div className="d-lg-none">    {/*Si no es tamaño lg muestra la version movil */}
                {filteredTareas.map((tarea) => (
                    <TareaMovil key={tarea.id} tarea={tarea} onCompletar={completarTarea} />
                ))}
                {filteredTareas.length === 0 && <p className="text-muted text-center p-4">No se encontraron resultados.</p>}
            </div>
        </Container>
    );
}