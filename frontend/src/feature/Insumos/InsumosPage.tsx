import { Alert, Col, Container, Row, Spinner } from "react-bootstrap";
import { type TableColumn } from "react-data-table-component";
import { AppTable } from "../../components/AppTable";
import { PageHeader } from "../../components/PageHeader";
import { useApi } from "../../hooks/useApi";
import type { Insumo } from "./types";

export function InsumosPage() {
    const { data, error, isLoading } = useApi<Insumo[]>("/insumos")

    if (isLoading) return (
        <>
            <PageHeader title="Listado de Insumos" />
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </>
    )
    if (error) return (
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
            name: "#",
            selector: (_insumo, rowIndex) => (rowIndex ?? 0) + 1,
            sortable: true,
            center: true,
            maxWidth: "100px",
        },
        {
            name: "Nombre",
            selector: (insumo) => insumo.nombre,
            sortable: true,
            grow: 2,
        },
        {
            name: "Unidad de medida",
            selector: (insumo) => insumo.unidad_medida,
            sortable: true,
        },
    ];

    return (
        <>
            <PageHeader title="Listado de Insumos" />
            <Container>
                <AppTable columns={columns} data={data ?? []} />
            </Container>
        </>
    )
}