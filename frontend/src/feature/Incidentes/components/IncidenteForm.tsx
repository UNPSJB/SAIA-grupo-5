import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../hooks/useApi';
import React, { useState } from 'react';

interface IncidenteFormProps {
    textoBoton: string;
    onSubmit: (datos: { nombre: string, descripcion: string, tipo_id: number, sector_id: number | null,  foto_opcional: string | null }) => void;
    valoresIniciales?: { nombre: string, descripcion: string, tipo_id: number, sector_id: number | null, 
        foto_opcional: string | null, fecha_abierto: string, fecha_cierre: string | null };
    soloLectura?: boolean;
}

interface IncidenteFormData { nombre: string; descripcion: string; tipo_id: number; sector_id: number | null; }

export function IncidenteForm({ textoBoton, onSubmit, valoresIniciales, soloLectura }: IncidenteFormProps) {
    const navigate = useNavigate();
    const [fotoBase64, setFotoBase64] = useState<string | null>(null);
    const [fotoError, setFotoError] = useState<string | null>(null);
    const { data: tipos } = useApi('/tipos-incidentes/');
    const [tipoIncidenteId, setTipoIncidenteId] = useState(valoresIniciales?.tipo_id?.toString() || "");
    const { data: sectores } = useApi('/sectores/');
    const [sectorId, setSectorId] = useState(valoresIniciales?.sector_id?.toString() || "");


    const {register, handleSubmit, formState: { errors }, } = useForm<IncidenteFormData> ({
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
        if (!file){        
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
                    {...register("descripcion",{
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
                >
                    <option value="">Seleccione un sector</option>

                    {sectores?.filter((sector) => sector.activo).map((sector) => (
                        <option key={sector.id} value={sector.id}>
                            {sector.nombre}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3 text-start">
                <Form.Label className="p-1 fw-bold">Foto (Opcional)</Form.Label>
                {!valoresIniciales ? (
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
                ) : (
                    <div className="p-2 border rounded bg-light d-inline-block">
                        <i className="bi bi-file-earmark-pdf text-danger me-2"></i>
                        <span>Foto cargada correctamente</span>
                    </div>
                )}
                {fotoMostrar && (
                    <div className="mt-3 text-center">
                        <p className="small text-muted mb-1">
                            {fotoBase64 ? "Foto nueva a subir:" : "Foto actual guardada:"}
                        </p>
                        <img
                            src={fotoMostrar}
                            alt="Foto del incidente"
                            style={{ maxHeight: "150px", maxWidth: "100%", borderRadius: "8px", objectFit: "cover", }}
                            className="border shadow-sm"
                        />
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

