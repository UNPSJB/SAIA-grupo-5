import { useState } from "react";
import { mutate } from 'swr';
import { Alert, Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { type TableColumn } from 'react-data-table-component';

import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { useApi } from '../../../hooks/useApi';

import type { ConsumoProducto } from "../types";

export function ConsumoAcumuladoPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const { data: consumos, error, isLoading } = useApi<ConsumoProducto[]>("/consumos_productos")
    const [insumo_id, setInsumoId] = useState("");
    const { data: insumos } = useApi('/insumos/');
    const [validated, setValidated] = useState(false);
    
    if (isLoading) return (
        <>
            <PageHeader title="Consulta de Consumo Acumulado por Producto" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </>
    )
    if (!consumos || error) return (
        <Container>
            <PageHeader title="Consulta de Consumo Acumulado por Producto" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar los Consumos</Alert>
                </Col>
            </Row>
        </Container>
    )

    const columns: TableColumn<ConsumoProducto>[] = [

    ];

    return (
        <Container>
            <Row className="p-2" align-items-center>
                <Col>
                    <PageHeader title="Consulta de Consumo Acumulado por Producto" />
                </Col>
            </Row>
            <Row className="p-2 align-items-center">
                <Col md={6}>
                    <Form.Group className="mb-3 text-start">
                        <Form.Label className="p-1 fw-bold">Insumo Químico</Form.Label>
                        <Form.Select
                        required
                        value={insumo_id}
                        onChange={(e) => setInsumoQuimicoId(e.target.value)}
                        isInvalid={validated && !insumo_id}
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

                        <Form.Control.Feedback type="invalid">
                            Debe seleccionar un insumo.
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                <Col xs="auto">
                    <Button
                        variant="primary"
                        onClick={() => navigate(`/consumos_productos/insumo/${insumo_id}/acumulado`)}
                        disabled={!insumo_id}
                    >
                        Consultar
                    </Button>
                </Col>
            </Row>
        </Container>
    );
    
}
