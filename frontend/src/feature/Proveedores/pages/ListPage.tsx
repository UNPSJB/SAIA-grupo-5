import React, { useState, useMemo } from 'react';
import { mutate } from 'swr';
import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { type TableColumn } from 'react-data-table-component';
import { ActionButton } from '../../../components/ActionButton';
import { AppTable } from '../../../components/AppTable';
import { PageHeader } from '../../../components/PageHeader';
import { useApi, useAuth } from '../../../hooks';
import { ListFilter } from "../../../components/ListFilter";
import { DeleteProveedorModal } from '../components/DeleteProveedorModel';
import { RenovarHabilitacionProveedorModal } from '../components/RenovarHabilitacionProveedorModal';
import type { Proveedor } from '../types';
import { PageLoading } from '../../../components/PageLoading';

type EstadoFiltro = "todos" | "activo" | "inactivo";

const ESTADO_FILTRO_LABELS: Record<EstadoFiltro, string> = {
    todos: "Todos",
    activo: "Activos",
    inactivo: "Inactivos",
};

const formatearFechaAR = (fechaStr: string | null | undefined): string => {
    if (!fechaStr) return "";
    const partes = fechaStr.split("-"); 
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`; 
    }
    return fechaStr;
};

export function ListPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [search, setSearch] = useState('');
    const { data: proveedores, error, isLoading } = useApi<Proveedor[]>("/proveedores/");
    const [proveedorToDelete, setProveedorToDelete] = useState<Proveedor | null>(null);
    const [proveedorToRenovar, setProveedorToRenovar] = useState<Proveedor | null>(null);
    const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>("todos");

    const filteredProveedores = useMemo(() => {
        if (!Array.isArray(proveedores)) return [];

        return proveedores.filter((prov) => {
            const coincideBusqueda =
                prov.nombre.toLowerCase().includes(search.toLowerCase()) ||
                prov.cuit.includes(search);

            const coincideEstado =
                estadoFiltro === "todos" ||
                (estadoFiltro === "activo" && prov.activo) ||
                (estadoFiltro === "inactivo" && !prov.activo);

            return coincideBusqueda && coincideEstado;
        });
    }, [search, estadoFiltro, proveedores]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                type="text"
                placeholder="Buscar por nombre o CUIT..."
                className="mr-sm-2"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
        );
    }, []);

    const titulo = "Listado de Proveedores"

    if (isLoading) return <PageLoading title={titulo} />

    if (!proveedores || error) return (
        <Container>
            <PageHeader title={titulo} />
            <Row className="justify-content-center">
                <Col md={6}>
                    <Alert variant="danger">Ocurrió un error al cargar Proveedores</Alert>
                </Col>
            </Row>
        </Container>
    );

    const DIAS_AVISO_VENCIMIENTO = 30;

    const columns: TableColumn<Proveedor>[] = [
        {
            name: 'Razon Social / Nombre',
            selector: row => row.nombre,
            sortable: true,
            center: true,
            minWidth: '201px',
        },
        {
            name: 'CUIT',
            selector: row => row.cuit,
            sortable: true,
            center: true,
            minWidth: '130px',
        },
        {
            name: 'N° Habilitacion',
            selector: row => row.numero_habilitacion || '',
            sortable: true,
            center: true,
            minWidth: '150px',
            cell: row => (
                <span className={row.numero_habilitacion ? "fw-semibold" : "text-muted fst-italic"}>
                    {row.numero_habilitacion || "Sin registrar"}
                </span>
            ),
        },
        {
            name: 'Fecha Vencimiento',
            selector: row => row.vencimiento_habilitacion ? row.vencimiento_habilitacion.split("-").reverse().join("/") : '',
            sortable: true,
            center: true,
            minWidth: '172px',
            cell: row => (
                <span>
                    {row.vencimiento_habilitacion 
                        ? row.vencimiento_habilitacion.split("-").reverse().join("/") 
                        : <span className="text-muted fst-italic">Sin fecha</span>
                    }
                </span>
            ),
        },
        {
            name: 'Estado Habilitación',
            center: true,
            minWidth: '210px',
            cell: row => {
                if (!row.vencimiento_habilitacion) {
                    return <span className="text-muted fst-italic">Sin habilitacion</span>;
                }

                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);
                const [anio, mes, dia] = row.vencimiento_habilitacion.split("-").map(Number);
                const fechaVenc = new Date(anio, mes - 1, dia);
                const diasRestantes = Math.round((fechaVenc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

                const vencido = diasRestantes <= 0;
                const proximo = diasRestantes > 0 && diasRestantes <= DIAS_AVISO_VENCIMIENTO;
                const badge = vencido ? '#fee2e2' : proximo ? '#fef3c7' : '#dcfce7';
                const color = vencido ? '#991b1b' : proximo ? '#92400e' : '#166534';
                const texto = vencido
                    ? `Vencida (${Math.abs(diasRestantes)} días)`
                    : proximo
                    ? `Proxima a vencer (${diasRestantes} días)`
                    : `Vigente (${diasRestantes} días)`;

                return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div
                            style={{
                                padding: '4px 12px',
                                borderRadius: '16px',
                                background: badge,
                                color: color,
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {texto}
                        </div>
                    </div>
                );
            },
        },
        {
            name: 'Estado',
            selector: row => row.activo ? 'Activo' : 'Inactivo',
            sortable: true,
            center: true,
            minWidth: '100px',
            cell: row => (
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
            ),
        },
        {
            name: "Acciones",
            center: true,
            minWidth: '190px',
            cell: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ActionButton
                        variant="outline-info"
                        size="sm"
                        tooltip="Ver Detalle"
                        icon="bi bi-eye"
                        onClick={() => navigate(`/proveedores/${row.id}`)}
                    />

                    {currentUser?.administrar && (
                        <>
                            <ActionButton
                                variant="outline-primary"
                                size="sm"
                                tooltip="Editar Datos"
                                icon="bi bi-pencil"
                                disabled={!row.activo}
                                onClick={() => navigate(`/proveedores/${row.id}/edit`)}
                            />
                            <ActionButton
                                variant="outline-success"
                                size="sm"
                                tooltip="Cargar / Renovar Habilitación"
                                icon="bi bi-arrow-repeat"
                                disabled={!row.activo}
                                onClick={() => setProveedorToRenovar(row)}
                            />
                            <ActionButton
                                variant={row.activo ? 'outline-danger' : 'outline-success'}
                                size="sm"
                                tooltip={row.activo ? 'Dar de baja' : 'Dar de alta'}
                                icon={row.activo ? 'bi-dash-circle' : 'bi-check-circle'}
                                onClick={() => setProveedorToDelete(row)}
                            />
                        </>
                    )}
                </div>
            )
        },
    ];

    return (
        <Container>
            <Row className="p-2 align-items-center">
                <Col>
                    <PageHeader
                        eyebrow="ABASTECIMIENTO"
                        title={titulo}
                        subtitle="Revisa el listado de proveedores y actualiza sus certificados de habilitacion."
                    />
                </Col>
                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>
                <Col xs="auto" className="align-self-center">
                    <ListFilter
                        value={estadoFiltro}
                        options={ESTADO_FILTRO_LABELS}
                        onChange={(value) => setEstadoFiltro(value as EstadoFiltro)}
                    />
                </Col>
                {currentUser?.administrar && (
                    <Col xs="auto" className="d-flex justify-content-end">
                        <Button
                            variant="primary"
                            size='sm'
                            onClick={() => navigate("/proveedores/new")}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            + Nuevo Proveedor
                        </Button>
                    </Col>
                )}
            </Row>

            <div>
                <AppTable columns={columns} data={filteredProveedores} />
            </div>

            <DeleteProveedorModal
                proveedor={proveedorToDelete}
                onHide={() => setProveedorToDelete(null)}
                onDeleted={() => mutate("/proveedores/")}
            />

            <RenovarHabilitacionProveedorModal
                proveedor={proveedorToRenovar}
                onHide={() => setProveedorToRenovar(null)}
                onRenovado={() => mutate("/proveedores/")}
            />
        </Container>
    );
}