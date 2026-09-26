import { useState } from "react";
import { Alert, Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { type TableColumn } from 'react-data-table-component';

import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { useApi } from '../../../hooks/useApi';
import type { ConsumoAcumuladoProducto } from "../types";

export function ConsumoAcumuladoPage() {
    const navigate = useNavigate();
 
    const [fecha_desde, setFechaDesde] = useState("");
    const [fecha_hasta, setFechaHasta] = useState("");
    const [fecha_desde_consultada, setFechaDesdeConsultada] = useState("");     
    const [fecha_hasta_consultada, setFechaHastaConsultada] = useState("");    

    const { data: consumos, error, isLoading } = useApi<ConsumoAcumuladoProducto[]>( 
        fecha_desde_consultada || fecha_hasta_consultada
        ? `/consumos-productos/acumulado?` + 
        `${fecha_desde_consultada ? `fecha_desde=${fecha_desde_consultada}` : ""}` +
        `${fecha_hasta_consultada ? `${fecha_desde_consultada ? "&" : ""}fecha_hasta=${fecha_hasta_consultada}` : ""}`
        : null
    ); 

    if (isLoading) return (
        <>
            <PageHeader title="Consulta de Consumo Acumulado por Producto Quimico" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </>
    )
    if (error) return (
        <Container>
            <PageHeader title="Consulta de Consumo Acumulado por Producto Quimico" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar los Consumos</Alert>
                </Col>
            </Row>
        </Container>
    )

    const columns: TableColumn<ConsumoAcumuladoProducto>[] = [
        {
            name: "Insumo Químico",
            selector: row => row.nombre,
            sortable: true,
            center: true,
            grow: 2,
        },
        {
            name: "Consumo acumulado",
            selector: row => row.acumulado,
            sortable: true,
            center: true,
            grow: 1,

            cell: row => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span>
                        {row.acumulado}
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
                        }}     
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
                    <PageHeader title="Consulta de Consumo Acumulado por Producto Quimico" />
                </Col>
            </Row>
            <Row className="p-2 align-items-end">
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
                <Col xs="auto">
                    <Button className="ms-2" variant="primary" 
                        onClick={() => {setFechaDesdeConsultada(fecha_desde); setFechaHastaConsultada(fecha_hasta); }}
                    >
                        <i className="bi bi-search me-1"></i> Consultar
                    </Button>
                </Col>
            </Row>

            {consumos && consumos.length === 0 && (
                <Alert variant="danger"> No hay consumos registrados para el periodo seleccionado.</Alert>
            )}
            {consumos && consumos.length > 0 && (
                <AppTable columns={columns} data={consumos} />
            )}
        </Container>
    );
}