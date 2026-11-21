import { Badge, Button, Card, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useApi, useAuth } from '../../../hooks';
import type { IncidenteSeguimiento } from '../types';

interface ListaIncidentesVinculadosProps {
    loteProduccionId?: number;
    loteProveedorId?: number;
    insumoLoteId?: number;
}

export function ListaIncidentesVinculados({loteProduccionId, loteProveedorId, insumoLoteId}: ListaIncidentesVinculadosProps) {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const query = loteProduccionId
        ? `/incidentes?lote_produccion_id=${loteProduccionId}`
        : loteProveedorId
        ? `/incidentes?lote_proveedor_id=${loteProveedorId}`
        : insumoLoteId
        ? `/incidentes?insumo_lote_id=${insumoLoteId}`
        : null;

    const { data: incidentes } = useApi<IncidenteSeguimiento[]>(query);
    const activos = (incidentes ?? []).filter((incidente) => incidente.activo);

    const irAReportar = () => {
        navigate('/incidentes/new', {
            state: {
                lote_produccion_id: loteProduccionId,
                lote_proveedor_id: loteProveedorId,
                insumo_lote_id: insumoLoteId,
            },
        });
    };

    return (
        <Card className="shadow-sm border-0 mb-4 rounded-3 text-start">
            <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">
                        <i className="bi bi-exclamation-diamond me-2 text-warning"></i>
                        Incidentes de Calidad Vinculados
                    </h5>
                    {(currentUser?.operar || currentUser?.supervisor) && (
                        <Button variant="outline-danger" size="sm" onClick={irAReportar}>
                            <i className="bi bi-plus-circle me-1"></i>Reportar incidente
                        </Button>
                    )}
                </div>

                {activos.length === 0 ? (
                    <p className="text-muted small mb-0">
                        No hay incidentes registrados para este registro.
                    </p>
                ) : (
                    <Table responsive bordered hover size="sm" className="mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Titulo</th>
                                <th>Tipo</th>
                                <th>Fecha</th>
                                <th>Estado</th>
                                <th className="text-center">Accion</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activos.map((incidente) => (
                                <tr key={incidente.id}>
                                    <td className="fw-semibold">{incidente.nombre}</td>
                                    <td>{incidente.tipo?.nombre || '-'}</td>
                                    <td className="small">
                                        {new Date(incidente.fecha_abierto).toLocaleDateString('es-AR')}
                                    </td>
                                    <td>
                                        <Badge bg={incidente.estado === 'Cerrado' ? 'success' : 'warning'} text={incidente.estado === 'Cerrado' ? undefined : 'dark'}>
                                            {incidente.estado}
                                        </Badge>
                                    </td>
                                    <td className="text-center">
                                        <Button
                                            variant="outline-info"
                                            size="sm"
                                            onClick={() => navigate(`/incidentes/${incidente.id}`)}
                                            title="Ver incidente"
                                        >
                                            <i className="bi bi-eye"></i>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Card.Body>
        </Card>
    );
}
