import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import type { Tutorial } from './types';

export const t = (nombre: string) => `[data-tour="${nombre}"]`;

export function esperarElemento(selector: string, timeout = 4000): Promise<Element | null> {
    return new Promise((resolve) => {
        const el = document.querySelector(selector);
        if (el) return resolve(el);

        const timer = setTimeout(() => {
            obs.disconnect();
            resolve(null);
        }, timeout);

        const obs = new MutationObserver(() => {
            const found = document.querySelector(selector);
            if (found) {
                obs.disconnect();
                clearTimeout(timer);
                resolve(found);
            }
        });
        obs.observe(document.body, { childList: true, subtree: true });
    });
}
const vistoKey = (userKey: string, id: string) => `tutorial:visto:${userKey}:${id}`;

export const fueVisto = (userKey: string, id: string) =>
    localStorage.getItem(vistoKey(userKey, id)) === '1';

let activo: ReturnType<typeof driver> | null = null;
let cierreForzado = false;

/** Cierra el tour activo sin marcarlo como "visto" (se usa al cambiar de ruta). */
export function cerrarTutorial() {
    if (!activo) return;
    cierreForzado = true;
    activo.destroy();
    cierreForzado = false;
    activo = null;
}

export async function iniciarTutorial(tutorial: Tutorial, userKey: string, onDone?: () => void) {
    cerrarTutorial(); // por si había otro abierto

    const rutaAlIniciar = window.location.pathname;
    const primero = tutorial.pasos[0]?.element;
    if (typeof primero === 'string') await esperarElemento(primero);

    // Si mientras esperábamos el usuario cambió de pantalla, no arranca
    if (window.location.pathname !== rutaAlIniciar) return;

    const d = driver({
        showProgress: true,
        allowClose: true,
        nextBtnText: 'Siguiente',
        prevBtnText: 'Anterior',
        doneBtnText: 'Listo',
        progressText: '{{current}} de {{total}}',
        steps: tutorial.pasos,
        onDestroyed: () => {
            if (activo === d) activo = null;
            if (cierreForzado) return; // lo cerró un cambio de ruta: no cuenta como "visto" porque no lo terminó
            localStorage.setItem(vistoKey(userKey, tutorial.id), '1');
            onDone?.();
        },
    });

    activo = d;
    d.drive();
}