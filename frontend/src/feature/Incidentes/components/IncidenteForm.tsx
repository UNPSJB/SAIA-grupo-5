import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../hooks/useApi';
import React, { useState } from 'react';
import type { TipoIncidente } from '../../TiposIncidentes/types';
import type { Sector } from '../../Sectores/types';

interface IncidenteFormProps {
    textoBoton: string;
    onSubmit: (datos: {
        nombre: string,
        descripcion: string,
        tipo_id: number,
        sector_id: number | null,
        lote_produccion_id?: number | null,
        lote_proveedor_id?: number | null,
        insumo_lote_id?: number | null,
        foto_opcional: string | null
    }) => void;
    valoresIniciales?: {
        nombre: string,
        descripcion: string,
        tipo_id: number,
        sector_id: number | null,
        lote_produccion_id?: number | null,
        lote_proveedor_id?: number | null,
        insumo_lote_id?: number | null,
        foto_opcional: string | null,
        fecha_abierto: string,
        fecha_cierre: string | null
    };
    soloLectura?: boolean;
}

interface IncidenteFormData {
    nombre: string;
    descripcion: string;
    tipo_id: number;
    sector_id: number | null;
}

const obtenerNombreArchivo = (base64: string | null | undefined): string => {
    if (!base64) return "";

    const matchNombre = base64.match(/;name=([^;]+);base64,/);      // Esto busca adentro del texto Base64 si esta guardado la parte ';name=([^;]+);base64,' y saca lo que esta en el medio que es el nombre del archivo

    if (matchNombre?.[1]) {
        return decodeURIComponent(matchNombre[1]);      // Convierte los espacios o acentos en texto normal para que se vea bien en la pantalla.
    }

    {/* Estos if y return son por si entras al editar y no seleccionaste otro archivo */}
    if (base64.startsWith("data:image/")) return "Foto adjunta";
    return "Foto adjunta";
};

