import { useState, useMemo } from "react";
import { mutate } from 'swr';
import { Alert, Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { type TableColumn } from 'react-data-table-component';

import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { useApi } from '../../../hooks/useApi';

import { DeleteSuperficieModal } from '../components/DeleteSuperficieModal';
import { VerSectoresModal } from '../components/VerSectoresModal';
import { VerPlanesLimpiezaModal } from '../components/VerPlanesLimpiezaModal';
import type { Superficie } from "../types";

export function SuperficiesPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const { data: superficies, error, isLoading } = useApi<Superficie[]>("/superficies/")
    const [superficieToDelete, setSuperficieToDelete] = useState<Superficie | null>(null);
    const [superficieSectores, setSuperficieSectores] = useState<Superficie | null>(null);
    const [superficiePlanes, setSuperficiePlanes] = useState<Superficie | null>(null);

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

    if (isLoading) return (
        <>
            <PageHeader title="Listado de Superficies" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </>
    )
    if (!superficies || error) return (
        <Container>
            <PageHeader title="Listado de Superficies" />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar las Superficies</Alert>
                </Col>
            </Row>
        </Container>
    )

    const columns: TableColumn<Superficie>[] = [
        {
            name: "Nombre",
            selector: row => row.nombre,
            sortable: true,
            minWidth: '260px',
            grow: 3,
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
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setSuperficieSectores(row)}
                >
                    <i className="bi bi-eye me-1"></i>Ver sectores
                </Button>
            ),
        },
        {
            name: "Planes de Limpieza",
            center: true,
            cell: row => (
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setSuperficiePlanes(row)}
                >
                    <i className="bi bi-eye me-1"></i>Ver planes
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
        {
            name: "Acciones",
            center: true,
            minWidth: "220px",
            cell: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/superficies/${row.id}/edit`)}
                    >
                        <i className="bi bi-pencil me-1"></i>Editar
                    </Button>
                    {row.activo && (
                        <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => setSuperficieToDelete(row)}
                        >
                            <i className="bi bi-trash3 me-1"></i>Eliminar
                        </Button>
                    )}
                </div>
            )
        },
    ];

    return (
        <Container>
            <Row className="p-2 align-items-center">
                <Col>
                    <PageHeader title="Listado de Superficies" />
                </Col>
                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>
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
            <VerPlanesLimpiezaModal
                superficie={superficiePlanes}
                onHide={() => setSuperficiePlanes(null)}
            />
        </Container>
    );
}
