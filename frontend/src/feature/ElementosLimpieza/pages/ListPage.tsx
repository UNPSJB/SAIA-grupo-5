import { useMemo, useState } from "react";
import { mutate } from "swr";
import { useAuth } from "../../../hooks/useAuth";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { type TableColumn } from "react-data-table-component";

import { AppTable } from "../../../components/AppTable";
import { PageHeader } from "../../../components/PageHeader";
import { PageLoading } from "../../../components/PageLoading";
import { PageError } from "../../../components/PageError";
import { ActionButton } from "../../../components/ActionButton";
import { useApi } from "../../../hooks/useApi";

import { EstadoElementoLimpiezaModal } from "../components/DeleteElementoLimpiezaModal";
import type { ElementoLimpieza } from "../types";
import type { TipoElementoLimpieza } from "../../TiposElementoLimpieza/types";

export function ElementosLimpiezaPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [search, setSearch] = useState("");
    const [elementoToDelete, setElementoToDelete] = useState<ElementoLimpieza | null>(null);

    const { data: elementos, error, isLoading } = useApi<ElementoLimpieza[]>("/elementos-limpieza");
    const { data: tipos } = useApi<TipoElementoLimpieza[]>("/elementos-limpieza/tipos");

    const obtenerNombreTipo = (tipoId: number) => {
        return tipos?.find((tipo) => tipo.id === tipoId)?.nombre ?? "Sin tipo";
    };

    const filteredElementos = useMemo(() => {
        if (!Array.isArray(elementos)) return [];

        const busqueda = search.toLowerCase();

        return elementos.filter((elemento) => {
            const nombreTipo = obtenerNombreTipo(elemento.tipo_id);

            return (
                elemento.codigo.toLowerCase().includes(busqueda) ||
                elemento.nombre.toLowerCase().includes(busqueda) ||
                nombreTipo.toLowerCase().includes(busqueda) ||
                (elemento.material ?? "").toLowerCase().includes(busqueda) ||
                (elemento.ubicacion ?? "").toLowerCase().includes(busqueda)
            );
        })
        .sort((a, b) => a.codigo.localeCompare(b.codigo));
    }, [search, elementos, tipos]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                type="text"
                placeholder="Buscar elemento..."
                className="mr-sm-2"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
        );
    }, []);

    if (isLoading) return <PageLoading title="Elementos de Limpieza" />;

    if (!elementos || error) return (
        <PageError title="Elementos de Limpieza" message="Ocurrió un error al cargar los elementos de limpieza" />
    );

    const columns: TableColumn<ElementoLimpieza>[] = [
        {
            name: "Código",
            selector: row => row.codigo,
            sortable: true,
            center: true,
            minWidth: "110px",
        },
        {
            name: "Nombre",
            selector: row => row.nombre,
            sortable: true,
            center: true,
            grow: 2,
            minWidth: "150px",
        },
        {
            name: "Tipo",
            selector: row => obtenerNombreTipo(row.tipo_id),
            sortable: true,
            center: true,
            grow: 2,
            maxWidth: "80px",
        },
        {
            name: "Ubicación",
            selector: row => row.ubicacion ?? "-",
            sortable: true,
            center: true,
            grow: 2,
        },
        {
            name: "Dias para Recambio",
            sortable: true,
            center: true,
            minWidth: "180px",
            selector: row => row.dias_restantes ?? 999999,
            cell: row => {
                if (row.dias_restantes === null) {
                    return <span>Sin definir</span>;
                }

                if (row.dias_restantes < 0) {
                    return (
                        <div
                            style={{
                                padding: "4px 12px",
                                borderRadius: "16px",
                                background: "#fef3c7",
                                color: "#92400e",
                                fontWeight: 700,
                                whiteSpace: "nowrap",
                            }}
                        >
                            Vencido
                        </div>
                    );
                }

                if (row.dias_restantes === 0) {
                    return <span>Recambio hoy</span>;
                }
                
                if (row.dias_restantes === 1) {
                    return <span>{row.dias_restantes} dia</span>;
                }

                return <span>{row.dias_restantes} días</span>;
            },
        },
        {
            name: "Estado",
            selector: row => row.estado ? "Activo" : "Inactivo",
            sortable: true,
            center: true,
            cell: row => (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                        style={{
                            padding: "4px 12px",
                            borderRadius: "16px",
                            background: row.estado ? "#dcfce7" : "#fee2e2",
                            color: row.estado ? "#166534" : "#991b1b",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {row.estado ? "Activo" : "Inactivo"}
                    </div>
                </div>
            ),
        },
        {
            name: "Acciones",
            center: true,
            minWidth: "180px",
            cell: row => (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <ActionButton
                        variant="outline-secondary"
                        size="sm"
                        tooltip="Ver"
                        icon="bi-eye"
                        onClick={() => navigate(`/elementos-limpieza/${row.id}`)}
                    />

                    {currentUser?.administrar && (
                        <>
                            {row.estado && (
                                <>
                                    <ActionButton
                                        variant="outline-primary"
                                        size="sm"
                                        tooltip="Editar"
                                        icon="bi-pencil"
                                        onClick={() => navigate(`/elementos-limpieza/${row.id}/edit`)}
                                    />

                                    <ActionButton
                                        variant="outline-success"
                                        size="sm"
                                        tooltip="Recambio"
                                        icon="bi-arrow-repeat"
                                        onClick={() => navigate(`/recambios-elementos-limpieza/new/${row.id}`)}
                                    />
                                </>
                            )}

                            <ActionButton
                                variant={row.estado ? "outline-danger" : "outline-success"}
                                size="sm"
                                tooltip={row.estado ? "Dar de baja" : "Dar de alta"}
                                icon={row.estado ? "bi-dash-circle" : "bi-check-circle"}
                                onClick={() => setElementoToDelete(row)}
                            />
                        </>
                    )}
                </div>
            ),
        },
    ];

    return (
        <Container>
            <Row className="p-2 align-items-center">
                <Col>
                    <PageHeader title="Elementos de Limpieza" />
                </Col>

                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>

                {currentUser?.administrar && (
                    <Col xs="auto" className="d-flex justify-content-end">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate("/elementos-limpieza/new")}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            + Nuevo Elemento
                        </Button>
                    </Col>
                )} 
            </Row>

            <AppTable
                columns={columns}
                data={filteredElementos}
            />

            <EstadoElementoLimpiezaModal
                elementoLimpieza={elementoToDelete}
                onHide={() => setElementoToDelete(null)}
                onDeleted={() => mutate("/elementos-limpieza")}
            />
        </Container>
    );
}