import { useState } from "react";
import { Alert, Badge, Button, Card, Form, InputGroup, Spinner, Table } from "react-bootstrap";
import { mutate } from "swr";
import { useApi } from "../../../hooks/useApi";
import { useAuth } from "../../../hooks/useAuth";
import { api } from "../../../libs/axios";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import type { FilaNutrienteCalculado, InformacionNutricionalReceta } from "../types";

interface InfoNutricionalRecetaFormProps {
    recetaId: number;
}

const SUB_NUTRIENTES = new Set([
    "azucares_totales",
    "azucares_anadidos",
    "grasas_saturadas",
    "grasas_trans",
]);

export function InfoNutricionalReceta({ recetaId }: InfoNutricionalRecetaFormProps) {
    const { currentUser } = useAuth();
    const endpoint = `/calculo-nutricional/recetas/${recetaId}`;

    const { data: infoReceta, isLoading } = useApi<InformacionNutricionalReceta>(endpoint);
    const [calculando, setCalculando] = useState(false);
    const [verExactos, setVerExactos] = useState(false);
    const [rendimiento, setRendimiento] = useState<string | null>(null);
    const rendimientoIngresado = rendimiento ?? (infoReceta ? String(infoReceta.rendimiento) : "");
    const rendimientoNumero = Number(rendimientoIngresado);
    const rendimientoValido = rendimientoIngresado.trim() !== "" && rendimientoNumero > 0;

    const handleCalcular = async () => {
        if (!rendimientoValido) return;
        setCalculando(true);
        try {
            const { data } = await api.post<InformacionNutricionalReceta>(
                `/calculo-nutricional/recetas/${recetaId}/calcular`,
                { rendimiento: rendimientoNumero },
            );
            await mutate(endpoint, data, false);
            mostrarAlertaExito("Información nutricional calculada correctamente.");
        } catch (error: any) {
            let mensajeFinal = "No se pudo calcular la información nutricional.";
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.error(error);
        } finally {
            setCalculando(false);
        }
    };

    const formatearCelda = (fila: FilaNutrienteCalculado, tipo: "100g" | "porcion") => {
        if (verExactos) {
            const exacto = tipo === "100g" ? fila.valor_100g_exacto : fila.valor_porcion_exacto;
            return `${exacto} ${fila.unidad}`;
        }

        const texto = tipo === "100g" ? fila.texto_100g : fila.texto_porcion;
        const kj = tipo === "100g" ? fila.kj_100g : fila.kj_porcion;

        if (fila.codigo === "valor_energetico" && kj !== null) {
            return `${texto} ${fila.unidad} = ${kj} kJ`;
        }
        return `${texto} ${fila.unidad}`;
    };

    return (
        <Card className="shadow-sm border-0 rounded-3 mt-4">
            <Card.Header className="bg-white border-bottom py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div>
                    <h5 className="mb-0 fw-bold">
                        <i
                            className="bi b
                            i-table me-2"
                            style={
                                { color: "var(--sb-seafoam-primary)" }
                            }>
                        </i> Información Nutricional
                    </h5>
                    {infoReceta && (
                        <small className="text-muted">
                            Rendimiento: <strong>{infoReceta.rendimiento} g</strong> | Porción:{" "}
                            <strong>{infoReceta.porcion} g</strong> | Calculado el{" "}
                            {new Date(infoReceta.fecha_calculo).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}
                        </small>
                    )}
                </div>

                <div className="d-flex align-items-center gap-3">
                    {infoReceta && (
                        <Form.Check
                            type="switch"
                            id={`switch-exactos-${recetaId}`}
                            label="Ver valores exactos"
                            className="small mb-0"
                            checked={verExactos}
                            onChange={(e) => setVerExactos(e.target.checked)}
                        />
                    )}

                    {currentUser?.administrar && (
                        <InputGroup size="sm" style={{ width: "auto" }} hasValidation>
                            <InputGroup.Text>Rendimiento final</InputGroup.Text>
                            <Form.Control
                                type="number"
                                min={0}
                                step="any"
                                placeholder="Ej: 1000"
                                aria-label="Rendimiento final en gramos"
                                title="Peso real del producto terminado, después de la cocción o el envasado."
                                style={{ maxWidth: "120px" }}
                                value={rendimientoIngresado}
                                isInvalid={rendimientoIngresado.trim() !== "" && !rendimientoValido}
                                onChange={(e) => setRendimiento(e.target.value)}
                            />
                            <InputGroup.Text>g</InputGroup.Text>
                        </InputGroup>
                    )}

                    {currentUser?.administrar && (
                        <Button
                            variant={infoReceta ? "outline-primary" : "primary"}
                            size="sm"
                            disabled={calculando || !rendimientoValido}
                            title={rendimientoValido ? undefined : "Ingresá el rendimiento final en gramos"}
                            onClick={handleCalcular}
                        >
                            {calculando ? (
                                <><Spinner animation="border" size="sm" className="me-1" /> Calculando...</>
                            ) : (
                                <><i className="bi bi-calculator me-1"></i> {infoReceta ? "Recalcular" : "Calcular Tabla Nutricional"}</>
                            )}
                        </Button>
                    )}
                </div>
            </Card.Header>

            <Card.Body className="p-4">
                {isLoading ? (
                    <div className="text-muted small">
                        <Spinner animation="border" size="sm" className="me-2" />Cargando información nutricional...
                    </div>
                ) : !infoReceta ? (
                    <Alert variant="light" className="border text-muted mb-0">
                        Esta receta aún no tiene información nutricional calculada. Ingresá el rendimiento
                        final en gramos y presioná <strong>Calcular Tabla Nutricional</strong>.
                    </Alert>
                ) : (
                    <>
                        <div className="table-responsive">
                            <Table bordered hover size="sm" className="align-middle mb-2">
                                <thead className="table-light">
                                    <tr>
                                        <th>Nutriente</th>
                                        <th className="text-end">Cantidad cada 100 g</th>
                                        <th className="text-end">Cantidad por porción ({infoReceta.porcion} g)</th>
                                        <th className="text-center">% VD (*)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {infoReceta.tabla_nutricional.map((fila) => {
                                        const esSub = SUB_NUTRIENTES.has(fila.codigo);
                                        return (
                                            <tr key={fila.codigo}>
                                                <td className={esSub ? "ps-4 text-secondary" : "fw-semibold"}>
                                                    {esSub ? `de los cuales ${fila.nombre.toLowerCase()}` : fila.nombre}
                                                </td>
                                                <td className="text-end">{formatearCelda(fila, "100g")}</td>
                                                <td className="text-end fw-semibold">
                                                    {formatearCelda(fila, "porcion")}
                                                </td>
                                                <td className="text-center">
                                                    {fila.porcentaje_vd !== null ? (
                                                        <Badge bg="secondary" pill> {fila.porcentaje_vd}% </Badge>
                                                    ) : (
                                                        <span className="text-muted">**</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>

                        <div className="small text-muted">
                            <div>
                                (*) % Valores Diarios con base a una dieta de 2.000 kcal u 8.400 kJ. Sus valores
                                diarios pueden ser mayores o menores dependiendo de sus necesidades energéticas.
                            </div>
                            <div>(**) Valor Diario no establecido.</div>
                        </div>
                    </>
                )}
            </Card.Body>
        </Card>
    );
}