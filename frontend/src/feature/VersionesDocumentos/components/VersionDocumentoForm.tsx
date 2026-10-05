import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../../../hooks/useApi';
import React, { useState } from 'react';

interface VersionDocumentoFormProps {
    textoBoton: string;
    onSubmit: (datos: { documento_id: number; archivo: string }) => void;
    valoresIniciales?: { documento_id: number; archivo: string; fecha_subida: string; };
}

interface VersionDocumentoFormData { archivo: string; }

export function VersionDocumentoForm({ textoBoton, onSubmit, valoresIniciales }: VersionDocumentoFormProps) {
    const navigate = useNavigate();
    const { documentoId } = useParams();
    const [archivoBase64, setArchivoBase64] = useState<string | null>(null);
    const [archivoError, setArchivoError] = useState<string | null>(null);
    const { data: documento } = useApi(`/documentos/${valoresIniciales?.documento_id || documentoId}`);

    const {register, handleSubmit, formState: { errors }, } = useForm<VersionDocumentoFormData> ({
        defaultValues: {
            archivo: "",
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setArchivoError(null);
        const file = e.target.files?.[0];       
        if (!file){        
            setArchivoBase64(null);
            return;
        }
        if (file.type !== "application/pdf") {
            setArchivoBase64(null);
            setArchivoError("El archivo debe ser un PDF.");
            return;
        }

        const reader = new FileReader();       
        reader.readAsDataURL(file);    
        reader.onload = () => {     
            setArchivoBase64(reader.result as string);
        };
        reader.onerror = () => {     
            setArchivoError("Ocurrio un problema al cargar el archivo.");
        };
    }
    const archivoMostrar = archivoBase64 || valoresIniciales?.archivo;

    const onSubmitHookForm = (data: VersionDocumentoFormData) => {
        const archivoFinal = archivoBase64 ? archivoBase64 : (valoresIniciales?.archivo || null);
        onSubmit({
            documento_id: valoresIniciales?.documento_id || Number(documentoId),
            archivo: archivoFinal,
        });
    };

    return (
        <div className="col-md-6 mx-auto">
        <Form onSubmit={handleSubmit(onSubmitHookForm)} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>

            <Form.Group className="mb-3 text-start">
                <Form.Label className="p-1 fw-bold">Documento (*)</Form.Label>
                <Form.Control 
                    type="text" 
                    value={documento?.nombre || ""}
                    disabled
                />
            </Form.Group>

            {valoresIniciales && (
                    <Form.Group className="mb-3 text-start">
                        <Form.Label className="p-1 fw-bold"> Fecha de carga </Form.Label>
                        <Form.Control
                            type="text"
                            value={valoresIniciales.fecha_subida || ""}
                            disabled
                        />
                    </Form.Group>
            )}

            <Form.Group className="mb-3 text-start">
                <Form.Label className="p-1 fw-bold">Archivo (*)</Form.Label>
                <Form.Control
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    isInvalid={!!archivoError}
                />
                <Form.Control.Feedback type="invalid">
                    {archivoError}
                </Form.Control.Feedback>

                {archivoMostrar && (
                    <div className="mt-3 text-center">
                        <p className="small text-muted mb-1">
                            {archivoBase64 ? "Archivo nuevo a subir:" : "Archivo actual guardado:"}
                        </p>

                        <div className="p-2 border rounded bg-light d-inline-block">
                            <i className="bi bi-file-earmark-pdf text-danger me-2"></i>
                            <span>Documento PDF cargado correctamente</span>
                        </div>
                    </div>
                )}
            </Form.Group>

            <Button variant="secondary" type="button" 
                onClick={() => navigate(`/versiones-documentos/documento/${valoresIniciales?.documento_id || documentoId}`)}>
                <i className="bi bi-x-circle me-1"></i>Cancelar
            </Button>
            <Button className="ms-2" variant="primary" type="submit">
                <i className="bi bi-floppy me-1"></i> {textoBoton}
            </Button>
        </Form>
    </div>
    );
}

