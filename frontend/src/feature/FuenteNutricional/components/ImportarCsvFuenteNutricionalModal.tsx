import React, { useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import { api } from "../../../libs/axios";
import type { FuenteNutricional, ImportarCsvResultado } from "../types";
import { mostrarAlertaError, mostrarAlertaExito } from "../../../libs/alertas";

interface ImportarCsvFuenteModalProps {
    fuente: FuenteNutricional | null;
    onHide: () => void;
    onImportado: () => void;
}

export function ImportarCsvFuenteModal({ fuente, onHide, onImportado }: ImportarCsvFuenteModalProps) {
    const [archivo, setArchivo] = useState<File | null>(null);
    const [cargando, setCargando] = useState(false);

    const handleClose = () => {
        setArchivo(null);
        onHide();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fuente || !archivo) return;

        const formData = new FormData();
        formData.append("archivo", archivo);

        setCargando(true);
        try {
            const { data } = await api.post<ImportarCsvResultado>(
                `/fuentes-nutricionales/${fuente.id}/importar-csv`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            mostrarAlertaExito(
                `Importación completada: ${data.creados} alimentos creados y ${data.actualizados} actualizados.`
            );
            onImportado();
            handleClose();
        } catch (error: any) {
            let mensajeFinal = "No se pudo importar el archivo CSV.";
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                mensajeFinal = Array.isArray(detail) ? detail[0].msg : detail;
            }
            mostrarAlertaError(mensajeFinal);
            console.error(error);
        } finally {
            setCargando(false);
        }
    };

    const habilitada = !!fuente?.activo && !!fuente?.licencia_verificada;

    return (
        <Modal show={fuente !== null} onHide={handleClose} size="lg">
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Importar Alimentos desde CSV — {fuente?.nombre}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {!habilitada ? (
                        <Alert variant="warning" className="mb-0">
                            La fuente nutricional debe estar <strong>activa</strong> y con su <strong>licencia verificada</strong> para poder importar alimentos.
                        </Alert>
                    ) : (
                        <>
                            <p className="text-muted small mb-3">
                                Seleccioná un archivo <code>.csv</code> con las columnas esperadas por el formato SARA.
                            </p>
                            <Form.Group controlId="formArchivoCsv">
                                <Form.Label className="fw-bold">Archivo CSV (*)</Form.Label>
                                <Form.Control
                                    type="file"
                                    accept=".csv,text/csv"
                                    disabled={cargando}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setArchivo(e.target.files?.[0] ?? null)
                                    }
                                />
                            </Form.Group>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer className="justify-content-start">
                    <Button variant="secondary" onClick={handleClose} disabled={cargando}>
                        <i className="bi bi-x-circle me-1"></i>Cancelar
                    </Button>
                    {habilitada && (
                        <Button variant="primary" type="submit" disabled={!archivo || cargando}>
                            <i className="bi bi-upload me-1"></i>{cargando ? "Importando..." : "Importar CSV"}
                        </Button>
                    )}
                </Modal.Footer>
            </Form>
        </Modal>
    );
}