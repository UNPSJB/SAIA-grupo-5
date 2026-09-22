import { Alert, Badge, Button, Form } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Sector } from '../../Sectores/types';
import type { Superficie } from '../../Superficies/types';
import { useApi } from '../../../hooks/useApi';
import { SeleccionarSectoresModal } from './SeleccionarSectoresModal';
import { SeleccionarSuperficiesModal } from './SeleccionarSuperficiesModal';

interface PlanLimpiezaFormProps {
  textoBoton: string;
  onSubmit: (datos: { nombre: string; descripcion: string | null; sector_ids: number[]; superficie_ids: number[] }) => void;
  valoresIniciales?: { nombre: string; descripcion: string | null; sector_ids?: number[]; superficie_ids?: number[] }
}

export function PlanLimpiezaForm({ textoBoton, onSubmit, valoresIniciales }: PlanLimpiezaFormProps) {
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();
  const { data: sectores, error: errorSectores, isLoading: isLoadingSectores } = useApi<Sector[]>("/sectores/")
  const { data: superficies, error: errorSuperficies, isLoading: isLoadingSuperficies } = useApi<Superficie[]>("/superficies/")

  // Usamos useState y definimos que los valores pueden ser vacios por si se crea un nuevo plan o que tengan un valor anterior para mostrarlos en caso de editar
  const [nombre, setNombre] = useState(valoresIniciales?.nombre || "");
  const [descripcion, setDescripcion] = useState(valoresIniciales?.descripcion || "");
  // Sector y Superficie son relaciones N-N acá, no se vincula un Equipo desde este form (esa relacion se maneja desde Equipos)
  const [sectorIds, setSectorIds] = useState<string[]>(valoresIniciales?.sector_ids?.map(String) || []);
  const [superficieIds, setSuperficieIds] = useState<string[]>(valoresIniciales?.superficie_ids?.map(String) || []);
  const [showSectoresModal, setShowSectoresModal] = useState(false);
  const [showSuperficiesModal, setShowSuperficiesModal] = useState(false);

  const toggleSector = (id: string, checked: boolean) => {
    setSectorIds((prev) => checked ? [...prev, id] : prev.filter((s) => s !== id));
  };

  const toggleSuperficie = (id: string, checked: boolean) => {
    setSuperficieIds((prev) => checked ? [...prev, id] : prev.filter((s) => s !== id));
  };

  // El handleSubmit se usa para que no actualice la pagina al apretar el boton y envia a la pagina que lo utilice los datos
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidated(true);
    if (!nombre.trim()) return;
    onSubmit({
      nombre: nombre.trim(),
      descripcion: descripcion.trim() ? descripcion.trim() : null,
      sector_ids: sectorIds.map(Number),
      superficie_ids: superficieIds.map(Number),
    });
  }

  return (
    <div className="col-md-6 mx-auto">
      <Form onSubmit={handleSubmit} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>
        <Form.Group className="mb-3 text-start" controlId="formNombre">
          <Form.Label className="p-1 fw-bold">Nombre del Plan de Limpieza *</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Ingrese el nombre"
            value={nombre} onChange={(e) => setNombre(e.target.value)}
            isInvalid={validated && !nombre.trim()}
          />
          <Form.Control.Feedback type="invalid">
            El nombre del plan de limpieza es obligatorio.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3 text-start" controlId="formDescripcion">
          <Form.Label className="p-1 fw-bold">Descripción</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Ingrese una descripción (opcional)"
            value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3 text-start">
          <Form.Label className="p-1 fw-bold d-block">Sectores</Form.Label>
          <Button
            variant="outline-primary"
            size="sm"
            type="button"
            disabled={isLoadingSectores}
            onClick={() => setShowSectoresModal(true)}
          >
            <i className="bi bi-plus-lg me-1"></i>Agregar Sector
          </Button>
          <div className="mt-2">
            {(sectores ?? [])
              .filter((s) => sectorIds.includes(String(s.id)))
              .map((s) => (
                <Badge key={s.id} bg="secondary" className="me-1">
                  {s.nombre}
                </Badge>
              ))}
          </div>
          {errorSectores && (
            <Alert variant="danger" className="mt-2 mb-0 py-2">
              No se pudieron cargar los sectores.
            </Alert>
          )}
        </Form.Group>

        <Form.Group className="mb-3 text-start">
          <Form.Label className="p-1 fw-bold d-block">Superficies</Form.Label>
          <Button
            variant="outline-primary"
            size="sm"
            type="button"
            disabled={isLoadingSuperficies}
            onClick={() => setShowSuperficiesModal(true)}
          >
            <i className="bi bi-plus-lg me-1"></i>Agregar Superficie
          </Button>
          <div className="mt-2">
            {(superficies ?? [])
              .filter((s) => superficieIds.includes(String(s.id)))
              .map((s) => (
                <Badge key={s.id} bg="secondary" className="me-1">
                  {s.nombre}
                </Badge>
              ))}
          </div>
          {errorSuperficies && (
            <Alert variant="danger" className="mt-2 mb-0 py-2">
              No se pudieron cargar las superficies.
            </Alert>
          )}
        </Form.Group>

        <Button variant="secondary" type="button"
          onClick={() => navigate('/planes-limpieza')}>
          <i className="bi bi-x-circle me-1"></i>Cancelar
        </Button>
        <Button className="ms-2" variant="primary" type="submit">
          <i className="bi bi-floppy me-1"></i> {textoBoton}
        </Button>
      </Form>
      <SeleccionarSectoresModal
        show={showSectoresModal}
        sectores={sectores ?? []}
        selectedIds={sectorIds}
        onToggle={toggleSector}
        onHide={() => setShowSectoresModal(false)}
      />
      <SeleccionarSuperficiesModal
        show={showSuperficiesModal}
        superficies={superficies ?? []}
        selectedIds={superficieIds}
        onToggle={toggleSuperficie}
        onHide={() => setShowSuperficiesModal(false)}
      />
    </div>
  );
}
