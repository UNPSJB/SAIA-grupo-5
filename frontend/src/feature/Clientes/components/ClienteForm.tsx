import { useState, useEffect } from 'react';
import { Button, Form, Row, Col, Card, ListGroup, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import type { NewCliente, NewDireccionCliente } from '../types';

interface ClienteFormProps {
    textoBoton: string;
    onSubmit: (datos: NewCliente, direcciones: NewDireccionCliente[]) => void;
    valoresIniciales?: NewCliente;
    direccionesIniciales?: NewDireccionCliente[];
}

interface ClienteFormData {
    razon_social: string;
    cuit: string;
    telefono: string;
    email: string;
}

export function ClienteForm({ textoBoton, onSubmit, valoresIniciales, direccionesIniciales = [] }: ClienteFormProps) {
    const navigate = useNavigate();

    const [direcciones, setDirecciones] = useState<NewDireccionCliente[]>(direccionesIniciales);
    
    const [listaProvincias, setListaProvincias] = useState<string[]>([]);
    const [listaLocalidades, setListaLocalidades] = useState<string[]>([]);
    const [cargandoLocalidades, setCargandoLocalidades] = useState(false);

    const [provincia, setProvincia] = useState("");
    const [localidad, setLocalidad] = useState("");
    const [codigoPostal, setCodigoPostal] = useState("");
    const [calleInput, setCalleInput] = useState("");
    const [descripcionInput, setDescripcionInput] = useState("");
    const [mensajeErrorDireccion, setMensajeErrorDireccion] = useState("");

    const { register, handleSubmit, formState: { errors } } = useForm<ClienteFormData>({
        defaultValues: {
            razon_social: valoresIniciales?.razon_social || "",
            cuit: valoresIniciales?.cuit || "",
            telefono: valoresIniciales?.telefono || "",
            email: valoresIniciales?.email || "",
        },
    });

    useEffect(() => {
        fetch("https://apis.datos.gob.ar/georef/api/provincias?orden=nombre&campos=nombre")
            .then(res => res.json()).then(data => {
                if (data.provincias) {
                    const nombres = data.provincias.map((p: { nombre: string }) => p.nombre);
                    setListaProvincias(nombres);
                }
            })
            .catch(() => {
                setMensajeErrorDireccion("No se pudieron cargar las provincias.");
            });
    }, []);

    useEffect(() => {
        if (!provincia) {
            setListaLocalidades([]);
            return;
        }

        setCargandoLocalidades(true);
        fetch(`https://apis.datos.gob.ar/georef/api/localidades?provincia=${encodeURIComponent(provincia)}&orden=nombre&campos=nombre&max=500`)
            .then(res => res.json()).then(data => {
                if (data.localidades) {
                    const nombres = data.localidades.map((l: { nombre: string }) => l.nombre);
                    setListaLocalidades(nombres);
                }
            })
            .catch(() => {
                setMensajeErrorDireccion("Error al cargar las localidades.");
            })
            .finally(() => {
                setCargandoLocalidades(false);
            });
    }, [provincia]);

    const handleCambioProvincia = (nuevaProv: string) => {
        setProvincia(nuevaProv);
        setLocalidad("");
    };

    const handleAgregarDireccion = () => {
        if (!provincia) {
            setMensajeErrorDireccion("Debe seleccionar una provincia.");
            return;
        }

        if (!localidad) {
            setMensajeErrorDireccion("Debe seleccionar una localidad.");
            return;
        }

        if (codigoPostal.trim() === "") {
            setMensajeErrorDireccion("El codigo postal es obligatorio.");
            return;
        }

        if (calleInput.trim() === "") {
            setMensajeErrorDireccion("La calle y altura es obligatoria.");
            return;
        }

        const nuevaDireccion: NewDireccionCliente = {
            provincia: provincia,
            localidad: localidad,
            codigo_postal: codigoPostal.trim(),
            calle_altura: calleInput.trim(),
            descripcion: descripcionInput.trim() || null,
        };

        setDirecciones([...direcciones, nuevaDireccion]);
        
        setProvincia("");
        setLocalidad("");
        setCodigoPostal("");
        setCalleInput("");
        setDescripcionInput("");
        setMensajeErrorDireccion("");
    };

    const handleEliminarDireccion = (posicionABorrar: number) => {
        const copia = [...direcciones];
        copia.splice(posicionABorrar, 1);
        setDirecciones(copia);
    };

    const onSubmitHookForm = (data: ClienteFormData) => {
        if (direcciones.length === 0) {
            setMensajeErrorDireccion("Debe ingresar al menos una direccion de entrega.");
            return;
        }

        onSubmit({
            razon_social: data.razon_social,
            cuit: data.cuit,
            telefono: data.telefono || null,
            email: data.email || null,
        }, direcciones);
    };

    return (
        <div className="col-md-7 mx-auto">
            <Form onSubmit={handleSubmit(onSubmitHookForm)} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>
                <Form.Group className="mb-3 text-start" controlId="formRazonSocial">
                    <Form.Label className="p-1 fw-bold">Razon Social *</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Ej: Supermercado Trelew"
                        {...register("razon_social", {
                            required: "La razon social es obligatoria.",
                            minLength: {
                                value: 3,
                                message: "La razon social debe tener al menos 3 caracteres."
                            }
                        })}
                        isInvalid={!!errors.razon_social}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.razon_social?.message}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3 text-start" controlId="formCuit">
                    <Form.Label className="p-1 fw-bold">CUIT *</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Ej: 30-11223344-5"
                        {...register("cuit", {
                            required: "El CUIT es obligatorio.",
                            minLength: {
                                value: 10,
                                message: "El CUIT debe tener al menos 10 caracteres."
                            }
                        })}
                        isInvalid={!!errors.cuit}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.cuit?.message}
                    </Form.Control.Feedback>
                </Form.Group>

                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3 text-start" controlId="formTelefono">
                            <Form.Label className="p-1 fw-bold">Telefono</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ej: 2804123456"
                                {...register("telefono")}
                            />
                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        <Form.Group className="mb-3 text-start" controlId="formEmail">
                            <Form.Label className="p-1 fw-bold">Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="contacto@cliente.com"
                                {...register("email")}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Card className="mt-3 mb-4 bg-light border-0">
                    <Card.Body>
                        <h6 className="fw-bold mb-3 text-secondary">Direcciones de Entrega *</h6>

                        <Row className="g-2 mb-2">
                            <Col md={4}>
                                <Form.Label className="small fw-semibold">Provincia *</Form.Label>
                                <Form.Select
                                    size="sm"
                                    value={provincia}
                                    onChange={(e) => handleCambioProvincia(e.target.value)}
                                >
                                    <option value="" disabled>Seleccione provincia</option>
                                    {listaProvincias.map((prov) => (
                                        <option key={prov} value={prov}>{prov}</option>
                                    ))}
                                </Form.Select>
                            </Col>

                            <Col md={5}>
                                <Form.Label className="small fw-semibold">Localidad *</Form.Label>
                                <Form.Select
                                    size="sm"
                                    value={localidad}
                                    disabled={!provincia || cargandoLocalidades}
                                    onChange={(e) => setLocalidad(e.target.value)}
                                >
                                    <option value="" disabled>
                                        {cargandoLocalidades 
                                            ? "Cargando localidades..." 
                                            : provincia 
                                                ? "Seleccione localidad" 
                                                : "Elija primero provincia"}
                                    </option>
                                    {listaLocalidades.map((loc, index) => (
                                        <option key={`${loc}-${index}`} value={loc}>{loc}</option>
                                    ))}
                                </Form.Select>
                            </Col>

                            <Col md={3}>
                                <Form.Label className="small fw-semibold">Cod. Postal *</Form.Label>
                                <Form.Control
                                    type="text"
                                    size="sm"
                                    placeholder="Ej: 9100"
                                    value={codigoPostal}
                                    onChange={(e) => setCodigoPostal(e.target.value)}
                                />
                            </Col>
                        </Row>

                        <Row className="align-items-end g-2">
                            <Col md={6}>
                                <Form.Label className="small fw-semibold">Calle y Altura *</Form.Label>
                                <Form.Control
                                    type="text"
                                    size="sm"
                                    placeholder="Ej: Avenida Fontana 123"
                                    value={calleInput}
                                    onChange={(e) => setCalleInput(e.target.value)}
                                />
                            </Col>
                            <Col md={5}>
                                <Form.Label className="small fw-semibold">Descripcion / Sucursal</Form.Label>
                                <Form.Control
                                    type="text"
                                    size="sm"
                                    placeholder="Ej: Deposito Central"
                                    value={descripcionInput}
                                    onChange={(e) => setDescripcionInput(e.target.value)}
                                />
                            </Col>
                            <Col xs="auto">
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    type="button"
                                    title="Agregar direccion"
                                    onClick={handleAgregarDireccion}
                                >
                                    <i className="bi bi-plus-lg"></i>
                                </Button>
                            </Col>
                        </Row>

                        {mensajeErrorDireccion !== "" && (
                            <Alert variant="danger" className="py-1 px-2 mt-2 small">
                                {mensajeErrorDireccion}
                            </Alert>
                        )}

                        <div className="mt-3">
                            {direcciones.length === 0 ? (
                                <p className="text-muted small fst-italic mb-0">No se agregaron direcciones todavia.</p>
                            ) : (
                                <ListGroup variant="flush" className="border rounded bg-white">
                                    {direcciones.map((d, index) => (
                                        <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center py-2">
                                            <div>
                                                <strong>{d.calle_altura}</strong> - {d.localidad}, {d.provincia} (CP: {d.codigo_postal})
                                                {d.descripcion ? <span className="text-muted ms-2">[{d.descripcion}]</span> : null}
                                            </div>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                type="button"
                                                onClick={() => handleEliminarDireccion(index)}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </Button>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </div>
                    </Card.Body>
                </Card>

                <Button variant="secondary" type="button" onClick={() => navigate('/clientes')}>
                    <i className="bi bi-x-circle me-1"></i> Cancelar
                </Button>
                <Button className="ms-2" variant="primary" type="submit">
                    <i className="bi bi-floppy me-1"></i> {textoBoton}
                </Button>
            </Form>
        </div>
    );
}