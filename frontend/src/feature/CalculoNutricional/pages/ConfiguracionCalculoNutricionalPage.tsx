import { useEffect, useState } from "react";
import { Alert, Button, Card, Container, Form, Row, Table } from "react-bootstrap";
import { mutate } from "swr";
import { PageHeader } from "../../../components/PageHeader";
import { PageLoading } from "../../../components/PageLoading";
import { ActionButton } from "../../../components/ActionButton";
import { Dato } from "../../../components/Dato";
import { EstadoBadge } from "../../../components/EstadoBadge";
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

            <Card className="shadow-sm border-0 rounded-3 mb-4 text-start">
                <Card.Body className="p-4">
                    <Form onSubmit={handleGuardarConfig}>
                        <h6 className="detalle-seccion-titulo">Reglas generales de redondeo y energía</h6>
                        <Row className="g-3 mb-4">
                            <Dato etiqueta="Factor de conversión a kJ (1 kcal =)" md={4}>
                                <Form.Group controlId="config-factor-kj">
                                    <Form.Label className="visually-hidden">Factor de conversión a kJ</Form.Label>
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
                            </Dato>
                            <Dato etiqueta="Texto para valores no significativos" md={8}>
                                <Form.Group controlId="config-texto-no-significativo">
                                    <Form.Label className="visually-hidden">Texto para valores no significativos</Form.Label>
                                    <Form.Control
                                        type="text"
                                        maxLength={100}
                                        required
                                        disabled={!currentUser?.administrar}
                                        value={textoNoSig}
                                        onChange={(e) => setTextoNoSig(e.target.value)}
                                    />
                                </Form.Group>
                            </Dato>
                        </Row>

                        <h6 className="detalle-seccion-titulo">Decimales según el valor</h6>
                        <Row className="g-3 mb-4">
                            <Dato etiqueta="Si el valor es menor a 1" md={4}>
                                <Form.Group controlId="config-dec-menor-1">
                                    <Form.Label className="visually-hidden">Decimales si el valor es menor a 1</Form.Label>
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
                            </Dato>
                            <Dato etiqueta="Si el valor está entre 1 y 10" md={4}>
                                <Form.Group controlId="config-dec-entre-1-y-10">
                                    <Form.Label className="visually-hidden">Decimales si 1 ≤ valor &lt; 10</Form.Label>
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
                            </Dato>
                            <Dato etiqueta="Si el valor es 10 o más" md={4}>
                                <Form.Group controlId="config-dec-mayor-10">
                                    <Form.Label className="visually-hidden">Decimales si el valor es 10 o más</Form.Label>
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
                            </Dato>
                        </Row>

                        {currentUser?.administrar && (
                            <div className="d-flex justify-content-end">
                                <Button variant="primary" type="submit" disabled={guardandoConfig}>
                                    <i className="bi bi-floppy me-1"></i>
                                    {guardandoConfig ? "Guardando..." : "Guardar Configuración"}
                                </Button>
                            </div>
                        )}
                    </Form>
                </Card.Body>
            </Card>

            <Card className="shadow-sm border-0 rounded-3 mb-4 text-start">
                <Card.Body className="p-4">
                    <h6 className="detalle-seccion-titulo">Parámetros por nutriente (VDR y umbrales)</h6>
                    <Table responsive bordered hover className="mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th className="text-center px-3">Orden</th>
                                <th className="px-3">Nutriente</th>
                                <th className="text-center px-3">Unidad</th>
                                <th className="text-end px-3">VDR</th>
                                <th className="text-center px-3">Declara %VD</th>
                                <th className="text-end px-3">Umbral No Sig.</th>
                                {currentUser?.administrar && <th className="text-center px-3">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {(parametros ?? []).map((p) => (
                                <tr key={p.id}>
                                    <td className="text-center px-3">{p.orden_tabla}</td>
                                    <td className="fw-semibold px-3">{p.nombre}</td>
                                    <td className="text-center px-3">{p.unidad}</td>
                                    <td className="text-end px-3">
                                        {p.valor_diario_referencia !== null ? p.valor_diario_referencia : "-"}
                                    </td>
                                    <td className="text-center px-3">
                                        <EstadoBadge tono={p.declara_porcentaje_vd ? "success" : "secondary"}>
                                            {p.declara_porcentaje_vd ? "Sí" : "No"}
                                        </EstadoBadge>
                                    </td>
                                    <td className="text-end px-3">{p.umbral_no_significativo}</td>
                                    {currentUser?.administrar && (
                                        <td className="text-center px-3">
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