export function IncidenteForm({ textoBoton, onSubmit, valoresIniciales, soloLectura }: IncidenteFormProps) {
    const navigate = useNavigate();
    const [fotoBase64, setFotoBase64] = useState<string | null>(null);
    const [fotoError, setFotoError] = useState<string | null>(null);
    const { data: tipos } = useApi<TipoIncidente[]>('/tipos-incidentes/');
    const [tipoIncidenteId, setTipoIncidenteId] = useState(valoresIniciales?.tipo_id?.toString() || "");
    const { data: sectores } = useApi<Sector[]>('/sectores/');
    const [sectorId, setSectorId] = useState(valoresIniciales?.sector_id?.toString() || "");
    const { data: lotesProduccion } = useApi<any[]>('/lotes-produccion/');
    const [loteProduccionId, setLoteProduccionId] = useState(valoresIniciales?.lote_produccion_id?.toString() || "");
    const { data: lotesProveedor } = useApi<any[]>('/lotes-proveedor/');
    const [loteProveedorId, setLoteProveedorId] = useState(valoresIniciales?.lote_proveedor_id?.toString() || "");
    const { data: insumosLote } = useApi<any[]>('/insumos-lote/');
    const [insumoLoteId, setInsumoLoteId] = useState(valoresIniciales?.insumo_lote_id?.toString() || "");


    const { register, handleSubmit, formState: { errors }, } = useForm<IncidenteFormData>({
        defaultValues: {
            nombre: valoresIniciales?.nombre || "",
            descripcion: valoresIniciales?.descripcion || "",
            tipo_id: Number(valoresIniciales?.tipo_id ?? 0),
            sector_id: valoresIniciales?.sector_id ?? null,
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFotoError(null);
        const file = e.target.files?.[0];
        if (!file) {
            setFotoBase64(null);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setFotoBase64(reader.result as string);
        };
        reader.onerror = () => {
            setFotoError("Ocurrio un problema al cargar la foto.");
        };
    }
    const fotoMostrar = fotoBase64 || valoresIniciales?.foto_opcional;

    const onSubmitHookForm = (data: IncidenteFormData) => {
        const fotoFinal = fotoBase64 ?? valoresIniciales?.foto_opcional ?? null;
        onSubmit({
            nombre: data.nombre.trim(),
            descripcion: data.descripcion.trim(),
            tipo_id: Number(tipoIncidenteId),
            sector_id: sectorId ? Number(sectorId) : null,
            lote_produccion_id: loteProduccionId ? Number(loteProduccionId) : null,
            lote_proveedor_id: loteProveedorId ? Number(loteProveedorId) : null,
            insumo_lote_id: insumoLoteId ? Number(insumoLoteId) : null,
            foto_opcional: fotoFinal,
        });
    };

    return (
        <div className="col-md-6 mx-auto">
            <Form onSubmit={handleSubmit(onSubmitHookForm)} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>

                <Form.Group className="mb-3 text-start" controlId="formNombre">
                    <Form.Label className="p-1 fw-bold">Nombre del Incidente (*)</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Ingrese el nombre"
                        {...register("nombre", {
                            required: "El nombre del incidente es obligatorio.",
                            maxLength: {
                                value: 60,
                                message: "El nombre no puede superar los 60 caracteres."
                            },
                            validate: (value) => value.trim() !== "" || "El nombre no puede ser solo espacios en blanco."
                        })}
                        isInvalid={!!errors.nombre}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.nombre?.message}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3 text-start" controlId="formTipo">
                    <Form.Label className="p-1 fw-bold">Tipo de Incidente (*)</Form.Label>
                    <Form.Select
                        value={tipoIncidenteId}
                        onChange={(e) => setTipoIncidenteId(e.target.value)}
                        isInvalid={!!errors.tipo_id}
                        disabled={soloLectura}
                    >
                        <option value="">Seleccione un tipo</option>

                        {tipos?.filter((tipo) => tipo.activo).map((tipo) => (
                            <option key={tipo.id} value={tipo.id}>
                                {tipo.nombre}
                            </option>
                        ))}
                    </Form.Select>

                    <Form.Control.Feedback type="invalid">
                        {errors.tipo_id?.message}
                    </Form.Control.Feedback>
                </Form.Group>

                {valoresIniciales && (
                    <Form.Group className="mb-3 text-start">
                        <Form.Label className="p-1 fw-bold"> Fecha de apertura (*) </Form.Label>
                        <Form.Control
                            type="text"
                            value={valoresIniciales.fecha_abierto
                                ? new Date(valoresIniciales.fecha_abierto).toLocaleString("es-AR", {
                                    hour12: false
                                })
                                : ""}
                            disabled
                        />
                    </Form.Group>
                )}

                <Form.Group className="mb-3 text-start" controlId="formDescripcion">
                    <Form.Label className="p-1 fw-bold">Descripción (*) </Form.Label>
                    <Form.Control as="textarea" rows={3}
                        placeholder="Escribi una descripción..."
                        {...register("descripcion", {
                            required: "La descripción es obligatoria.",
                            maxLength: {
                                value: 500,
                                message: "La descripción no puede superar los 500 caracteres."
                            },
                            validate: (value) =>
                                value.trim() !== "" ||
                                "La descripción no puede contener solo espacios."
                        })}
                        isInvalid={!!errors.descripcion}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.descripcion?.message}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3 text-start" controlId="formSector">
                    <Form.Label className="p-1 fw-bold">Sector</Form.Label>
                    <Form.Select
                        value={sectorId}
                        onChange={(e) => setSectorId(e.target.value)}
                        disabled={soloLectura}
                    >
                        <option value="">Seleccione un sector</option>

                        {sectores?.filter((sector) => sector.activo).map((sector) => (
                            <option key={sector.id} value={sector.id}>
                                {sector.nombre}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                {!valoresIniciales?.lote_proveedor_id && !valoresIniciales?.insumo_lote_id && loteProveedorId === "" && insumoLoteId === "" && (
                    <Form.Group className="mb-3 text-start" controlId="formLoteProduccion">
                        <Form.Label className="p-1 fw-bold">Lote de Produccion</Form.Label>
                        <Form.Select
                            value={loteProduccionId}
                            onChange={(e) => {
                                setLoteProduccionId(e.target.value);
                                if (e.target.value) {
                                    setLoteProveedorId("");
                                    setInsumoLoteId("");
                                }
                            }}
                            disabled={soloLectura || Boolean(valoresIniciales?.lote_produccion_id)}
                        >
                            <option value="">Sin lote de produccion asociado</option>
                            {lotesProduccion?.filter((l) => l.activo).map((lote) => (
                                <option key={lote.id} value={lote.id}>
                                    Lote #{lote.id} - {lote.producto?.nombre || 'Producto'} ({lote.estado})
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                )}

                {!valoresIniciales?.lote_produccion_id && !valoresIniciales?.insumo_lote_id && loteProduccionId === "" && insumoLoteId === "" && (
                    <Form.Group className="mb-3 text-start" controlId="formLoteProveedor">
                        <Form.Label className="p-1 fw-bold">Recepcion / Lote Proveedor</Form.Label>
                        <Form.Select
                            value={loteProveedorId}
                            onChange={(e) => {
                                setLoteProveedorId(e.target.value);
                                if (e.target.value) {
                                    setLoteProduccionId("");
                                    setInsumoLoteId("");
                                }
                            }}
                            disabled={soloLectura || Boolean(valoresIniciales?.lote_proveedor_id)}
                        >
                            <option value="">Sin recepcion asociada</option>
                            {lotesProveedor?.filter((r) => r.activo).map((rec) => (
                                <option key={rec.id} value={rec.id}>
                                    Remito {rec.numero_remito || `#${rec.id}`} - {rec.proveedor?.nombre || 'Proveedor'}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                )}

                {!valoresIniciales?.lote_produccion_id && !valoresIniciales?.lote_proveedor_id && loteProduccionId === "" && loteProveedorId === "" && (
                    <Form.Group className="mb-3 text-start" controlId="formInsumoLote">
                        <Form.Label className="p-1 fw-bold">Insumo Alimenticio</Form.Label>
                        <Form.Select
                            value={insumoLoteId}
                            onChange={(e) => {
                                setInsumoLoteId(e.target.value);
                                if (e.target.value) {
                                    setLoteProduccionId("");
                                    setLoteProveedorId("");
                                }
                            }}
                            disabled={soloLectura || Boolean(valoresIniciales?.insumo_lote_id)}
                        >
                            <option value="">Sin insumo alimenticio asociado</option>
                            {insumosLote?.filter((il) => il.activo).map((il) => (
                                <option key={il.id} value={il.id}>
                                    {il.insumo?.nombre || 'Insumo'} - Lote {il.numero_lote} ({il.marca})
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                )}

                <Form.Group className="mb-3 text-start">
                    <Form.Label className="p-1 fw-bold">Foto (Opcional)</Form.Label>
                    {!valoresIniciales?.foto_opcional && (
                        <>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                isInvalid={!!fotoError}
                            />
                            <Form.Control.Feedback type="invalid">
                                {fotoError}
                            </Form.Control.Feedback>
                        </>
                    )}
                    {fotoMostrar && (
                        <div className="mt-3 text-center">
                            <p className="small text-muted mb-1">
                                {fotoBase64 ? "Foto nueva a subir:" : "Foto actual guardada:"}
                            </p>
                            <img
                                src={fotoMostrar}
                                alt="Foto del incidente"
                                style={{ maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }}
                                className="border shadow-sm"
                            />
                            <div className="small text-muted">{obtenerNombreArchivo(fotoMostrar)}</div>
                        </div>
                    )}
                </Form.Group>

                <Button variant="secondary" type="button"
                    onClick={() => navigate("/incidentes/")}>
                    <i className="bi bi-x-circle me-1"></i>Cancelar
                </Button>
                <Button className="ms-2" variant="primary" type="submit">
                    <i className="bi bi-floppy me-1"></i> {textoBoton}
                </Button>
            </Form>
        </div>
    );
}

