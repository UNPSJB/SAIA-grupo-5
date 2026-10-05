import { useState, useMemo } from "react";
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

import { DeleteSuperficieModal } from '../components/DeleteSuperficieModal';
import { VerSectoresModal } from '../components/VerSectoresModal';
import type { Superficie } from "../types";

export function SuperficiesPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [search, setSearch] = useState('');
    const { data: superficies, error, isLoading } = useApi<Superficie[]>("/superficies/")
    const [superficieToDelete, setSuperficieToDelete] = useState<Superficie | null>(null);
    const [superficieSectores, setSuperficieSectores] = useState<Superficie | null>(null);

    const filteredSuperficies = useMemo(() => {
        if (!Array.isArray(superficies)) return [];
        return (superficies ?? []).filter((superficie) => {
            return (
                superficie.nombre.toLowerCase().includes(search.toLowerCase()) ||
                superficie.tipo_contacto.toLowerCase().includes(search.toLowerCase())
            );
        });
    }, [search, superficies]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                type="text"
                placeholder="Buscar superficie..."
                className=" mr-sm-2"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
        );
    }, [search]);

    const cambiarEstado = async (superficie: Superficie) => {
        try {
            await api.put(`/superficies/${superficie.id}/estado`);
            await mutate("/superficies/");
        } catch (err: any) {
            const detail = err.response?.data?.detail || `No se pudo ${superficie.activo ? 'dar de baja' : 'dar de alta'} la superficie.`;
            alert(detail);
            console.log(err);
        }
    };

    if (isLoading) return <PageLoading title="Listado de Superficies" />;
    if (!superficies || error) return (
        <PageError title="Listado de Superficies" message="Ocurrió un error al cargar las Superficies" />
    );

    const baseColumns: TableColumn<Superficie>[] = [
        {
            name: "Nombre",
            selector: row => row.nombre,
            sortable: true,
            center: true,
            minWidth: '260px',
            grow: 2,
        },
        {
            name: "Tipo de Contacto",
            selector: row => row.tipo_contacto,
            sortable: true,
            center: true,
            maxWidth: '200px',
            grow: 2,
        },
        {
            name: "Sectores",
            center: true,
            cell: row => (
                <Button
                    variant="outline-info"
                    size="sm"
                    onClick={() => setSuperficieSectores(row)}
                >
                    <i className="bi bi-eye me-1"></i>Ver sectores
                </Button>
            ),
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

    const columns: TableColumn<Superficie>[] = currentUser?.administrar
        ? [
            ...baseColumns,
            {
                name: "Acciones",
                center: true,
                minWidth: "220px",
                cell: (row) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <ActionButton
                            variant="outline-primary"
                            size="sm"
                            tooltip="Editar"
                            icon="bi-pencil"
                            disabled={!row.activo}
                            onClick={() => navigate(`/superficies/${row.id}/edit`)}
                        />
                        {row.activo ? (
                            <ActionButton
                                variant="outline-danger"
                                size="sm"
                                tooltip="Dar de baja"
                                icon="bi-dash-circle"
                                onClick={() => setSuperficieToDelete(row)}
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
                    </div>
                )
            }
        ]
        : baseColumns;

    return (
        <Container>
            <Row className="p-2 align-items-center">
                <Col>
                    <PageHeader title="Listado de Superficies" />
                </Col>
                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>
                {currentUser?.administrar && (
                    <Col xs="auto" className="d-flex justify-content-end">
                        <Button
                            variant="primary"
                            size='sm'
                            onClick={() => navigate("/superficies/new")}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            + Nueva Superficie
                        </Button>
                    </Col>
                )}
            </Row>
            <AppTable columns={columns} data={filteredSuperficies} />
            <DeleteSuperficieModal
                superficie={superficieToDelete}
                onHide={() => setSuperficieToDelete(null)}
                onDeleted={() => mutate("/superficies/")}
            />
            <VerSectoresModal
                superficie={superficieSectores}
                onHide={() => setSuperficieSectores(null)}
            />
        </Container>
    );
}
