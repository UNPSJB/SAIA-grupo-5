import  { useState, useMemo, useEffect } from 'react';
import { mutate } from 'swr';
import { Alert, Button, ButtonGroup, Col, Container, Dropdown, Form, Row, Spinner } from 'react-bootstrap';
import { type TableColumn } from 'react-data-table-component';

import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks';


import type { TareaOcurrencia } from '../../TareasOcurrencias/types';

import { TareaMovil } from '../components/TareaMovil';
import { CompletarTareaModal } from '../../TareasOcurrencias/components/CompletarTareaModal';



function fechaHoy(): string {  // Esta cuenta tira la fecha real, toISOString a la noche me daba el dia siguiente
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${hoy.getFullYear()}-${mes}-${dia}`;
}

export function ListPage() {
    const { currentUser } = useAuth();

    const [search, setSearch] = useState('');
    const { data: tareas, error, isLoading } = useApi<TareaOcurrencia[]>("/tareas-ocurrencia/")
    const [filtroPlan, setFiltroPlan] = useState('');

    const [tareaSeleccionada, setTareaSeleccionada] = useState<TareaOcurrencia | null>(null);

    const planesDisponibles = useMemo(() => {
        if (!Array.isArray(tareas)) return [];
        const planesUnicos = new Set(tareas.map(t => t.plan_nombre_snap));
        return Array.from(planesUnicos);
    }, [tareas]);
    //Cada 30 segundos el checklist se actualiza solo
    useEffect(() => {
        const intervalo = setInterval(() => mutate("/tareas-ocurrencia/"), 30000);
        return () => clearInterval(intervalo);
    }, []);


    const filteredTareas = useMemo(() => {
        if (!Array.isArray(tareas)) return [];
        const hoy = fechaHoy();
        return tareas.filter((tarea) => {
            const coincideFecha = tarea.fecha === hoy;
            const coincideBusqueda = 
                tarea.tarea_nombre_snap.toLowerCase().includes(search.toLowerCase()) ||
                tarea.plan_nombre_snap.toLowerCase().includes(search.toLowerCase());
            
            const coincidePlan = filtroPlan === '' || tarea.plan_nombre_snap === filtroPlan;

            return coincideFecha && coincideBusqueda && coincidePlan;
        });
    }, [search, tareas, filtroPlan]); 
    const subHeaderComponentMemo = useMemo(() => {
        return (
            <div className="d-flex gap-2 w-100">
                <Dropdown as={ButtonGroup} className="w-50" style={{ minWidth: 0 }}>
                    <Button 
                        variant="outline-secondary" 
                        onClick={() => setFiltroPlan('')}
                        className="text-truncate text-start"
                    >
                        {filtroPlan ? filtroPlan : 'Filtrar por plan'}
                    </Button>
                    <Dropdown.Toggle split variant="outline-secondary" id="dropdown-filtro-planes" />
                    
                    <Dropdown.Menu>
                        <Dropdown.Item 
                            active={filtroPlan === ''} 
                            onClick={() => setFiltroPlan('')}
                        >
                            Todos los planes
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        {planesDisponibles.map(plan => (
                            <Dropdown.Item 
                                key={plan} 
                                active={filtroPlan === plan} 
                                onClick={() => setFiltroPlan(plan)}
                            >
                                {plan}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>

                <Form.Control
                    type="text"
                    placeholder="Buscar tarea..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-50"

                />
            </div>
        );
    }, [search, planesDisponibles, filtroPlan]);

    const abrirModal = (tarea: TareaOcurrencia) => {
        setTareaSeleccionada(tarea);
    }

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
                            textDecoration: row.estado === 'Completada' ? 'line-through' : 'none',
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
            selector: row => row.estado === 'Completada' ? 'Realizada' : 'Pendiente',
            sortable: true,
            center: true,
            cell: row => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                        style={{
                            padding: '4px 12px',
                            borderRadius: '16px',
                            background: row.estado === 'Completada' ? '#dcfce7' : '#fef9c3',
                            color: row.estado === 'Completada' ? '#166534' : '#854d0e',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {row.estado === 'Completada' ? 'Realizada' : 'Pendiente'}
                    </div>
                </div>
            )
        },
        
        {
            name: "Acciones",
            center: true,
            minWidth: '180px',
            cell: row => {
                const estaCompletada = row.estado === 'Completada';
                const laHizoOtro = estaCompletada && row.operario_id !== currentUser?.id;
                return(
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Button
                        variant={estaCompletada ? "outline-info" : "outline-success"}
                        size="sm"
                        disabled={laHizoOtro}
                        title={laHizoOtro ? "Completada por otro usuario" : ""}
                        onClick={() => abrirModal(row)}
                    >
                        {estaCompletada ? (
                            <><i className="bi bi-pencil me-1"></i>Editar</>) : (<><i className="bi bi-check2-circle me-1"></i>Marcar realizada</>)
                        }   
                    </Button>
                    </div>
                )
            },
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
                    <TareaMovil key={tarea.id} tarea={tarea} onCompletar={abrirModal} />
                ))}
                {filteredTareas.length === 0 && <p className="text-muted text-center p-4">No se encontraron resultados.</p>}
            </div>
                <CompletarTareaModal
                    tarea={tareaSeleccionada}
                    onHide={() => setTareaSeleccionada(null)}
                    onCompleted={() => {
                        mutate("/tareas-ocurrencia/");
                    }}
                />
            
        </Container>
    );
}