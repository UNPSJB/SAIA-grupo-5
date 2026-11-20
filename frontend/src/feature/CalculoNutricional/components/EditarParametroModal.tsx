import { useEffect, useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { api } from "../../../libs/axios";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";
import type { ParametroNutriente } from "../types";

interface EditarParametroModalProps {
    parametro: ParametroNutriente | null;
    onHide: () => void;
    onSaved: () => void;
}

export function EditarParametroModal({ parametro, onHide, onSaved }: EditarParametroModalProps) {
    const [nombre, setNombre] = useState("");
    const [unidad, setUnidad] = useState("");
    const [vdr, setVdr] = useState("");
    const [declaraVd, setDeclaraVd] = useState(true);
    const [umbralNoSig, setUmbralNoSig] = useState("0");
    const [ordenTabla, setOrdenTabla] = useState("1");
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        if (!parametro) return;
        setNombre(parametro.nombre);
        setUnidad(parametro.unidad);
        setVdr(parametro.valor_diario_referencia !== null ? String(parametro.valor_diario_referencia) : "");
        setDeclaraVd(parametro.declara_porcentaje_vd);
        setUmbralNoSig(String(parametro.umbral_no_significativo));
        setOrdenTabla(String(parametro.orden_tabla));
    }, [parametro]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!parametro) return;

        setGuardando(true);
        try {
            await api.put(`/calculo-nutricional/parametros/${parametro.id}`, {
                nombre: nombre.trim(),
                unidad: unidad.trim(),
                valor_diario_referencia: vdr.trim() === "" ? null : Number(vdr),
                declara_porcentaje_vd: declaraVd,
                umbral_no_significativo: Number(umbralNoSig),
                orden_tabla: Number(ordenTabla),
            });
            mostrarAlertaExito(`Parámetro '${nombre}' actualizado correctamente.`);
            onSaved();
            onHide();
        } catch (error: any) {
            let mensajeFinal = "No se pudo actualizar el parámetro.";
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Modal show={parametro !== null} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title className="fs-5">Editar Parámetro: {parametro?.nombre}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Row>
                        <Col md={8}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Nombre en tabla (*)</Form.Label>
                                <Form.Control
                                    type="text"
                                    maxLength={100}
                                    required
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Unidad (*)</Form.Label>
                                <Form.Control
                                    type="text"
                                    maxLength={10}
                                    required
                                    value={unidad}
                                    onChange={(e) => setUnidad(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Valor Diario Referencia (VDR)</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="any"
                                    min="0.01"
                                    placeholder="Sin VDR"
                                    value={vdr}
                                    onChange={(e) => setVdr(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Umbral No Significativo (*)</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="any"
                                    min="0"
                                    required
                                    value={umbralNoSig}
                                    onChange={(e) => setUmbralNoSig(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="align-items-center">
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Orden en tabla (*)</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="1"
                                    required
                                    value={ordenTabla}
                                    onChange={(e) => setOrdenTabla(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Check
                                type="switch"
                                id="switch-declara-vd"
                                label="Declara %VD en tabla"
                                checked={declaraVd}
                                onChange={(e) => setDeclaraVd(e.target.checked)}
                            />
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide} disabled={guardando}>
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit" disabled={guardando}>
                        {guardando ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}