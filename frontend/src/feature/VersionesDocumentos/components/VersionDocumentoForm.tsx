import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../../../hooks/useApi';
import React, { useState } from 'react';
import type { Documento } from '../../Documentos/types';

interface VersionDocumentoFormProps {
    textoBoton: string;
    onSubmit: (datos: { documento_id: number; observacion: string, archivo: string }) => void;
    valoresIniciales?: { documento_id: number; observacion: string, archivo: string; fecha_subida: string; };
}

interface VersionDocumentoFormData { observacion: string; archivo: string; }

const obtenerNombreArchivo = (base64: string | null | undefined): string => {
    if (!base64) return "";

    const matchNombre = base64.match(/;name=([^;]+);base64,/);      // Esto busca adentro del texto Base64 si esta guardado la parte ';name=([^;]+);base64,' y saca lo que esta en el medio que es el nombre del archivo

    if (matchNombre?.[1]) {
        return decodeURIComponent(matchNombre[1]);      // Convierte los espacios o acentos en texto normal para que se vea bien en la pantalla.
    }

    {/* Estos if y return son por si entras al editar y no seleccionaste otro archivo */}
    if (base64.startsWith("data:application/pdf")) return "Version Documento PDF.pdf";      
    return "Version Documento";
};

export function VersionDocumentoForm({ textoBoton, onSubmit, valoresIniciales }: VersionDocumentoFormProps) {
    const navigate = useNavigate();
    const { documentoId } = useParams();
    const [archivoBase64, setArchivoBase64] = useState<string | null>(null);
    const [archivoError, setArchivoError] = useState<string | null>(null);
    const { data: documento } = useApi<Documento>(`/documentos/${valoresIniciales?.documento_id || documentoId}`);

    const {register, handleSubmit, formState: { errors }, } = useForm<VersionDocumentoFormData> ({
        defaultValues: {
            observacion: valoresIniciales?.observacion || "",
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
    const onSubmitHookForm = (data: VersionDocumentoFormData) => {
        const archivoFinal = archivoBase64 || valoresIniciales?.archivo;
        if (!archivoFinal) {
            setArchivoError("El archivo es obligatorio");
            return;
        }
        onSubmit({
            documento_id: valoresIniciales?.documento_id || Number(documentoId),
            observacion: data.observacion.trim(),
            archivo: archivoFinal,
        });
    };

    const archivoMostrar = archivoBase64 || valoresIniciales?.archivo;

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

            <Form.Group className="mb-3 text-start" controlId="formObservacion">
                <Form.Label className="p-1 fw-bold">Observación</Form.Label>
                <Form.Control as="textarea" rows={3}
                    placeholder="Escribi una observación..."
                    {...register("observacion",{
                        maxLength: {
                            value: 300,
                            message: "La observación no puede superar los 300 caracteres."
                        },
                    })}
                    isInvalid={!!errors.observacion}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.observacion?.message}
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3 text-start">
                <Form.Label className="p-1 fw-bold">Archivo (*)</Form.Label>
                    {!valoresIniciales && (
                        <>
                            <Form.Control
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                isInvalid={!!archivoError}
                            />
                            <Form.Control.Feedback type="invalid">
                                {archivoError}
                            </Form.Control.Feedback>
                        </>
                    )}
                    {archivoMostrar && (
                        <div className="mt-3 text-center">
                            <p className="small text-muted mb-1">
                                {archivoBase64 ? "Archivo nuevo a subir:" : "Archivo actual guardado:"}
                            </p>
                                <div className="p-2 px-3 border rounded bg-light d-inline-flex align-items-center gap-2">
                                    <i className="bi bi-file-earmark-text text-success fs-5"></i>
                                    <span className="fw-semibold">{obtenerNombreArchivo(archivoMostrar)}</span>
                                    <a
                                        href={archivoMostrar}
                                        download={obtenerNombreArchivo(archivoMostrar)}
                                        className="btn btn-outline-primary btn-sm ms-2"
                                    >
                                        <i className="bi bi-download me-1"></i>Ver
                                    </a>
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

