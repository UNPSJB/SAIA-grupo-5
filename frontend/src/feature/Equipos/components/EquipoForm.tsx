import { Alert, Button, Col, Form, Row } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Sector } from '../../Sectores/types';
import { useApi } from '../../../hooks/useApi';
import type { NewEquipo } from '../types';
import { AppSwitch } from '../../../components/AppSwitch';

interface EquipoFormProps {
  textoBoton: string;
  onSubmit: (datos: NewEquipo) => void;
  valoresIniciales?: {
    nombre: string;
    categoria: string;
    ubicacion: string;
    sector_id?: number;
    controla_temperatura?: boolean;
    temperatura_minima?: number | null;
    temperatura_maxima?: number | null;
  };
}

export function EquipoForm({ textoBoton, onSubmit, valoresIniciales }: EquipoFormProps) {
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();
  const { data: sectores, error, isLoading } = useApi<Sector[]>('/sectores/');

  const [nombre, setNombre] = useState(valoresIniciales?.nombre || '');
  const [categoria, setCategoria] = useState(valoresIniciales?.categoria || '');
  const [ubicacion, setUbicacion] = useState(valoresIniciales?.ubicacion || '');
  const [sector, setSector] = useState(valoresIniciales?.sector_id?.toString() || '');
  const [controlaTemperatura, setControlaTemperatura] = useState(Boolean(valoresIniciales?.controla_temperatura));
  
  const [temperaturaMinima, setTemperaturaMinima] = useState(
    valoresIniciales?.temperatura_minima !== null && valoresIniciales?.temperatura_minima !== undefined
      ? String(valoresIniciales.temperatura_minima)
      : ''
  );
  const [temperaturaMaxima, setTemperaturaMaxima] = useState(
    valoresIniciales?.temperatura_maxima !== null && valoresIniciales?.temperatura_maxima !== undefined
      ? String(valoresIniciales.temperatura_maxima)
      : ''
  );

  const minNum = temperaturaMinima === '' ? NaN : Number(temperaturaMinima);
  const maxNum = temperaturaMaxima === '' ? NaN : Number(temperaturaMaxima);
  const rangoInvalido = controlaTemperatura && (isNaN(minNum) || isNaN(maxNum) || minNum >= maxNum);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidated(true);
    if (!nombre.trim() || !sector) return;
    if (rangoInvalido) return;

    onSubmit({
      nombre: nombre.trim(),
      categoria,
      ubicacion,
      sector_id: Number(sector),
      controla_temperatura: controlaTemperatura,
      temperatura_minima: controlaTemperatura ? minNum : null,
      temperatura_maxima: controlaTemperatura ? maxNum : null,
    });
  };

  return (
    <div className="col-md-6 mx-auto">
      <Form onSubmit={handleSubmit} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>
        <Form.Group className="mb-3 text-start" controlId="formNombre">
          <Form.Label className="p-1 fw-bold">Nombre del Equipo *</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Ingrese el nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            isInvalid={validated && !nombre.trim()}
          />
          <Form.Control.Feedback type="invalid">
            El nombre del equipo es obligatorio.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3 text-start" controlId="formCategoria">
          <Form.Label className="p-1 fw-bold">Categoria del Equipo</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Ej: Camara frigorifica, Freezer, Horno"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3 text-start" controlId="formUbicacion">
          <Form.Label className="p-1 fw-bold">Ubicacion del Equipo</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Ingrese la ubicacion"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3 text-start" controlId="formSector">
          <Form.Label className="p-1 fw-bold">Sector *</Form.Label>
          <Form.Select
            required
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            disabled={isLoading}
            isInvalid={validated && !sector}
          >
            <option value="">Seleccione un sector</option>
            {(sectores ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            El sector del equipo es obligatorio.
          </Form.Control.Feedback>
          {error && (
            <Alert variant="danger" className="mt-2 mb-0 py-2">
              No se pudieron cargar los sectores.
            </Alert>
          )}
        </Form.Group>

        <div className="p-3 mb-3 border rounded bg-light-subtle text-start">
          <AppSwitch
            id="switch-controla-temperatura"
            label={<strong>Controla temperatura (Cadena de frio / termica)</strong>}
            checked={controlaTemperatura}
            onChange={(e) => setControlaTemperatura(e.target.checked)}
          />

          {controlaTemperatura && (
            <Row className="mt-3 g-2">
              <Col sm={6}>
                <Form.Group controlId="formTempMin">
                  <Form.Label className="small fw-bold">Temperatura minima (C) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    placeholder="Ej: 0"
                    value={temperaturaMinima}
                    onChange={(e) => setTemperaturaMinima(e.target.value)}
                    isInvalid={validated && (isNaN(minNum) || (!isNaN(maxNum) && minNum >= maxNum))}
                  />
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group controlId="formTempMax">
                  <Form.Label className="small fw-bold">Temperatura maxima (C) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    placeholder="Ej: 5"
                    value={temperaturaMaxima}
                    onChange={(e) => setTemperaturaMaxima(e.target.value)}
                    isInvalid={validated && (isNaN(maxNum) || (!isNaN(minNum) && minNum >= maxNum))}
                  />
                </Form.Group>
              </Col>
              {validated && rangoInvalido && (
                <Col xs={12}>
                  <p className="text-danger small mb-0 mt-1">
                    Debe definir ambas temperaturas y la minima debe ser menor que la maxima.
                  </p>
                </Col>
              )}
            </Row>
          )}
        </div>

        <Button variant="secondary" type="button" onClick={() => navigate('/equipos')}>
          <i className="bi bi-x-circle me-1"></i>Cancelar
        </Button>
        <Button className="ms-2" variant="primary" type="submit">
          <i className="bi bi-floppy me-1"></i> {textoBoton}
        </Button>
      </Form>
    </div>
  );
}
