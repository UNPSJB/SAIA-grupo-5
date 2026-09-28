import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../hooks/useAuth'; 
import { useEffect } from 'react';
import { useApi } from '../../../hooks/useApi'; 
import type { TareaOcurrencia } from '../types';
import type { InsumoQuimico } from '../../InsumosQuimicos/types';
import { mostrarAlertaError, mostrarAlertaExito } from '../../../libs/alertas';

interface CompletarTareaModalProps {
    tarea: TareaOcurrencia | null;
    onHide: () => void;
    onCompleted: () => void; 
}

interface CompletarTareaFormData {
    insumo_quimico_id: string;
    cantidad_consumida: string;
    observacion: string;
}

export function CompletarTareaModal({ tarea, onHide, onCompleted }: CompletarTareaModalProps) {
    const { api, currentUser } = useAuth();
    const esEdicion = tarea?.estado === 'Completada';
    
    const { data: insumos } = useApi<InsumoQuimico[]>("/insumos-quimicos/");
    const insumosActivos = insumos?.filter(insumo => insumo.activo) || [];        // Sirve para filtrar y mostrar los insumos quimicos que esten activos

    const [fotoBase64, setFotoBase64] = useState<string | null>(null);      // Lo usamos para guardar la foto en formato texto
    const [fotoError, setFotoError] = useState<string | null>(null);        // Lo usamos para guardar el texto de error si no subio la foto y era obligatoria     
    const [cargando, setCargando] = useState(false);        // Sirve para controlar que el usuario no mande que realizo la tarea muchas veces en poco tiempo

    const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<CompletarTareaFormData>({
        defaultValues: {
            insumo_quimico_id: "",
            cantidad_consumida: "",
            observacion: ""
        }
    });

    useEffect(() => {
        if (tarea) {
            reset({
                insumo_quimico_id: tarea.insumo_quimico_id ? tarea.insumo_quimico_id.toString() : "",
                cantidad_consumida: tarea.cantidad_consumida ? tarea.cantidad_consumida.toString() : "",
                observacion: tarea.observacion ? tarea.observacion : ""
            });
        }
    }, [tarea, reset]);

    const insumoSeleccionado = watch("insumo_quimico_id");      // El watch sirve para ver el valor constantemente de InsumoSeleccionado, en el caso de que tenga valor se muestra la opcion de cuanta cantidad uso del insumo

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {      // Las imagenes las tenemos que manejar con useState
        setFotoError(null);
        const file = e.target.files?.[0];       // Cuando el usuario elige algun archivo, el navegador devuelve un arreglo y agarramos la primer posicion
        if (!file) {        // Si el usuario abrio la ventana para buscar una foto y apreto cancelar sin elegir nada limpiamos el estado de la foto
            setFotoBase64(null);
            return;
        }

        const reader = new FileReader();        // Es una herramienta del navegador que sabe leer archivos
        reader.readAsDataURL(file);     // Es una funcion que le indica a la herramienta que tiene que traducir la foto a Base64
        reader.onload = () => {     // Indica que cuando termine de leer el archivo entre y guarde el resultado en fotoBase64
            setFotoBase64(reader.result as string);
        };
        reader.onerror = () => {        // Si hubo algun problema con el archivo guardamos el error
            setFotoError("Ocurrio un problema al cargar la foto.");
        };
    };

    const onSubmit = async (data: CompletarTareaFormData) => {
        if (!tarea || !currentUser) return;     // Si se apreta el boton de marcar como realizada sin que haya una tarea o sin que alguien este logeado se cancela todo

        if (tarea.foto_obligatoria_snap && !fotoBase64 && !tarea.foto_evidencia) {       // Si la foto de evidencia es obligatoria y no subio ninguna se guarda el error
            setFotoError("La foto de evidencia es obligatoria para esta tarea.");
            return;
        }

        setCargando(true);      // Se pone el cargando en verdadero para deshabilitar los botones

        try {
            const datos = {
                operario_id: currentUser?.id, // Esto guarda quien hizo la tarea
                foto_evidencia: fotoBase64 ? fotoBase64 : (tarea?.foto_evidencia || null),
                insumo_quimico_id: data.insumo_quimico_id ? parseInt(data.insumo_quimico_id) : null,
                cantidad_consumida: data.cantidad_consumida ? parseFloat(data.cantidad_consumida) : null,
                observacion: data.observacion ? data.observacion.trim() : null
            };

            await api.put(`/tareas-ocurrencia/${tarea.id}/completar`, datos);
            
            mostrarAlertaExito(esEdicion ? 'La tarea se edito correctamente.': 'La tarea se marco como realizada correctamente.');
            onCompleted();
        } catch (error: any) {
            const mensajeBackend = error.response?.data?.detail;
            const mensajeFinal = mensajeBackend || `No se pudo marcar como realizada la tarea '${tarea.tarea_nombre_snap}'.`;
            mostrarAlertaError(mensajeFinal);
            console.log(error);
        } finally {
            setCargando(false);
            handleClose();     
        }
    };

    const handleClose = () => {
        reset();
        setFotoBase64(null);
        setFotoError(null);
        onHide();
    };

    return (
        <Modal show={!!tarea} onHide={handleClose} >
            <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Modal.Header closeButton>
                    <Modal.Title>{esEdicion ? "Editar tarea completada" : "Completar Tarea"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>Tarea:</strong> {tarea?.tarea_nombre_snap}</p>
                    <hr />
                    <Form.Group className="mb-3 text-start">
                        <Form.Label className="p-1 fw-bold">
                            Foto de Evidencia {tarea?.foto_obligatoria_snap ? '*' : '(Opcional)'}
                        </Form.Label>

                        <Form.Control 
                            type="file" 
                            accept="image/*"        // Obliga a la ventana a mostrar solo imagenes
                            onChange={handleFileChange} 
                            isInvalid={!!fotoError}
                        />
                        <Form.Control.Feedback type="invalid">
                            {fotoError}
                        </Form.Control.Feedback>
                        {(fotoBase64 || tarea?.foto_evidencia) && (
                            <div className="mt-3 text-center">
                                <p className="small text-muted mb-1">
                                    {fotoBase64 ? "Foto nueva a subir:" : "Foto actual guardada:"}
                                </p>
                                <img
                                    src={fotoBase64 || tarea?.foto_evidencia || ""} 
                                    alt="Evidencia de limpieza" 
                                    style={{ maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }} 
                                    className="border shadow-sm"
                                />
                            </div>
                        )}
                    </Form.Group>

                    <hr />

                    <Form.Group className="mb-3 text-start" controlId="formObservacion">
                        <Form.Label className="p-1 fw-bold">Observacion (Opcional)</Form.Label>
                        <Form.Control as="textarea"
                            {...register("observacion", {
                            maxLength: {
                                value: 500,
                                message: "La observacion no puede superar los 500 caracteres."
                            },
                            validate: (value) => !value || value.trim() !== "" || "La observacion no puede ser solo espacios en blanco."
                            })}
                            isInvalid={!!errors.observacion}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.observacion?.message}
                        </Form.Control.Feedback>
                </Form.Group>
                {/* 
                    <hr />

                    <h5 className="mb-3">Consumo de Quimicos (Opcional)</h5>
                    <Form.Group className="mb-3 text-start" controlId="formInsumoId">
                        <Form.Label className="p-1 fw-bold">Insumo utilizado</Form.Label>
                        <Form.Select 
                            {...register("insumo_quimico_id")}
                            isInvalid={!!errors.insumo_quimico_id}
                        >
                            <option value="">Ninguno</option>
                            {insumosActivos.map(insumo => (
                                <option key={insumo.id} value={insumo.id.toString()}>
                                    {insumo.nombre} ({insumo.unidad_medida})
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    {insumoSeleccionado && (
                        <Form.Group className="mb-3 text-start" controlId="formCantidad">
                            <Form.Label className="p-1 fw-bold">Cantidad Consumida *</Form.Label>
                            <Form.Control 
                                type="number" 
                                step="0.01"     // Se agrega esto porque si queres agregar un numero con coma te tira error
                                placeholder="Ej: 2.5" 
                                {...register("cantidad_consumida", {
                                    required: "Debes ingresar una cantidad si seleccionaste un insumo.",
                                    validate: (value) => parseFloat(value) > 0 || "La cantidad debe ser mayor a 0."
                                })}
                                isInvalid={!!errors.cantidad_consumida}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.cantidad_consumida?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                    )}
                */}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={cargando}>
                        <i className="bi bi-x-circle me-1"></i>Cancelar
                    </Button>
                    <Button variant="primary" type="submit" disabled={cargando}>
                        <i className="bi bi-floppy me-1"></i> {esEdicion ? "Guardar cambios" : "Marcar realizada"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}