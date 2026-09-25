import React, { useState, useMemo } from 'react';
import { mutate } from 'swr';
import { Alert, Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { type TableColumn } from 'react-data-table-component';

import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../libs/axios';

import { DeleteSectorModal } from '../components/DeleteSectorModal';
import { EquiposDeSectorModal } from '../components/EquiposDeSectorModal';
import { SuperficiesDeSectorModal } from '../components/SuperficiesDeSectorModal';
import type { Sector } from '../types';


export function ListPage() {
    const navigate = useNavigate();     // Esto se usa para cambiar de pagina cuando cree el sector
    const { currentUser } = useAuth();
    const [search, setSearch] = useState('');
    const { data: sectores, error, isLoading } = useApi<Sector[]>("/sectores/")
    const [sectorToDelete, setSectorToDelete] = useState<Sector | null>(null);
    const [sectorEquipos, setSectorEquipos] = useState<Sector | null>(null);
    const [sectorSuperficies, setSectorSuperficies] = useState<Sector | null>(null);

    const filteredSectores = useMemo(() => {
        if (!Array.isArray(sectores)) return [];     // Se agrego una validacion para preguntar si sectores es un array
        return (sectores ?? []).filter((sector) => {
            return sector.nombre.toLowerCase().includes(search.toLowerCase());
        });
    }, [search, sectores]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                type="text"
                placeholder="Buscar sector..."
                className=" mr-sm-2"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
        );
    }, [search]);

    const cambiarEstado = async (sector: Sector) => {
        try {
            await api.put(`/sectores/${sector.id}/estado`);
            await mutate("/sectores/");
        } catch (err: any) {
            const detail = err.response?.data?.detail || `No se pudo ${sector.activo ? 'dar de baja' : 'dar de alta'} el sector.`;
            alert(detail);
            console.log(err);
        }
    };

    if (isLoading) return (
        <>
            <PageHeader title="Listado de Sectores" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </>
    )
    if (!sectores || error) return (
        <Container>
            <PageHeader title="Listado de Sectores" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar Sectores</Alert>
                </Col>
            </Row>
        </Container>
    )

    const baseColumns: TableColumn<Sector>[] = [
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
            name: "Equipos",
            center: true,
            minWidth: "160px",
            cell: (row) => (
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setSectorEquipos(row)}
                >
                    <i className="bi bi-eye me-1"></i>Ver equipos
                </Button>
            )
        },
        {
            name: "Superficies",
            center: true,
            minWidth: "160px",
            cell: (row) => (
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setSectorSuperficies(row)}
                >
                    <i className="bi bi-eye me-1"></i>Ver superficies
                </Button>
            )
        },
        {
            name: 'Estado',
            selector: row => row.activo ? 'Activo' : 'Inactivo',
            sortable: true,
            center: true,
            cell: row => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                        style={{
                            padding: '4px 12px',
                            borderRadius: '16px',
                            background: row.activo ? '#dcfce7' : '#fee2e2',
                            color: row.activo ? '#166534' : '#991b1b',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {row.activo ? 'Activo' : 'Inactivo'}
                    </div>
                </div>
            )
        },
    ];

    const columns: TableColumn<Sector>[] = currentUser?.administrar
        ? [
            ...baseColumns,
            {
                name: "Acciones",
                center: true,
                minWidth: "220px",
                cell: (row) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            disabled={!row.activo}
                            onClick={() => navigate(`/sectores/${row.id}/edit`)}
                        >
                            <i className="bi bi-pencil me-1"></i>Editar
                        </Button>
                        {row.activo ? (
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => setSectorToDelete(row)}
                            >
                                <i className="bi bi-trash3 me-1"></i>Eliminar
                            </Button>
                        ) : (
                            <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => cambiarEstado(row)}
                            >
                                <i className="bi bi-person-check me-1"></i>Dar de alta
                            </Button>
                        )}
                    </div>
                )
            }
        ]
        : baseColumns;

    return (
        <Container>
            <Row className="p-2">
                <Col>
                    <PageHeader title="Listado de Sectores" />
                </Col>
                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>
                {currentUser?.administrar && (
                    <Col xs="auto" className="d-flex justify-content-end">
                        <Button
                            variant="primary"
                            size='sm'
                            onClick={() => navigate("/sectores/new")}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            + Nuevo Sector
                        </Button>
                    </Col>
                )}
            </Row>
            <AppTable columns={columns} data={filteredSectores} />
            <DeleteSectorModal
                sector={sectorToDelete}
                onHide={() => setSectorToDelete(null)}
                onDeleted={() => mutate("/sectores/")}
            />
            <EquiposDeSectorModal
                sector={sectorEquipos}
                onHide={() => setSectorEquipos(null)}
            />
            <SuperficiesDeSectorModal
                sector={sectorSuperficies}
                onHide={() => setSectorSuperficies(null)}
            />
        </Container>
    );
}
