import { Form } from 'react-bootstrap';
import { ETIQUETAS_EMPAQUETADO, type ClaveElementoEmpaquetado, type ElementoEmpaquetado } from '../types';
import './PanelCapasEmpaquetado.css';

interface PanelCapasEmpaquetadoProps {
    elementos: ElementoEmpaquetado[];
    seleccionado: ClaveElementoEmpaquetado | null;
    puedeEditar: boolean;
    onCambiar: (clave: ClaveElementoEmpaquetado, cambios: Partial<ElementoEmpaquetado>) => void;
}

export function PanelCapasEmpaquetado({ elementos, seleccionado, puedeEditar, onCambiar }: PanelCapasEmpaquetadoProps) {
    const visibles = elementos.filter((elemento) => elemento.visible).length;
    const todosVisibles = visibles === elementos.length;

    const cambiarTodos = (visible: boolean) =>
        elementos.forEach((elemento) => {
            if (elemento.visible !== visible) onCambiar(elemento.clave, { visible });
        });

    return (
        <aside className="capas-empaquetado" aria-label="Elementos del empaquetado">
            <div className="capas-encabezado">
                <Form.Check
                    type="checkbox"
                    id="capas-seleccionar-todos"
                    className="mb-0"
                    label={<span className="capas-titulo">Seleccionar todos</span>}
                    checked={todosVisibles}
                    disabled={!puedeEditar}
                    ref={(nodo: HTMLInputElement | null) => {
                        if (nodo) nodo.indeterminate = visibles > 0 && !todosVisibles;
                    }}
                    onChange={() => cambiarTodos(!todosVisibles)}
                />
                <small className="text-muted text-nowrap">{visibles} de {elementos.length}</small>
            </div>

            <ul className="capas-lista">
                {elementos.map((elemento) => {
                    const nombre = ETIQUETAS_EMPAQUETADO[elemento.clave];
                    const activo = elemento.clave === seleccionado;
                    return (
                        <li
                            key={elemento.clave}
                            className={`capa${activo ? ' capa-activa' : ''}${elemento.visible ? '' : ' capa-oculta'}`}
                        >
                            <div className="capa-fila">
                                <Form.Check
                                    type="checkbox"
                                    id={`capa-visible-${elemento.clave}`}
                                    className="capa-check"
                                    checked={elemento.visible}
                                    disabled={!puedeEditar}
                                    onChange={() => onCambiar(elemento.clave, { visible: !elemento.visible })}
                                />
                                <label htmlFor={`capa-visible-${elemento.clave}`} className="capa-nombre">
                                    {nombre}
                                </label>
                            </div>

                        </li>
                    );
                })}
            </ul>

            {puedeEditar && (
                <p className="capas-ayuda">
                    Marcá o desmarcá un elemento para mostrarlo u ocultarlo. En el lienzo, arrastrá un bloque para
                    moverlo y usá los vértices o los bordes para estirarlo.
                </p>
            )}
        </aside>
    );
}
