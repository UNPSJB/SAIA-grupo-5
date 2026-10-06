import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../hooks/useApi';
import type { TipoVencimiento } from '../../TiposVencimientos/types';
import React, { useState } from 'react';
import type { NewVencimientoPersonal } from '../types';


interface VencimientoPersonalFormProps {
    textoBoton: string;
    esEdicion?: boolean;
    rutaCancelar: string;
    onSubmit: (datos: NewVencimientoPersonal) => void;
    valoresIniciales?: NewVencimientoPersonal;
}


interface VencimientoPersonalFormData {
    tipo_vencimiento_id: number | "";
    fecha_desde: string;
    fecha_hasta: string;
    observacion: string;
}

const obtenerNombreArchivo = (base64: string | null | undefined): string => {
    if (!base64) return "";

    const matchNombre = base64.match(/;name=([^;]+);base64,/);      // Esto busca adentro del texto Base64 si esta guardado la parte ';name=([^;]+);base64,' y saca lo que esta en el medio que es el nombre del archivo

    if (matchNombre?.[1]) {
        return decodeURIComponent(matchNombre[1]);      // Convierte los espacios o acentos en texto normal para que se vea bien en la pantalla.
    }

    {/* Estos if y return son por si entras al editar y no seleccionaste otro archivo */}
    if (base64.startsWith("data:application/pdf")) return "Documento PDF adjunto.pdf";      
    if (base64.startsWith("data:image/")) return "Imagen adjunta";
    return "Documento adjunto";
};

