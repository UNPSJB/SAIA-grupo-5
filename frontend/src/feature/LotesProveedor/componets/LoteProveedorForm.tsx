import React, { useState } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../hooks/useApi';
import type { Proveedor } from '../../Proveedores/types';
import type { NewLoteProveedor } from '../types';
import type { PedidoProveedor } from '../../PedidosProveedor/types';

interface LoteProveedorFormProps {
    textoBoton: string;
    onSubmit: (datos: NewLoteProveedor) => void;
    valoresIniciales?: Partial<NewLoteProveedor>;
    isEdit?: boolean;
}

interface LoteProveedorFormData {
    proveedor_id: number;
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
    const { data: pedidos } = useApi<PedidoProveedor[]>('/pedidos-proveedor/');
    const [pedidoId, setPedidoId] = useState<string>('');
    const [pedidoError, setPedidoError] = useState<string | null>(null);

    const hoy = new Date().toISOString().split('T')[0];

    const { register, handleSubmit, watch, formState: { errors } } = useForm<LoteProveedorFormData>({
        defaultValues: {
            proveedor_id: valoresIniciales?.proveedor_id || undefined,
            numero_remito: valoresIniciales?.numero_remito || '',
            fecha_recepcion: valoresIniciales?.fecha_recepcion || hoy,
        },
    });

    const proveedorSeleccionadoId = watch('proveedor_id');

    const pedidosPendientes = (pedidos ?? []).filter(
        (p) =>
            p.activo &&
            p.estado === 'pendiente' &&
            String(p.proveedor_id) === String(proveedorSeleccionadoId)
    );

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
        if (!isEdit && !pedidoId) {
            setPedidoError("Debe seleccionar un pedido pendiente.");
            return;
        }

