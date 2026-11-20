import { useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Table } from "react-bootstrap";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { PageLoading } from "../../../components/PageLoading";
import { ActionButton } from "../../../components/ActionButton";
import { useApi } from "../../../hooks/useApi";
import { useAuth } from "../../../hooks/useAuth";
import { api } from "../../../libs/axios";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import { EditarParametroModal } from "../components/EditarParametroModal";
import type { ConfiguracionCalculo, ParametroNutriente } from "../types";

export function ConfiguracionCalculoNutricionalPage() {
    const { currentUser } = useAuth();
    const { data: config, isLoading: cargandoConfig, error: errorConfig } = useApi<ConfiguracionCalculo>("/calculo-nutricional/configuracion");
    const { data: parametros, isLoading: cargandoParametros } = useApi<ParametroNutriente[]>("/calculo-nutricional/parametros");

    const [factorKj, setFactorKj] = useState("4.18");
    const [textoNoSig, setTextoNoSig] = useState("0");
    const [decMenor1, setDecMenor1] = useState("1");
    const [decEntre1y10, setDecEntre1y10] = useState("1");
    const [decMayorIgual10, setDecMayorIgual10] = useState("0");
    const [guardandoConfig, setGuardandoConfig] = useState(false);

    const [parametroEditar, setParametroEditar] = useState<ParametroNutriente | null>(null);

    useEffect(() => {
        if (!config) return;
        setFactorKj(String(config.factor_conversion_kj));
        setTextoNoSig(config.texto_no_significativo);
        setDecMenor1(String(config.decimales_menor_a_1));
        setDecEntre1y10(String(config.decimales_entre_1_y_10));
        setDecMayorIgual10(String(config.decimales_mayor_igual_10));
    }, [config]);

    const handleGuardarConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        setGuardandoConfig(true);
        try {
            await api.put("/calculo-nutricional/configuracion", {
                factor_conversion_kj: Number(factorKj),
                texto_no_significativo: textoNoSig.trim(),
                decimales_menor_a_1: Number(decMenor1),
                decimales_entre_1_y_10: Number(decEntre1y10),
                decimales_mayor_igual_10: Number(decMayorIgual10),
            });
            await mutate("/calculo-nutricional/configuracion");
            mostrarAlertaExito("Configuración de cálculo nutricional actualizada.");
        } catch (error: any) {
            let mensajeFinal = "No se pudo guardar la configuración.";
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
        } finally {
            setGuardandoConfig(false);
        }
    };

    const titulo = "Configuración de Cálculo Nutricional";

    if (cargandoConfig || cargandoParametros) return <PageLoading title={titulo} />;

    if (errorConfig || !config) {
        return (
            <Container>
                <PageHeader title={titulo} />
                <Alert variant="danger">No se pudo cargar la configuración de cálculo nutricional.</Alert>
            </Container>
        );
    }

    return (
        <Container>
            <PageHeader
                title={titulo}
                subtitle="Reglas de redondeo, conversión energética y Valores Diarios de Referencia (CAA)."
            />

            <Card className="shadow-sm border-0 rounded-3 mb-4">
                <Card.Header className="bg-white border-bottom py-3">
                    <h6 className="mb-0 fw-bold text-primary">
                        <i className="bi bi-sliders me-2"></i>Reglas Generales de Redondeo y Energía
                    </h6>
                </Card.Header>
                <Card.Body className="p-4">
                    <Form onSubmit={handleGuardarConfig}>
                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Factor conversión kJ (1 kcal =)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.0001"
                                        min="0.0001"
                                        required
                                        disabled={!currentUser?.administrar}
                                        value={factorKj}
                                        onChange={(e) => setFactorKj(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={8}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Texto para valores no significativos</Form.Label>
                                    <Form.Control
                                        type="text"
                                        maxLength={100}
                                        required
                                        disabled={!currentUser?.administrar}
                                        value={textoNoSig}
                                        onChange={(e) => setTextoNoSig(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Decimales si valor &lt; 1</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        max="4"
                                        required
                                        disabled={!currentUser?.administrar}
                                        value={decMenor1}
                                        onChange={(e) => setDecMenor1(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Decimales si 1 &le; valor &lt; 10</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        max="4"
                                        required
                                        disabled={!currentUser?.administrar}
                                        value={decEntre1y10}
                                        onChange={(e) => setDecEntre1y10(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Decimales si valor &ge; 10</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        max="4"
                                        required
                                        disabled={!currentUser?.administrar}
                                        value={decMayorIgual10}
                                        onChange={(e) => setDecMayorIgual10(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {currentUser?.administrar && (
                            <Button variant="primary" type="submit" disabled={guardandoConfig}>
                                <i className="bi bi-floppy me-1"></i>
                                {guardandoConfig ? "Guardando..." : "Guardar Configuración"}
                            </Button>
                        )}
                    </Form>
                </Card.Body>
            </Card>

            <Card className="shadow-sm border-0 rounded-3">
                <Card.Header className="bg-white border-bottom py-3">
                    <h6 className="mb-0 fw-bold text-primary">
                        <i className="bi bi-list-ol me-2"></i>Parámetros por Nutriente (VDR y Umbrales)
                    </h6>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th className="text-center">Orden</th>
                                <th>Nutriente</th>
                                <th className="text-center">Unidad</th>
                                <th className="text-end">VDR</th>
                                <th className="text-center">Declara %VD</th>
                                <th className="text-end">Umbral No Sig.</th>
                                {currentUser?.administrar && <th className="text-center">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {(parametros ?? []).map((p) => (
                                <tr key={p.id}>
                                    <td className="text-center">{p.orden_tabla}</td>
                                    <td className="fw-semibold">{p.nombre}</td>
                                    <td className="text-center">{p.unidad}</td>
                                    <td className="text-end">
                                        {p.valor_diario_referencia !== null ? p.valor_diario_referencia : "-"}
                                    </td>
                                    <td className="text-center">
                                        <Badge bg={p.declara_porcentaje_vd ? "success" : "secondary"}>
                                            {p.declara_porcentaje_vd ? "Sí" : "No"}
                                        </Badge>
                                    </td>
                                    <td className="text-end">{p.umbral_no_significativo}</td>
                                    {currentUser?.administrar && (
                                        <td className="text-center">
                                            <ActionButton
                                                variant="outline-primary"
                                                size="sm"
                                                tooltip="Editar parámetro"
                                                icon="bi bi-pencil"
                                                onClick={() => setParametroEditar(p)}
                                            />
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <EditarParametroModal
                parametro={parametroEditar}
                onHide={() => setParametroEditar(null)}
                onSaved={() => mutate("/calculo-nutricional/parametros")}
            />
        </Container>
    );
}