export function VencimientoPersonalForm({ textoBoton, esEdicion = false, rutaCancelar, onSubmit, valoresIniciales }: VencimientoPersonalFormProps) {
    const navigate = useNavigate();
    const { data: tiposVencimientos } = useApi<TipoVencimiento[]>('/tipos-vencimientos/');
    const tiposActivos = tiposVencimientos?.filter((tipos) => tipos.activo) || [];

    const [archivoBase64, setArchivoBase64] = useState<string | null>(null);
    const [archivoError, setArchivoError] = useState<string | null>(null);

    const {register, handleSubmit, watch, formState: { errors }, } = useForm<VencimientoPersonalFormData> ({
        defaultValues: {
            tipo_vencimiento_id: valoresIniciales?.tipo_vencimiento_id || 0,
            fecha_desde: valoresIniciales?.fecha_desde || "",
            fecha_hasta: valoresIniciales?.fecha_hasta || "",
            observacion: valoresIniciales?.observacion || "",
        },
    });

    const fechaDesdeWatch = watch("fecha_desde");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setArchivoError(null);
        const file = e.target.files?.[0];       // Cuando el usuario elige algun archivo, el navegador devuelve un arreglo y agarramos la primer posicion
        if (!file){         // Si el usuario abrio la ventana para buscar una foto y apreto cancelar sin elegir nada limpiamos el estado de la foto
            setArchivoBase64(null);
            return;
        }

        const reader = new FileReader();        // Es una herramienta del navegador que sabe leer archivos
        reader.readAsDataURL(file);     // Es una funcion que le indica a la herramienta que tiene que traducir la foto a Base64
        reader.onload = () => {     // Indica que cuando termine de leer el archivo entre y guarde el resultado en fotoBase64
            const resultado = reader.result as string;

            const conNombre = resultado.replace(";base64,", `;name=${encodeURIComponent(file.name)};base64,`);
            setArchivoBase64(conNombre);
        };
        reader.onerror = () => {        // Si hubo algun problema con el archivo guardamos el error
            setArchivoError("Ocurrio un problema al cargar el archivo.");
        };
    }

    const onSubmitHookForm = (data: VencimientoPersonalFormData) => {
        const archivoFinal = archivoBase64 ? archivoBase64 : (valoresIniciales?.archivo_adjunto || null);

        onSubmit({
            tipo_vencimiento_id: Number(data.tipo_vencimiento_id),
            fecha_desde: data.fecha_desde,
            fecha_hasta: data.fecha_hasta,
            observacion: data.observacion ? data.observacion.trim() : null,
            archivo_adjunto: archivoFinal,
        });
    };

    const archivoMostrar = archivoBase64 || valoresIniciales?.archivo_adjunto;
    const esImagen = archivoMostrar?.startsWith("data:image/");

    return (
        <div className="col-md-6 mx-auto">
            <Form onSubmit={handleSubmit(onSubmitHookForm)} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>
                {!esEdicion && (
                    <Form.Group className="mb-3 text-start" controlId="formTipoVencimiento">
                        <Form.Label className="p-1 fw-bold">Tipo de Vencimiento *</Form.Label>
                        <Form.Select
                            {...register("tipo_vencimiento_id", {
                                required: "Debe seleccionar un tipo de vencimiento.",
                                valueAsNumber: true,
                                validate: (value) => Number(value) > 0 || "Debe seleccionar un tipo de vencimiento.",
                            })}
                            isInvalid={!!errors.tipo_vencimiento_id}
                        >
                            <option value={0}>Seleccione un tipo de vencimiento...</option>
                            {tiposActivos.map((tipos) => (
                                <option key={tipos.id} value={tipos.id}>
                                    {tipos.nombre}
                                </option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {errors.tipo_vencimiento_id?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                )}

                <Form.Group className="mb-3 text-start" controlId="formFechaDesde">
                    <Form.Label className="p-1 fw-bold">Fecha Desde *</Form.Label>
                    <Form.Control
                        type="date"
                        readOnly={esEdicion}
                        style={esEdicion ? { backgroundColor: "#e9ecef", pointerEvents: "none" } : undefined}
                        {...register("fecha_desde", { required: "La fecha desde es obligatoria." })}
                        isInvalid={!!errors.fecha_desde}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.fecha_desde?.message}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3 text-start" controlId="formFechaHasta">
                    <Form.Label className="p-1 fw-bold">Fecha Hasta (Vencimiento) *</Form.Label>
                    <Form.Control
                        type="date"
                        min={fechaDesdeWatch || undefined}
                        disabled={!esEdicion && !fechaDesdeWatch}
                        readOnly={esEdicion}
                        style={esEdicion ? { backgroundColor: "#e9ecef", pointerEvents: "none" } : undefined}
                        {...register("fecha_hasta", {
                            required: "La fecha de vencimiento es obligatoria.",
                            validate: (fecha) => !fechaDesdeWatch || fecha >= fechaDesdeWatch || "La fecha hasta no puede ser menor a la fecha desde.",
                        })}
                        isInvalid={!!errors.fecha_hasta}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.fecha_hasta?.message}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3 text-start">
                    <Form.Label className="p-1 fw-bold">Archivo / Comprobante (Opcional)</Form.Label>
                    <Form.Control
                        type="file"
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
                            {esImagen ? (
                                <div>
                                    <img
                                        src={archivoMostrar}
                                        alt="Comprobante de vencimiento"
                                        style={{ maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }}
                                        className="border shadow-sm"
                                    />
                                    <div className="small text-muted">{obtenerNombreArchivo(archivoMostrar)}</div>
                                </div>
                            ) : (
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
                            )}
                        </div>
                    )}
                </Form.Group>

                <Form.Group className="mb-3 text-start" controlId="formObservacion">
                    <Form.Label className="p-1 fw-bold">Observacion (Opcional)</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Escribi una observacion..."
                        {...register("observacion", {
                            minLength: {
                                value: 5,
                                message: "La observacion debe tener al menos 5 caracteres."
                            },
                            maxLength: { 
                                value: 500,
                                message: "La observacion no puede superar los 500 caracteres." 
                            },
                            validate: (value) => {
                                if (!value) return true;
                                if (value.trim() === "") return "La observacion no puede ser solo espacios en blanco.";
                                if (value.trim().length < 5) return "La observacion debe tener al menos 5 caracteres."
                            }
                        })}
                        isInvalid={!!errors.observacion}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.observacion?.message}
                    </Form.Control.Feedback>
                </Form.Group>
                <div className="d-flex justify-content-end">
                    <Button variant="secondary" type="button" onClick={() => navigate(rutaCancelar)}>
                        <i className="bi bi-x-circle me-1"></i>Cancelar
                    </Button>
                    <Button className="ms-2" variant="primary" type="submit">
                        <i className="bi bi-floppy me-1"></i> {textoBoton}
                    </Button>
                </div>
            </Form>
        </div>
    );
}