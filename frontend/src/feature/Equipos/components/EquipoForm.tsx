import { Alert, Button, Form } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Sector } from '../../Sectores/types';
import { useApi } from '../../../hooks/useApi';

interface EquipoFormProps {
  textoBoton: string;
  onSubmit: (datos: { nombre: string; categoria: string; ubicacion: string; sector_id: number | null }) => void;
  valoresIniciales?: { nombre: string; categoria: string; ubicacion: string; sector_id?: number | null }
}

export function EquipoForm({ textoBoton, onSubmit, valoresIniciales }: EquipoFormProps) {
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();
  const { data: sectores, error, isLoading } = useApi<Sector[]>("/sectores/")

  // Usamos useState y definimos que los valores pueden ser vacios por si se crea un nuevo equipo o que tengan un valor anterior para mostrarlos en caso de editar el insumo
  const [nombre, setNombre] = useState(valoresIniciales?.nombre || "");
  const [categoria, setCategoria] = useState(valoresIniciales?.categoria || "");
  const [ubicacion, setUbicacion] = useState(valoresIniciales?.ubicacion || "");
  const [sector, setSector] = useState(valoresIniciales?.sector_id?.toString() || "");   

  // El handleSubmit se usa para que no actualice la pagina al apretar el boton y envia a la pagina que lo utilice los datos
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidated(true);
    if (!nombre.trim()) return;
    onSubmit({
      nombre: nombre.trim(),
      categoria,
      ubicacion,
      sector_id: sector ? Number(sector) : null,
    });
  }

  return (
    <div className="col-md-6 mx-auto">
      <Form onSubmit={handleSubmit} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>
        <Form.Group className="mb-3 text-start" controlId="formNombre">
          <Form.Label className="p-1 fw-bold">Nombre del Equipo *</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Ingrese el nombre"
            value={nombre} onChange={(e) => setNombre(e.target.value)}
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
            placeholder="Ingrese la categoria"
            value={categoria} onChange={(e) => setCategoria(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3 text-start" controlId="formUbicacion">
          <Form.Label className="p-1 fw-bold">Ubicacion del Equipo</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Ingrese la ubicacion"
            value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3 text-start" controlId="formSector">
          <Form.Label className="p-1 fw-bold">Sector</Form.Label>
          <Form.Select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            disabled={isLoading}
          >
            <option value="">Sin sector asignado</option>
            {(sectores ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </Form.Select>
          {error && (
            <Alert variant="danger" className="mt-2 mb-0 py-2">
              No se pudieron cargar los sectores.
            </Alert>
          )}
        </Form.Group>

        <Button variant="secondary" type="button"
          onClick={() => navigate('/equipos')}>
          <i className="bi bi-x-circle me-1"></i>Cancelar
        </Button>
        <Button className="ms-2" variant="primary" type="submit">
          <i className="bi bi-floppy me-1"></i> {textoBoton}
        </Button>

      </Form>
    </div>
  );
}
