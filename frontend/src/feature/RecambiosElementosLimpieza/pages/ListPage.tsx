import { useMemo, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { type TableColumn } from "react-data-table-component";

import { AppTable } from "../../../components/AppTable";
import { PageHeader } from "../../../components/PageHeader";
import { PageLoading } from "../../../components/PageLoading";
import { PageError } from "../../../components/PageError";
import { ActionButton } from "../../../components/ActionButton";
import { useApi } from "../../../hooks/useApi";
import { useAuth } from "../../../hooks/useAuth";

import type { RecambioElementoLimpieza } from "../types";
import type { ElementoLimpieza } from "../../ElementosLimpieza/types";

export function RecambiosElementoLimpiezaPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [search, setSearch] = useState("");

    const { data: recambios, error, isLoading } = useApi<RecambioElementoLimpieza[]>("/recambios-elementos-limpieza");
    const { data: elementos } = useApi<ElementoLimpieza[]>("/elementos-limpieza");

    const obtenerElemento = (elementoId: number) => {
        return elementos?.find(elemento => elemento.id === elementoId);
    };

    const filteredRecambios = useMemo(() => {
        if (!Array.isArray(recambios)) return [];

        const busqueda = search.toLowerCase();

        return recambios.filter((recambio) => {
            const elemento = obtenerElemento(recambio.elemento_id);

            return (
                (elemento?.codigo ?? "").toLowerCase().includes(busqueda) ||
                (elemento?.nombre ?? "").toLowerCase().includes(busqueda) ||
                recambio.fecha.toLowerCase().includes(busqueda) ||
                (recambio.observacion ?? "").toLowerCase().includes(busqueda)
            );
        });
    }, [search, recambios, elementos]);

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Form.Control
                type="text"
                placeholder="Buscar recambio..."
                className="mr-sm-2"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
        );
    }, []);

    if (isLoading) return <PageLoading title="Recambios de Elementos de Limpieza" />;

    if (!recambios || error) return (
        <PageError title="Recambios de Elementos de Limpieza" message="Ocurrió un error al cargar los recambios" />
    );

    const columns: TableColumn<RecambioElementoLimpieza>[] = [
        {
            name: "Elemento",
            selector: row => obtenerElemento(row.elemento_id)?.nombre ?? "-",
            sortable: true,
            center: true,
        },
        {
            name: "Código",
            selector: row => obtenerElemento(row.elemento_id)?.codigo ?? "-",
            sortable: true,
            center: true,
        },
        {
            name: "Fecha",
            selector: row => row.fecha,
            sortable: true,
            center: true,
        },
        {
            name: "Observación",
            selector: row => row.observacion ?? "-",
            center: true,
            grow: 2,
        },
        {
            name: "Acciones",
            center: true,
            cell: row => (
                <ActionButton
                    variant="outline-secondary"
                    size="sm"
                    tooltip="Ver"
                    icon="bi-eye"
                    onClick={() => navigate(`/recambios-elementos-limpieza/${row.id}`)}
                />
            ),
        },
    ];

    return (
        <Container>
            <Row className="p-2 align-items-center">
                <Col>
                    <PageHeader title="Recambios de Elementos de Limpieza" />
                </Col>

                <Col xs="auto" className="align-self-center">
                    {subHeaderComponentMemo}
                </Col>

                <Col xs="auto" className="d-flex justify-content-end">
                    {currentUser?.administrar && (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate("/recambios-elementos-limpieza/new")}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            + Nuevo Recambio
                        </Button>
                    )}
                </Col>
            </Row>

            <AppTable
                columns={columns}
                data={filteredRecambios}
            />
        </Container>
    );
}