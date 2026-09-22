import { Alert, Badge, Button, Form } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Sector } from '../../Sectores/types';
import type { PlanLimpieza } from '../../PlanesLimpieza/types';
import { useApi } from '../../../hooks/useApi';
import { SeleccionarSectoresModal } from './SeleccionarSectoresModal';
import { SeleccionarPlanesModal } from './SeleccionarPlanesModal';

interface SuperficieFormProps {
  textoBoton: string;
  onSubmit: (datos: { nombre: string; tipo_contacto: string; sector_ids: number[]; plan_limpieza_ids: number[] }) => void;
  valoresIniciales?: { nombre: string; tipo_contacto: string; sector_ids?: number[]; plan_limpieza_ids?: number[] }
}

export function SuperficieForm({ textoBoton, onSubmit, valoresIniciales }: SuperficieFormProps) {
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();
  const { data: sectores, error: errorSectores, isLoading: isLoadingSectores } = useApi<Sector[]>("/sectores/")
  const { data: planesLimpieza, error: errorPlanes, isLoading: isLoadingPlanes } = useApi<PlanLimpieza[]>("/planes-limpieza/")

  // Usamos useState y definimos que los valores pueden ser vacios por si se crea una nueva superficie o que tengan un valor anterior para mostrarlos en caso de editar
  const [nombre, setNombre] = useState(valoresIniciales?.nombre || "");
  const [tipoContacto, setTipoContacto] = useState(valoresIniciales?.tipo_contacto || "");
  // Sector y Plan de Limpieza son relaciones N-N acá (a diferencia de Equipos, que es 1 solo valor), por eso son arrays de ids
  const [sectorIds, setSectorIds] = useState<string[]>(valoresIniciales?.sector_ids?.map(String) || []);
  const [planIds, setPlanIds] = useState<string[]>(valoresIniciales?.plan_limpieza_ids?.map(String) || []);
  const [showSectoresModal, setShowSectoresModal] = useState(false);
  const [showPlanesModal, setShowPlanesModal] = useState(false);

  const toggleSector = (id: string, checked: boolean) => {
    setSectorIds((prev) => checked ? [...prev, id] : prev.filter((s) => s !== id));
  };

  const togglePlan = (id: string, checked: boolean) => {
    setPlanIds((prev) => checked ? [...prev, id] : prev.filter((p) => p !== id));
  };

  // El handleSubmit se usa para que no actualice la pagina al apretar el boton y envia a la pagina que lo utilice los datos
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidated(true);
    if (!nombre.trim() || !tipoContacto.trim()) return;
    onSubmit({
      nombre: nombre.trim(),
      tipo_contacto: tipoContacto.trim(),
      sector_ids: sectorIds.map(Number),
      plan_limpieza_ids: planIds.map(Number),
    });
  }

  return (
    <div className="col-md-6 mx-auto">
      <Form onSubmit={handleSubmit} className="p-4 border rounded bg-white shadow-sm mt-3" noValidate>
        <Form.Group className="mb-3 text-start" controlId="formNombre">
          <Form.Label className="p-1 fw-bold">Nombre de la Superficie *</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Ingrese el nombre"
            value={nombre} onChange={(e) => setNombre(e.target.value)}
            isInvalid={validated && !nombre.trim()}
          />
          <Form.Control.Feedback type="invalid">
            El nombre de la superficie es obligatorio.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3 text-start" controlId="formTipoContacto">
          <Form.Label className="p-1 fw-bold">Tipo de Contacto *</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Ej: directo, indirecto"
            value={tipoContacto} onChange={(e) => setTipoContacto(e.target.value)}
            isInvalid={validated && !tipoContacto.trim()}
          />
          <Form.Control.Feedback type="invalid">
            El tipo de contacto es obligatorio.
          </Form.Control.Feedback>
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
          <Form.Label className="p-1 fw-bold d-block">Planes de Limpieza</Form.Label>
          <Button
            variant="outline-primary"
            size="sm"
            type="button"
            disabled={isLoadingPlanes}
            onClick={() => setShowPlanesModal(true)}
          >
            <i className="bi bi-plus-lg me-1"></i>Agregar Plan
          </Button>
          <div className="mt-2">
            {(planesLimpieza ?? [])
              .filter((p) => planIds.includes(String(p.id)))
              .map((p) => (
                <Badge key={p.id} bg="secondary" className="me-1">
                  {p.nombre}
                </Badge>
              ))}
          </div>
          {errorPlanes && (
            <Alert variant="danger" className="mt-2 mb-0 py-2">
              No se pudieron cargar los planes de limpieza.
            </Alert>
          )}
        </Form.Group>

        <Button variant="secondary" type="button"
          onClick={() => navigate('/superficies')}>
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
      <SeleccionarPlanesModal
        show={showPlanesModal}
        planesLimpieza={planesLimpieza ?? []}
        selectedIds={planIds}
        onToggle={togglePlan}
        onHide={() => setShowPlanesModal(false)}
      />
    </div>
  );
}
