import { createBrowserRouter } from 'react-router-dom'

import { HomePage } from './feature/Home/HomePage.tsx'
import { Page404 } from './feature/NotFound/Page404.tsx'

import { ListPage as InsumosListPage } from './feature/Insumos/pages/ListPage.tsx'
import { NuevoInsumoPage } from './feature/Insumos/pages/NuevoInsumoPage.tsx'
import { EditarInsumoPage } from './feature/Insumos/pages/EditarInsumoPage.tsx'

import { EquiposPage } from './feature/Equipos/pages/ListPage.tsx'
import { EditarEquipoPage } from './feature/Equipos/pages/EditarEquipoPage.tsx'
import { NuevoEquipoPage } from './feature/Equipos/pages/NuevoEquipoPage.tsx'

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

import { TareasPage } from './feature/Tareas/pages/ListPage.tsx';
import { ListPage as InsumoQuimicoListPage } from './feature/InsumosQuimicos/pages/ListPage.tsx'
import { NuevoInsumoQuimicoPage } from './feature/InsumosQuimicos/pages/NuevoInsumoQuimicoPage.tsx'
import { EditarInsumoQuimicoPage } from './feature/InsumosQuimicos/pages/EditarInsumoQuimicoPage.tsx'
import { VerInsumoQuimicoPage } from './feature/InsumosQuimicos/pages/VerInsumoQuimicoPage.tsx'

import { ListPage as TipoQuimicoListPage } from './feature/TiposQuimicos/pages/ListPage.tsx'
import { NuevoTipoQuimicoPage } from './feature/TiposQuimicos/pages/NuevoTipoQuimicoPage.tsx'
import { EditarTipoQuimicoPage } from './feature/TiposQuimicos/pages/EditarTipoQuimicoPage.tsx'
import { VerTipoQuimicoPage } from './feature/TiposQuimicos/pages/VerTipoQuimicoPage.tsx'

import { Login, NoAutorizado } from './feature/auth'
import AuthLayout from './layouts/AuthLayout.tsx'
import { ProtectedRoute } from './components/ProtectedRoute.tsx'

import App from './App.tsx'


const router = createBrowserRouter([
  {
    path: '/iniciar-sesion',
    element: <Login />,
  },
  {
    path: '/no-autorizado',
    element: <NoAutorizado />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/',
        element: <App />,
        children: [
          { index: true, element: <HomePage /> },
          {
            path: 'equipos',
            children: [
              { index: true, element: <EquiposPage /> },
              {
                element: <ProtectedRoute requireAdmin />,
                children: [
                  { path: 'new', element: <NuevoEquipoPage /> },
                  { path: ':id/edit', element: <EditarEquipoPage /> },
                ],
              },
            ],
          },
          {
            path: 'sectores',
            children: [
              { index: true, element: <SectoresPage /> },
              { path: 'new', element: <NuevoSectorPage /> },
              { path: ':id/edit', element: <EditarSectorPage /> },
            ],
          },
          {
            path: 'insumos',
            children: [
              { index: true, element: <InsumosListPage /> },
              {
                element: <ProtectedRoute requireAdmin />,
                children: [
                  { path: 'new', element: <NuevoInsumoPage /> },
                  { path: ':id/edit', element: <EditarInsumoPage /> },
                ],
              },
            ],
          },
          {
            path: 'insumos-quimicos',
            children: [
              { index: true, element: <InsumoQuimicoListPage /> },
              { path: ':id', element: <VerInsumoQuimicoPage /> },
              {
                element: <ProtectedRoute requireAdmin />,
                children: [
                  { path: 'new', element: <NuevoInsumoQuimicoPage /> },
                  { path: ':id/edit', element: <EditarInsumoQuimicoPage /> },
                ],
              },
            ],
          },
          {
            path: 'tipos-quimicos',
            children: [
              { index: true, element: <TipoQuimicoListPage /> },
              { path: ':id', element: <VerTipoQuimicoPage /> },
              {
                element: <ProtectedRoute requireAdmin />,
                children: [
                  { path: 'new', element: <NuevoTipoQuimicoPage /> },
                  { path: ':id/edit', element: <EditarTipoQuimicoPage /> },
                ],
              },
            ],
          },
          {
            path: 'personal',
            element: <ProtectedRoute requireAdmin />,
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
          { path: 'tareas', element: <TareasPage /> },
          { path: '*', element: <Page404 /> },
        ],
      },
    ],
  },
])

export default router
