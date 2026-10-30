import React, { useState, useMemo } from 'react';
import { mutate } from 'swr';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { type TableColumn } from 'react-data-table-component';

import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { PageLoading } from '../../../components/PageLoading';
import { PageError } from '../../../components/PageError';
import { ActionButton } from '../../../components/ActionButton';
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
                data-tour="buscador-sectores"
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

    if (isLoading) return <PageLoading title="Listado de Sectores" />;
    if (!sectores || error) return (
        <PageError title="Listado de Sectores" message="Ocurrió un error al cargar Sectores" />
    );

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
                    data-tour="btn-ver-equipos-sector"
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
                    data-tour="btn-ver-superficies-sector"
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
                        data-tour="estado-sector"
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
                        <span data-tour="btn-editar-sector">
                            <ActionButton
                                variant="outline-primary"
                                size="sm"
                                tooltip="Editar"
                                icon="bi-pencil"
                                disabled={!row.activo}
                                onClick={() => navigate(`/sectores/${row.id}/edit`)}
                            />
                        </span>
                        <span data-tour="btn-baja-sector">
                            {row.activo ? (
                                <ActionButton
                                    variant="outline-danger"
                                    size="sm"
                                    tooltip="Dar de baja"
                                    icon="bi-dash-circle"
                                    onClick={() => setSectorToDelete(row)}
                                />
                            ) : (
                                <ActionButton
                                    variant="outline-success"
                                    size="sm"
                                    tooltip="Dar de alta"
                                    icon="bi-check-circle"
                                    onClick={() => cambiarEstado(row)}
                                />
                            )}
                        </span>
                    </div>
                )
            }
        ]
        : baseColumns;

    return (
        <Container>
            <Row className="p-2 align-items-center">
                <Col>
                    <PageHeader
                        eyebrow="DATOS MAESTROS"
                        title="Listado de Sectores"
                        subtitle="Revisá el listado de Sectores creados hasta la fecha."
                    />
                </Col>
                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>
                {currentUser?.administrar && (
                    <Col xs="auto" className="d-flex justify-content-end">
                        <Button
                            data-tour="btn-nuevo-sector"
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
            <div data-tour="tabla-sectores">
                <AppTable columns={columns} data={filteredSectores} />
            </div>
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
