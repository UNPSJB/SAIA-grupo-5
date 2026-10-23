import { useEffect, useState } from 'react';
import { Badge, Dropdown } from 'react-bootstrap';
import { matchPath, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks';
import { tutoriales } from '../feature/Tutoriales';
import { cerrarTutorial, fueVisto, iniciarTutorial } from '../feature/Tutoriales/engine';
export function TutorialMenu() {
    const { pathname } = useLocation();
    const { currentUser } = useAuth();
    const [, setRefresh] = useState(0); // fuerza re-render para actualizar el badge "Nuevo"
    useEffect(() => {
        cerrarTutorial();
    }, [pathname]);
    const userKey = String(currentUser?.username ?? 'anon');

    const disponibles = tutoriales.filter((tut) => {
        if (!matchPath({ path: tut.ruta, end: true }, pathname)) return false;
        if (!tut.permiso) return true;
        return Boolean(currentUser?.[tut.permiso]);
    });

    if (disponibles.length === 0) return null;

    return (
        <Dropdown align="end">
            <Dropdown.Toggle
                as="button"
                id="sb-help-menu"
                className="sb-notification-toggle"
                aria-label="Ayuda y tutoriales"
            >
                <i className="bi bi-question-circle" aria-hidden="true" />
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <Dropdown.Header>Tutoriales de esta pantalla</Dropdown.Header>
                {disponibles.map((tut) => (
                    <Dropdown.Item
                        as="button"
                        key={tut.id}
                        onClick={() =>
                            // el timeout deja que el menú se cierre antes de arrancar el tour
                            setTimeout(
                                () => void iniciarTutorial(tut, userKey, () => setRefresh((n) => n + 1)),
                                150,
                            )
                        }
                    >
                        {tut.titulo}{' '}
                        {!fueVisto(userKey, tut.id) && <Badge bg="primary">Nuevo</Badge>}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
}