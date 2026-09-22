import { createBrowserRouter } from 'react-router-dom'

import { HomePage } from './feature/Home/HomePage.tsx'
import { Page404 } from './feature/NotFound/Page404.tsx'

import { ListPage as InsumosListPage } from './feature/Insumos/pages/ListPage.tsx'
import { NuevoInsumoPage } from './feature/Insumos/pages/NuevoInsumoPage.tsx'
import { EditarInsumoPage } from './feature/Insumos/pages/EditarInsumoPage.tsx'

import { EquiposPage } from './feature/Equipos/pages/ListPage.tsx';
import { EditarEquipoPage } from './feature/Equipos/pages/EditarEquipoPage.tsx';
import { NuevoEquipoPage } from './feature/Equipos/pages/NuevoEquipoPage.tsx';

import { ListPage as SectoresPage } from './feature/Sectores/pages/ListPage.tsx';
import { EditarSectorPage } from './feature/Sectores/pages/EditarSectorPage.tsx';
import { NuevoSectorPage } from './feature/Sectores/pages/NuevoSectorPage.tsx';

import { ListPage as PersonalListPage } from './feature/Personal/pages/ListPage.tsx'
import { EditarPersonaPage } from './feature/Personal/pages/EditarPersonaPage.tsx'
import { NuevaPersonaPage } from './feature/Personal/pages/NuevaPersonaPage.tsx'

import { SuperficiesPage } from './feature/Superficies/pages/ListPage.tsx';
import { NuevaSuperficiePage } from './feature/Superficies/pages/NuevoSuperficiePage.tsx';
import { EditarSuperficiePage } from './feature/Superficies/pages/EditarSuperficiePage.tsx';

import { PlanesLimpiezaPage } from './feature/PlanesLimpieza/pages/ListPage.tsx';
import { NuevoPlanLimpiezaPage } from './feature/PlanesLimpieza/pages/NuevoPlanLimpiezaPage.tsx';
import { EditarPlanLimpiezaPage } from './feature/PlanesLimpieza/pages/EditarPlanLimpiezaPage.tsx';

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
        path: "sectores", 
        children: [
          { index: true, element: <SectoresPage /> },
          { path: "new", element: <NuevoSectorPage /> },
          { path: ":id/edit", element: <EditarSectorPage /> },
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
        path: 'superficies',
        children: [
          { index: true, element: <SuperficiesPage /> },
          { path: 'new', element: <NuevaSuperficiePage /> },
          { path: ':id/edit', element: <EditarSuperficiePage /> },
        ],
      },
      {
        path: 'planes-limpieza',
        children: [
          { index: true, element: <PlanesLimpiezaPage /> },
          { path: 'new', element: <NuevoPlanLimpiezaPage /> },
          { path: ':id/edit', element: <EditarPlanLimpiezaPage /> },
        ],
      },
      { path: '*', element: <Page404 /> },
    ],
  },
])

export default router
