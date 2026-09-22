import { useState } from "react";
import { Alert, Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { type TableColumn } from 'react-data-table-component';

import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { useApi } from '../../../hooks/useApi';

import type { ConsumoProducto } from "../types";

export function ConsumoAcumuladoPage() {
    const navigate = useNavigate();

    const [insumo_quimico_id, setInsumoQuimicoId] = useState("");
    const { data: insumos } = useApi('/insumos/');
    const [insumo_consultado_id, setInsumoConsultadoId] = useState<string | null>(null);
    const { data: consumos, error, isLoading } = useApi<ConsumoProducto[]>(insumo_consultado_id
        ? `/consumos_productos/insumo/${insumo_consultado_id}`: null)
    const { data: acumulado } = useApi<number>(insumo_consultado_id
        ? `/consumos_productos/insumo/${insumo_consultado_id}/acumulado`: null)
    const [fecha_desde, setFechaDesde] = useState("");
    const [fecha_hasta, setFechaHasta] = useState("");

    if (isLoading) return (
        <>
            <PageHeader title="Consulta de Consumo Acumulado por Producto" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </>
    )
    if (error) return (
        <Container>
            <PageHeader title="Consulta de Consumo Acumulado por Producto" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar los Consumos</Alert>
                </Col>
            </Row>
        </Container>
    )
    if (!insumos) return (
        <Container>
            <PageHeader title="Consulta de Consumo Acumulado por Producto" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar los Insumos</Alert>
                </Col>
            </Row>
        </Container>
    )

    const columns: TableColumn<ConsumoProducto>[] = [
        {
            name: "ID",
            selector: row => row.id,
            sortable: true,
            center: true,
            maxWidth: "60px",
        },
        {
            name: "Fecha",
            //selector: row => row.tarea.fecha,
            sortable: true,
            center: true,
            grow: 1,
        },
        {
            name: "Tarea",
            selector: row => row.tarea_id,
            sortable: true,
            center: true,
            grow: 3,
        },
        {
            name: "Cantidad",
            selector: row => row.cantidad_aproximada,
            sortable: true,
            center: true,
            grow: 1,

            cell: row => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span>
                        {row.cantidad_aproximada}
                    </span>

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
                        }}      // Se modifico para poder poner las unidades de medida con los nombres completos y que se vean bien
                    >
                        {row.unidad_medida}
                    </div>
                </div>
            ),
        },
    ];

    return (
        <Container>
            <Row className="p-2 align-items-center">
                <Col>
                    <PageHeader title="Consulta de Consumo Acumulado por Producto" />
                </Col>
            </Row>
            <Row className="p-2 align-items-center">
                <Col xs={6}>
                    <Form.Group className="mb-3 text-start">
                        <Form.Label className="p-1 fw-bold">Insumo Químico</Form.Label>
                        <Form.Select
                            required
                            value={insumo_quimico_id}
                            onChange={(e) => setInsumoQuimicoId(e.target.value)}
                            >
                            <option value="">
                                Seleccione un insumo
                            </option>
                            {insumos?.map((insumo) => (
                                <option key={insumo.id} value={insumo.id}>
                                    {insumo.nombre}
                                </option>
                            ))}
                        </Form.Select>

                    </Form.Group>
                </Col>
                <Col xs="auto">
                    <Button className="ms-2" variant="primary" onClick={() => setInsumoConsultadoId(insumo_quimico_id)} disabled={!insumo_quimico_id}>
                        <i className="bi bi-search me-1"></i> Consultar
                    </Button>
                </Col>
                <Col xs="auto" className="ms-auto">
                    <Button className="ms-2" variant="secondary" onClick={() => navigate("/consumos_productos")}>
                        <i className="bi bi-list-ul me-1"></i> Ver todos los consumos
                    </Button>
                </Col>
                <Col xs={3}>
                    <Form.Group className="mb-3 text-start">
                        <Form.Label className="p-1 fw-bold">Fecha desde: </Form.Label>
                        <Form.Control
                            type="date"
                            value={fecha_desde}
                            onChange={(e) => setFechaDesde(e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col xs={3}>
                    <Form.Group className="mb-3 text-start">
                        <Form.Label className="p-1 fw-bold">Fecha hasta: </Form.Label>
                        <Form.Control
                            type="date"
                            value={fecha_hasta} 
                            onChange={(e) => setFechaHasta(e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>
            {consumos && consumos.length === 0 && (
                <Alert variant="danger"> El insumo seleccionado no tiene consumos registrados.</Alert>
            )}
            {consumos && consumos.length > 0 && (
                <AppTable columns={columns} data={consumos} />
            )}
            {consumos && consumos.length > 0 && acumulado !== undefined && (
                <Alert variant="secondary" className="mt-3">
                    <strong>Consumo acumulado:</strong> {acumulado}
                </Alert>
            )}
        </Container>
    );
    
}
