import React, { useState, useMemo } from 'react';
import { mutate } from 'swr';
import { Alert, Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap';      // Se volo Tooltip y OverlayTrigger porque no es necesario ya que el boton de Nuevo Insumo ya es muy explicativo
import { useNavigate } from 'react-router-dom';
import { type TableColumn } from 'react-data-table-component';

import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { useApi } from '../../../hooks/useApi';

import { DeleteInsumoModal } from '../components/DeleteInsumoModal';
import type { Insumo } from '../types';


export function ListPage() {
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el insumo
    const [search, setSearch] = useState('');
    const { data: insumos, error, isLoading } = useApi<Insumo[]>("/insumos/")    
    const [insumoToDelete, setInsumoToDelete] = useState<Insumo | null>(null);

    // useMemo infiere que retorna un array de tipo Insumo[]
    const filteredInsumos = useMemo(() => {
        if (!Array.isArray(insumos)) return [];     // Se agrego una validacion para preguntar si insumos es un array
        return (insumos ?? []).filter((insumo) => {
            return (
                insumo.nombre.toLowerCase().includes(search.toLowerCase()) ||
                insumo.unidad_medida.toLowerCase().includes(search.toLowerCase())
            );
        });
    }, [search, insumos]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                type="text"
                placeholder="Buscar insumo..."
                className=" mr-sm-2"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
        );
    }, [search]);

    if (isLoading) return (
        <>
            <PageHeader title="Listado de Insumos" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </>
    )
    if (!insumos || error) return (
        <Container>
            <PageHeader title="Listado de Insumos" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar Insumos</Alert>
                </Col>
            </Row>
        </Container>
    )

    const columns: TableColumn<Insumo>[] = [
        {
            name: "ID",
            selector: row => row.id,
            sortable: true,
            center: true,
            maxWidth: '160px'
        },
        {
            name: 'Nombre',
            selector: row => row.nombre,
            sortable: true,
            center: true,
            minWidth: '200px',
            grow: 2,
        },
        {
            name: 'Unidad de medida',
            selector: row => row.unidad_medida,
            sortable: true,
            center: true,
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
                            whiteSpace: 'nowrap',
                        }}      // Se modifico para poder poner las unidades de medida con los nombres completos y que se vean bien
                    >
                        {row.unidad_medida}
                    </div>
                </div>
            ),
        },
        {
            name: "Acciones",
            center: true,       // Se agrego esto para que queden centrada las acciones
            cell: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/insumos/${row.id}/edit`)}
                    >
                        editar
                    </Button>
                    <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => setInsumoToDelete(row)}
                    >
                        eliminar
                    </Button>
                </div>
            )
        },
    ];

    return (
        <Container>
            <Row className="p-2" align-items-center>
                <Col>
                    <PageHeader title="Listado de Insumos" />
                </Col>
                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>
                <Col xs="auto" className="d-flex justify-content-end">
                    <Button
                        variant="primary"
                        size='sm'
                        onClick={() => navigate("/insumos/new")}
                        style={{ whiteSpace: "nowrap" }}
                    >
                        Nuevo Insumo +
                    </Button>
                </Col>
            </Row>
            <AppTable columns={columns} data={filteredInsumos} />
            <DeleteInsumoModal
                insumo={insumoToDelete}
                onHide={() => setInsumoToDelete(null)}
                onDeleted={() => mutate("/insumos/")}
            />
        </Container>
    );
}