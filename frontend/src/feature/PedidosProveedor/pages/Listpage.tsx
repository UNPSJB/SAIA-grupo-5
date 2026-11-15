import React, { useMemo, useState } from "react";
import { mutate } from "swr";
import { Alert, Button, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { type TableColumn } from "react-data-table-component";
import { ActionButton } from "../../../components/ActionButton";
import { AppTable } from "../../../components/AppTable";
import { PageHeader } from "../../../components/PageHeader";
import { ListFilter } from "../../../components/ListFilter";
import { PageLoading } from "../../../components/PageLoading";
import { useApi, useAuth } from "../../../hooks";
import { DeletePedidoProveedorModal } from "../components/DeletePedidoProveedorModal";
import type { PedidoProveedor } from "../types";

type EstadoFiltro = "todos" | "pendiente" | "recibido" | "inactivo";

const ESTADO_FILTRO_LABELS: Record<EstadoFiltro, string> = {
    todos: "Todos",
    pendiente: "Pendientes",
    recibido: "Recibidos",
    inactivo: "Dados de baja",
};

export function ListPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [search, setSearch] = useState("");
    const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>("todos");
    const [pedidoToDelete, setPedidoToDelete] = useState<PedidoProveedor | null>(null);

    const { data: pedidos, error, isLoading } = useApi<PedidoProveedor[]>("/pedidos-proveedor/");

    const filteredPedidos = useMemo(() => {
        if (!Array.isArray(pedidos)) return [];

        return pedidos.filter((ped) => {
            const nombreProveedor = ped.proveedor?.nombre?.toLowerCase() || "";
            const coincideBusqueda =
                nombreProveedor.includes(search.toLowerCase()) ||
                String(ped.id).includes(search.trim());

            const coincideEstado =
                estadoFiltro === "todos" ||
                (estadoFiltro === "pendiente" && ped.activo && ped.estado === "pendiente") ||
                (estadoFiltro === "recibido" && ped.activo && ped.estado === "recibido") ||
                (estadoFiltro === "inactivo" && !ped.activo);

            return coincideBusqueda && coincideEstado;
        });
    }, [search, estadoFiltro, pedidos]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                type="text"
                placeholder="Buscar por N° o proveedor..."
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
        );
    }, []);

    const titulo = "Pedidos a Proveedores";

    if (isLoading) return <PageLoading title={titulo} />;

    if (!pedidos || error) {
        return (
            <Container>
                <PageHeader title={titulo} />
                <Row className="justify-content-center">
                    <Col md={6}>
                        <Alert variant="danger">Ocurrió un error al cargar los Pedidos a Proveedores.</Alert>
                    </Col>
                </Row>
            </Container>
        );
    }

    const columns: TableColumn<PedidoProveedor>[] = [
        {
            name: "N° Pedido",
            selector: (row) => row.id,
            sortable: true,
            center: true,
            minWidth: "100px",
            cell: (row) => <span className="fw-bold">{row.id}</span>,
        },
        {
            name: "Proveedor",
            selector: (row) => row.proveedor?.nombre || "",
            sortable: true,
            center: true,
            minWidth: "180px",
        },
        {
            name: "Fecha Pedido",
            selector: (row) => row.fecha_pedido,
            sortable: true,
            center: true,
            minWidth: "120px",
            cell: (row) => <span>{row.fecha_pedido.split("-").reverse().join("/")}</span>,
        },
        {
            name: "Entrega Estimada",
            selector: (row) => row.fecha_entrega_estimada || "",
            sortable: true,
            center: true,
            minWidth: "135px",
            cell: (row) =>
                row.fecha_entrega_estimada ? (
                    <span>{row.fecha_entrega_estimada.split("-").reverse().join("/")}</span>
                ) : (
                    <span className="text-muted fst-italic">Sin fecha</span>
                ),
        },
        {
            name: "Insumos",
            center: true,
            minWidth: "100px",
            cell: (row) => (
                <span className="badge bg-light text-dark border">
                    {row.items?.length ?? 0} {row.items?.length === 1 ? "item" : "items"}
                </span>
            ),
        },
        {
            name: "Estado",
            center: true,
            minWidth: "130px",
            cell: (row) => {
                const esRecibido = row.estado === "recibido";
                const bg = !row.activo ? "#fee2e2" : esRecibido ? "#dcfce7" : "#fef3c7";
                const color = !row.activo ? "#991b1b" : esRecibido ? "#166534" : "#92400e";
                const texto = !row.activo ? "Anulado" : esRecibido ? "Recibido" : "Pendiente";

                return (
                    <div
                        style={{
                            padding: "4px 12px",
                            borderRadius: "16px",
                            background: bg,
                            color: color,
                            fontWeight: 700,
                            fontSize: "0.85rem",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {texto}
                    </div>
                );
            },
        },
        {
            name: "Acciones",
            center: true,
            minWidth: "160px",
            cell: (row) => {
                const editable = row.activo && row.estado === "pendiente";

                return (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <ActionButton
                            variant="outline-info"
                            size="sm"
                            tooltip="Ver Detalle"
                            icon="bi bi-eye"
                            onClick={() => navigate(`/pedidos-proveedor/${row.id}`)}
                        />

                        {currentUser?.administrar && (
                            <>
                                <ActionButton
                                    variant="outline-primary"
                                    size="sm"
                                    tooltip="Editar Pedido"
                                    icon="bi bi-pencil"
                                    disabled={!editable}
                                    onClick={() => navigate(`/pedidos-proveedor/${row.id}/edit`)}
                                />
                                <ActionButton
                                    variant={row.activo ? "outline-danger" : "outline-success"}
                                    size="sm"
                                    tooltip={row.activo ? "Dar de baja" : "Dar de alta"}
                                    icon={row.activo ? "bi bi-dash-circle" : "bi bi-check-circle"}
                                    disabled={row.estado === "recibido"}
                                    onClick={() => setPedidoToDelete(row)}
                                />
                            </>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <Container>
            <Row className="p-2 align-items-center">
                <Col>
                    <PageHeader
                        eyebrow="ABASTECIMIENTO"
                        title={titulo}
                        subtitle="Gestiona las ordenes de compra emitidas a proveedores habilitados."
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
                            size="sm"
                            onClick={() => navigate("/pedidos-proveedor/new")}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            + Nuevo Pedido
                        </Button>
                    </Col>
                )}
            </Row>

            <div>
                <AppTable columns={columns} data={filteredPedidos} />
            </div>

            <DeletePedidoProveedorModal
                pedido={pedidoToDelete}
                onHide={() => setPedidoToDelete(null)}
                onDeleted={() => mutate("/pedidos-proveedor/")}
            />
        </Container>
    );
}