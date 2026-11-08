import React, { useState } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../hooks/useApi';
import type { Proveedor } from '../../Proveedores/types';
import type { NewLoteProveedor } from '../types';

interface LoteProveedorFormProps {
    textoBoton: string;
    onSubmit: (datos: NewLoteProveedor) => void;
    valoresIniciales?: Partial<NewLoteProveedor>;
    isEdit?: boolean;
}

interface LoteProveedorFormData {
    proveedor_id: number;
    numero_lote: string;
    numero_remito: string;
    fecha_recepcion: string;
}

const obtenerNombreArchivo = (base64: string | null | undefined): string => {
    if (!base64) return "";
    const matchNombre = base64.match(/;name=([^;]+);base64,/);
    if (matchNombre?.[1]) return decodeURIComponent(matchNombre[1]);
    if (base64.startsWith("data:application/pdf")) return "Remito_Recepcion.pdf";
    if (base64.startsWith("data:image/")) return "Imagen de remito";
    return "Comprobante adjunto";
};

export function LoteProveedorForm({ textoBoton, onSubmit, valoresIniciales, isEdit = false }: LoteProveedorFormProps) {
    const navigate = useNavigate();
    const { data: proveedores, isLoading: cargandoProveedores } = useApi<Proveedor[]>('/proveedores/');
    const [archivoBase64, setArchivoBase64] = useState<string | null>(valoresIniciales?.archivo_adjunto || null);
    const [archivoError, setArchivoError] = useState<string | null>(null);

    const hoy = new Date().toISOString().split('T')[0];

    const { register, handleSubmit, formState: { errors } } = useForm<LoteProveedorFormData>({
        defaultValues: {
            proveedor_id: valoresIniciales?.proveedor_id || undefined,
            numero_lote: valoresIniciales?.numero_lote || '',
            numero_remito: valoresIniciales?.numero_remito || '',
            fecha_recepcion: valoresIniciales?.fecha_recepcion || hoy,
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setArchivoError(null);
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const resultado = reader.result as string;
            const conNombre = resultado.replace(";base64,", `;name=${encodeURIComponent(file.name)};base64,`);
            setArchivoBase64(conNombre);
        };
        reader.onerror = () => {
            setArchivoError("Error al procesar el archivo seleccionado.");
        };
    };

    const onSubmitForm = (data: LoteProveedorFormData) => {
        onSubmit({
            proveedor_id: Number(data.proveedor_id),
            numero_lote: data.numero_lote.trim(),
            numero_remito: data.numero_remito?.trim() ? data.numero_remito.trim() : null,
            fecha_recepcion: data.fecha_recepcion,
            archivo_adjunto: archivoBase64,
        });
    };

    const proveedoresActivos = proveedores?.filter((p) => p.activo) || [];

    return (
        <div className="col-md-8 mx-auto">
            <Form onSubmit={handleSubmit(onSubmitForm)} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>
                <Form.Group className="mb-3 text-start" controlId="formProveedor">
                    <Form.Label className="p-1 fw-bold">Proveedor *</Form.Label>
                    {cargandoProveedores ? (
                        <div><Spinner size="sm" animation="border" /> Cargando proveedores...</div>
                    ) : (
                        <Form.Select
                            disabled={isEdit}
                            {...register("proveedor_id", {
                                required: "Debe seleccionar un proveedor.",
                            })}
                            isInvalid={!!errors.proveedor_id}
                        >
                            <option value="">Seleccione un proveedor...</option>
                            {proveedoresActivos.map((prov) => (
                                <option key={prov.id} value={prov.id}>
                                    {prov.nombre} (CUIT: {prov.cuit})
                                </option>
                            ))}
                        </Form.Select>
                    )}
                    <Form.Control.Feedback type="invalid">{errors.proveedor_id?.message}</Form.Control.Feedback>
                </Form.Group>

                <div className="row">
                    <div className="col-md-6">
                        <Form.Group className="mb-3 text-start" controlId="formNumeroLote">
                            <Form.Label className="p-1 fw-bold">Número de Lote (Origen) *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ej: LOT-FAB-2026-09"
                                {...register("numero_lote", {
                                    required: "El número de lote es obligatorio.",
                                    maxLength: { value: 100, message: "Máximo 100 caracteres." },
                                    validate: (v) => v.trim() !== "" || "No puede ser solo espacios.",
                                })}
                                isInvalid={!!errors.numero_lote}
                            />
                            <Form.Control.Feedback type="invalid">{errors.numero_lote?.message}</Form.Control.Feedback>
                        </Form.Group>
                    </div>

                    <div className="col-md-6">
                        <Form.Group className="mb-3 text-start" controlId="formNumeroRemito">
                            <Form.Label className="p-1 fw-bold">Número de Remito</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ej: R-0001-00008899"
                                {...register("numero_remito", {
                                    maxLength: { value: 100, message: "Máximo 100 caracteres." },
                                })}
                                isInvalid={!!errors.numero_remito}
                            />
                            <Form.Control.Feedback type="invalid">{errors.numero_remito?.message}</Form.Control.Feedback>
                        </Form.Group>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6">
                        <Form.Group className="mb-3 text-start" controlId="formFechaRecepcion">
                            <Form.Label className="p-1 fw-bold">Fecha de Recepción *</Form.Label>
                            <Form.Control
                                type="date"
                                max={hoy}
                                {...register("fecha_recepcion", {
                                    required: "La fecha de recepción es obligatoria.",
                                    validate: (v) => v <= hoy || "La fecha de recepción no puede ser futura.",
                                })}
                                isInvalid={!!errors.fecha_recepcion}
                            />
                            <Form.Control.Feedback type="invalid">{errors.fecha_recepcion?.message}</Form.Control.Feedback>
                        </Form.Group>
                    </div>

                    <div className="col-md-6">
                        <Form.Group className="mb-3 text-start">
                            <Form.Label className="p-1 fw-bold">Comprobante de Remito (PDF o Foto)</Form.Label>
                            <Form.Control
                                type="file"
                                accept="application/pdf,image/*"
                                onChange={handleFileChange}
                                isInvalid={!!archivoError}
                            />
                            <Form.Control.Feedback type="invalid">{archivoError}</Form.Control.Feedback>
                        </Form.Group>
                    </div>
                </div>

                {archivoBase64 && (
                    <div className="p-2 mb-3 border rounded bg-light d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2 text-truncate">
                            <i className="bi bi-file-earmark-check text-success fs-5"></i>
                            <span className="small fw-semibold text-truncate">{obtenerNombreArchivo(archivoBase64)}</span>
                        </div>
                        <Button variant="outline-danger" size="sm" onClick={() => setArchivoBase64(null)}>
                            <i className="bi bi-trash"></i>
                        </Button>
                    </div>
                )}

                <div className="d-flex justify-content-start gap-2 mt-3">
                    <Button variant="secondary" type="button" onClick={() => navigate('/recepciones')}>
                        <i className="bi bi-x-circle me-1"></i>Cancelar
                    </Button>
                    <Button variant="primary" type="submit">
                        <i className="bi bi-floppy me-1"></i> {textoBoton}
                    </Button>
                </div>
            </Form>
        </div>
    );
}