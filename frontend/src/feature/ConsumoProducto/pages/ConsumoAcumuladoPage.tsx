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
    const [fecha_desde, setFechaDesde] = useState("");
    const [fecha_hasta, setFechaHasta] = useState("");
    const [fecha_desde_consultada, setFechaDesdeConsultada] = useState("");
    const [fecha_hasta_consultada, setFechaHastaConsultada] = useState("");

    const { data: insumos } = useApi('/insumos-quimicos/');
    const [insumo_consultado_id, setInsumoConsultadoId] = useState<string | null>(null);
    const { data: consumos, error, isLoading } = useApi<ConsumoProducto[]>(insumo_consultado_id
        ? `/consumos-productos/insumo/${insumo_consultado_id}`: null);
    const { data: acumulado } = useApi<number>(insumo_consultado_id
        ? `/consumos-productos/insumo/${insumo_consultado_id}/acumulado` + 
        `${fecha_desde_consultada ? `?fecha_desde=${fecha_desde_consultada}` : ""}` +
        `${fecha_hasta_consultada ? `${fecha_desde_consultada ? "&" : "?"}fecha_hasta=${fecha_hasta_consultada}` : ""}`
        : null);

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
                    <Button className="ms-2" variant="primary" 
                        onClick={() => {setInsumoConsultadoId(insumo_quimico_id); 
                            setFechaDesdeConsultada(fecha_desde); setFechaHastaConsultada(fecha_hasta);
                        }}
                        disabled={!insumo_quimico_id}>
                        <i className="bi bi-search me-1"></i> Consultar
                    </Button>
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
            </Row>

            {consumos && consumos.length === 0 && (
                <Alert variant="danger"> El insumo seleccionado no tiene consumos registrados.</Alert>
            )}
            {consumos && consumos.length > 0 && acumulado !== undefined && (
                <Alert variant="primary" className="mt-3">
                    <strong>Consumo acumulado:</strong> {acumulado} {consumos[0].unidad_medida}
                </Alert>
            )}
        </Container>
    );
    
}




