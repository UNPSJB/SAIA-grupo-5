import { createBrowserRouter } from 'react-router-dom'

import { HomePage } from './feature/Home/HomePage.tsx'
import { Page404 } from './feature/NotFound/Page404.tsx'

import { ListPage as InsumosListPage } from './feature/Insumos/pages/ListPage.tsx'
import { NuevoInsumoPage } from './feature/Insumos/pages/NuevoInsumoPage.tsx'
import { EditarInsumoPage } from './feature/Insumos/pages/EditarInsumoPage.tsx'

import { EquiposPage } from './feature/Equipos/pages/ListPage.tsx';
import { EditarEquipoPage } from './feature/Equipos/pages/EditarEquipoPage.tsx';
import { NuevoEquipoPage } from './feature/Equipos/pages/NuevoEquipoPage.tsx';

import { ListPage as PersonalListPage } from './feature/Personal/pages/ListPage.tsx'
import { EditarPersonaPage } from './feature/Personal/pages/EditarPersonaPage.tsx'
import { NuevaPersonaPage } from './feature/Personal/pages/NuevaPersonaPage.tsx'

import { ElementosLimpiezaPage } from './feature/ElementosLimpieza/pages/ListPage.tsx';
import { NuevoElementoPage } from "./feature/ElementosLimpieza/pages/NuevoElementoPage";
import { VerElementoPage } from './feature/ElementosLimpieza/pages/VerElementoPage.tsx'
import { EditarElementoPage } from './feature/ElementosLimpieza/pages/EditarElementoPage.tsx'

import { TiposElementoLimpiezaPage } from './feature/TiposElementoLimpieza/pages/ListPage.tsx'
import { NuevoTipoElementoPage } from './feature/TiposElementoLimpieza/pages/NuevoTipoElementoPage.tsx'
import { EditarTipoElementoPage } from './feature/TiposElementoLimpieza/pages/EditarTipoElementoPage.tsx'

import { RecambiosElementoLimpiezaPage } from './feature/RecambiosElementosLimpieza/pages/ListPage.tsx'
import { NuevoRecambioElementoLimpiezaPage } from './feature/RecambiosElementosLimpieza/pages/NuevoRecambioElementoLimpiezaPage.tsx'
import { VerRecambioElementoLimpiezaPage } from './feature/RecambiosElementosLimpieza/pages/VerRecambioElementoLimpiezaPage.tsx'

import App from './App.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { 
        path: "equipos", 
        children: [
          { index: true, element: <EquiposPage /> },
          { path: "new", element: <NuevoEquipoPage /> },
          { path: ":id/edit", element: <EditarEquipoPage /> },
        ],
      },
      {
        path: 'insumos',
        children: [
          { index: true, element: <InsumosListPage /> },
          { path: 'new', element: <NuevoInsumoPage /> },
          { path: ':id/edit', element: <EditarInsumoPage /> },
        ],
      },
      {
        path: 'personal',
        children: [
          { index: true, element: <PersonalListPage /> },
          { path: 'new', element: <NuevaPersonaPage /> },
          { path: ':id/edit', element: <EditarPersonaPage /> },
        ],
      },
      {
        path: 'elementos-limpieza',
        children: [
            { index: true, element: <ElementosLimpiezaPage /> },
            { path: 'new', element: <NuevoElementoPage/>},
            { path: ':id/edit', element: <EditarElementoPage/>},
            { path: ':id', element: <VerElementoPage/>},
        ],
      },
      {
        path: "tipos-elementos-limpieza",
        children: [
            { index: true, element: <TiposElementoLimpiezaPage /> },
            { path: "new", element: <NuevoTipoElementoPage /> },
            { path: ":id/edit", element: <EditarTipoElementoPage /> },
        ],
      },
      {
        path: "recambios-elementos-limpieza",
        children: [
            { index: true, element: <RecambiosElementoLimpiezaPage /> },
            { path: "new", element: <NuevoRecambioElementoLimpiezaPage /> },
            { path: "new/:elementoId", element: <NuevoRecambioElementoLimpiezaPage /> },
            { path: ":id", element: <VerRecambioElementoLimpiezaPage /> },
        ],
      },
      { path: '*', element: <Page404 /> },
    ],
  },
])

export default router