        onSubmit({
            proveedor_id: Number(data.proveedor_id),
            pedido_id: Number(pedidoId),
            numero_remito: data.numero_remito?.trim() ? data.numero_remito.trim() : null,
            fecha_recepcion: data.fecha_recepcion,
            archivo_adjunto: archivoBase64,
        });
    };

    const proveedoresActivos = proveedores?.filter((p) => p.activo) || [];
    const esImagen = archivoBase64?.startsWith("data:image/");

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
                                onChange: () => {
                                    setPedidoId("");
                                    setPedidoError(null);
                                },
                            })}
                            isInvalid={!!errors.proveedor_id}
                        >
                            <option value="">Seleccione un proveedor...</option>
                            {proveedoresActivos.map((prov) => {
                                const sinHabilitacion = !prov.numero_habilitacion || !prov.vencimiento_habilitacion;
                                const vencida = Boolean(
                                    prov.vencimiento_habilitacion && prov.vencimiento_habilitacion < hoy
                                );
                                const noApto = sinHabilitacion || vencida;

                                return (
                                    <option key={prov.id} value={prov.id} disabled={noApto}>
                                        {prov.nombre} (CUIT: {prov.cuit})
                                        {sinHabilitacion ? " - [Sin Habilitacion]" : vencida ? " - [Habilitacion Vencida]" : ""}
                                    </option>
                                );
                            })}
                        </Form.Select>
                    )}
                    <Form.Control.Feedback type="invalid">{errors.proveedor_id?.message}</Form.Control.Feedback>
                </Form.Group>

                {!isEdit && (
                    <Form.Group className="mb-3 text-start" controlId="formPedidoAsociado">
                        <Form.Label className="p-1 fw-bold">Pedido Asociado *</Form.Label>
                        <Form.Select
                            value={pedidoId}
                            onChange={(e) => {
                                setPedidoId(e.target.value);
                                setPedidoError(null);
                            }}
                            disabled={!proveedorSeleccionadoId || pedidosPendientes.length === 0}
                            isInvalid={!!pedidoError}
                        >
                            <option value="">
                                {!proveedorSeleccionadoId
                                    ? "Seleccione primero un proveedor..."
                                    : pedidosPendientes.length === 0
                                    ? "Este proveedor no tiene pedidos pendientes"
                                    : "Seleccione un pedido pendiente..."}
                            </option>
                            {pedidosPendientes.map((ped) => (
                                <option key={ped.id} value={ped.id}>
                                    Pedido #{ped.id} — {ped.fecha_pedido.split("-").reverse().join("/")} ({ped.items.length}{" "}
                                    {ped.items.length === 1 ? "insumo" : "insumos"})
                                </option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">{pedidoError}</Form.Control.Feedback>
                        {pedidoId && (
                            <Form.Text className="text-success fw-semibold">
                                Al registrar esta recepcion, el Pedido #{pedidoId} pasara automaticamente a estado Recibido.
                            </Form.Text>
                        )}
                    </Form.Group>
                )}

                <div className="row">
                    <div className="col-md-6">
                        <Form.Group className="mb-3 text-start" controlId="formNumeroRemito">
                            <Form.Label className="p-1 fw-bold">Numero de Remito *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ej: R-0001-00008899"
                                {...register("numero_remito", {
                                    required: "El numero de remito es obligatorio",
                                    maxLength: { value: 100, message: "Maximo 100 caracteres." },
                                    validate: (v) => v.trim() !== "" || "No puede ser solo espacios en blanco.",
                                })}
                                isInvalid={!!errors.numero_remito}
                            />
                            <Form.Control.Feedback type="invalid">{errors.numero_remito?.message}</Form.Control.Feedback>
                        </Form.Group>
                    </div>

                    <div className="col-md-6">
                        <Form.Group className="mb-3 text-start" controlId="formFechaRecepcion">
                            <Form.Label className="p-1 fw-bold">Fecha de Recepcion *</Form.Label>
                            <Form.Control
                                type="date"
                                max={hoy}
                                {...register("fecha_recepcion", {
                                    required: "La fecha de recepcion es obligatoria.",
                                    validate: (v) => v <= hoy || "La fecha de recepcion no puede ser futura.",
                                })}
                                isInvalid={!!errors.fecha_recepcion}
                            />
                            <Form.Control.Feedback type="invalid">{errors.fecha_recepcion?.message}</Form.Control.Feedback>
                        </Form.Group>
                    </div>
                </div>

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

                {archivoBase64 && (
                    <div className="mt-2 mb-3 p-3 border rounded bg-light text-center">
                        <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                            <span className="small text-muted fw-semibold">
                                {valoresIniciales?.archivo_adjunto === archivoBase64 ? "Archivo actual cargado:" : "Archivo seleccionado:"}
                            </span>
                            <Button 
                                variant="outline-danger" 
                                size="sm" 
                                onClick={() => setArchivoBase64(null)}
                                title="Quitar archivo"
                            >
                                <i className="bi bi-trash me-1"></i>Quitar
                            </Button>
                        </div>

                        {esImagen ? (
                            <div>
                                <img
                                    src={archivoBase64}
                                    alt="Comprobante Remito"
                                    style={{ maxHeight: '180px', borderRadius: '8px', objectFit: 'contain' }}
                                    className="border shadow-sm p-1 bg-white"
                                />
                                <div className="small text-muted mt-2 fw-semibold">
                                    {obtenerNombreArchivo(archivoBase64)}
                                </div>
                            </div>
                        ) : (
                            <div className="p-2 px-3 border rounded bg-white d-inline-flex align-items-center gap-2 shadow-sm">
                                <i className="bi bi-file-earmark-pdf-fill text-danger fs-3"></i>
                                <span className="fw-semibold small">{obtenerNombreArchivo(archivoBase64)}</span>
                                <a
                                    href={archivoBase64}
                                    download={obtenerNombreArchivo(archivoBase64)}
                                    className="btn btn-outline-primary btn-sm ms-2"
                                >
                                    <i className="bi bi-download me-1"></i>Ver / Descargar
                                </a>
                            </div>
                        )}
                    </div>
                )}

                <div className="d-flex justify-content-start gap-2 mt-4">
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