import { Alert, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap';
import type { ExpanderComponentProps, TableColumn } from 'react-data-table-component';
import { AppTable } from '../../../components/AppTable';
import { EstadoBadge, type TonoEstado } from '../../../components/EstadoBadge';
import { useApi } from '../../../hooks/useApi';
import type { UnidadMedida } from '../../UnidadMedida/types';
import type { InsumoReceta, TipoRenglon } from '../types';
import { calcularComposicionPorcentual, DECIMALES_COMPOSICION } from '../lib/composicionPorcentual';

interface IngredientesComposicionProps {
    insumos: InsumoReceta[];
    // La composición porcentual es solo para quien tiene permiso de administrar.
    mostrarComposicion: boolean;
}

type FilaIngrediente = {
    renglon: InsumoReceta;
    porcentaje: number | null;
    motivoExclusion: string | null;
};

const TONO_TIPO: Record<TipoRenglon, TonoEstado> = {
    Ingrediente: 'success',
    Aditivo: 'info',
};

const NOMBRE_UNIDAD_MEDIDA_ESTANDAR = { MASA: 'masa', VOLUMEN: 'volumen' } as const;

const formatearPorcentaje = (porcentaje: number) =>
    `${porcentaje.toLocaleString('es-AR', { maximumFractionDigits: DECIMALES_COMPOSICION })}%`;

const esAditivoConDetalle = (fila: FilaIngrediente) => fila.renglon.tipo === 'Aditivo' && fila.renglon.aditivo !== null;

// Fila expandible: solo los aditivos tienen detalle para mostrar.
function DetalleAditivo({ data: fila }: ExpanderComponentProps<FilaIngrediente>) {
    const aditivo = fila.renglon.aditivo;
    if (!aditivo) return null;
    return (
        <div className="text-start" style={{ padding: '12px 40px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <p className="fw-semibold mb-1">{aditivo.nombre}</p>
            <dl className="row small text-muted mb-0">
                <dt className="col-sm-4 fw-semibold">Clase funcional</dt>
                <dd className="col-sm-8 mb-1">{aditivo.clase_funcional}</dd>
                <dt className="col-sm-4 fw-semibold">Número INS</dt>
                <dd className="col-sm-8 mb-1">{aditivo.numero_ins ?? <span className="fst-italic">Sin número INS</span>}</dd>
                <dt className="col-sm-4 fw-semibold">Insumo</dt>
                <dd className="col-sm-8 mb-0">{fila.renglon.nombre}</dd>
            </dl>
        </div>
    );
}

// Ingredientes primero y luego aditivos, respetando el orden de carga dentro de cada grupo.
const ordenarPorTipo = (insumos: InsumoReceta[]) => [
    ...insumos.filter((item) => item.tipo === 'Ingrediente'),
    ...insumos.filter((item) => item.tipo === 'Aditivo'),
];

export function IngredientesComposicion({ insumos, mostrarComposicion }: IngredientesComposicionProps) {
    // Catálogo casi inmutable: alcanza con el cacheo de SWR. Solo se pide si se muestra la composición.
    const { data: unidades, isLoading, error } = useApi<UnidadMedida[]>(mostrarComposicion ? '/unidades-medida/' : null);

    const composicion = mostrarComposicion && unidades
        ? calcularComposicionPorcentual(
            insumos.map((item) => ({
                insumoId: item.insumo_id,
                nombre: item.nombre,
                tipo: item.tipo,
                cantidad: item.cantidad,
                unidadMedida: item.unidad_medida,
            })),
            unidades,
        )
        : null;

    const porcentajes = new Map(composicion?.items.map((item) => [item.insumoId, item.porcentaje]));
    const exclusiones = new Map(composicion?.excluidos.map((item) => [item.insumoId, item.motivo]));

    const filas: FilaIngrediente[] = ordenarPorTipo(insumos).map((renglon) => ({
        renglon,
        porcentaje: porcentajes.get(renglon.insumo_id) ?? null,
        motivoExclusion: exclusiones.get(renglon.insumo_id) ?? null,
    }));

    const columnas: TableColumn<FilaIngrediente>[] = [
        {
            id: 'nombre',
            name: 'Nombre',
            selector: (fila) => fila.renglon.tipo === 'Aditivo' && fila.renglon.aditivo ? fila.renglon.aditivo.nombre : fila.renglon.nombre,
            // El detalle del aditivo (clase funcional, INS, insumo) va en la fila expandible.
            cell: (fila) => (
                <span className="fw-semibold">
                    {fila.renglon.tipo === 'Aditivo' && fila.renglon.aditivo ? fila.renglon.aditivo.nombre : fila.renglon.nombre}
                </span>
            ),
            sortable: true,
            grow: 2,
            wrap: true,
            footer: (rows) => `${rows.length} ${rows.length === 1 ? 'insumo' : 'insumos'}`,
        },
        {
            id: 'tipo',
            name: 'Tipo',
            selector: (fila) => fila.renglon.tipo,
            cell: (fila) => (
                <EstadoBadge tono={TONO_TIPO[fila.renglon.tipo]}>{fila.renglon.tipo}</EstadoBadge>
            ),
            sortable: true,
            center: true,
            minWidth: '140px',
        },
        {
            id: 'cantidad',
            name: 'Cantidad',
            selector: (fila) => fila.renglon.cantidad,
            format: (fila) => fila.renglon.cantidad.toLocaleString('es-AR'),
            sortable: true,
            right: true,
        },
        {
            id: 'unidad',
            name: 'Unidad de medida',
            selector: (fila) => fila.renglon.unidad_medida.nombre,
            sortable: true,
        },
        {
            id: 'porcentaje',
            name: 'Porcentaje',
            selector: (fila) => fila.porcentaje ?? -1,
            cell: (fila) => fila.porcentaje !== null ? (
                <span className="fw-semibold">{formatearPorcentaje(fila.porcentaje)}</span>
            ) : (
                <OverlayTrigger overlay={<Tooltip>Fuera del cálculo: {fila.motivoExclusion ?? 'sin datos'}</Tooltip>}>
                    <span className="text-warning-emphasis">
                        <i className="bi bi-exclamation-triangle-fill me-1"></i>—
                    </span>
                </OverlayTrigger>
            ),
            sortable: true,
            right: true,
            omit: !composicion,
            footer: composicion && composicion.items.length > 0
                ? <span className="fw-bold">Total: {formatearPorcentaje(composicion.sumaPorcentajes)}</span>
                : undefined,
        },
    ];

    return (
        <section className="text-start">
            {mostrarComposicion && (
                <p className="text-muted small mb-2">
                    El porcentaje se calcula sobre la suma de las cantidades de los insumos
                    {composicion?.unidadMedidaEstandarBase && ` (en ${NOMBRE_UNIDAD_MEDIDA_ESTANDAR[composicion.unidadMedidaEstandarBase]})`}.
                </p>
            )}
            {mostrarComposicion && isLoading && (
                <div className="d-flex align-items-center gap-2 text-muted small mb-2">
                    <Spinner animation="border" size="sm" /> Calculando composición…
                </div>
            )}
            {mostrarComposicion && error && (
                <p className="text-muted small mb-2">No se pudo calcular la composición porcentual.</p>
            )}

            <AppTable
                columns={columnas}
                data={filas}
                pagination={false}
                expandableRows
                expandableRowsComponent={DetalleAditivo}
                expandableRowDisabled={(fila) => !esAditivoConDetalle(fila)}
                noDataComponent={<div className="p-4 text-muted">La receta no tiene insumos cargados.</div>}
            />

            {composicion && composicion.excluidos.length > 0 && (
                <Alert variant="warning" className="small py-2 mt-3 mb-0">
                    <i className="bi bi-exclamation-triangle-fill me-1"></i>
                    {composicion.items.length > 0
                        ? 'Estos insumos quedaron fuera del cálculo:'
                        : 'No se pudo calcular la composición: ningún insumo tiene una unidad convertible.'}
                    <ul className="mb-0 mt-1">
                        {composicion.excluidos.map((item) => (
                            <li key={item.insumoId}><strong>{item.nombre}</strong>: {item.motivo}</li>
                        ))}
                    </ul>
                </Alert>
            )}
        </section>
    );
}
