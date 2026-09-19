import { createBrowserRouter } from 'react-router-dom'

import { HomePage } from './feature/Home/HomePage.tsx'
import { Page404 } from './feature/NotFound/Page404.tsx'

import { ListPage as InsumosListPage } from './feature/Insumos/pages/ListPage.tsx'
import { NuevoInsumoPage } from './feature/Insumos/pages/NuevoInsumoPage.tsx'
import { EditarInsumoPage } from './feature/Insumos/pages/EditarInsumoPage.tsx'

import { EquiposPage } from './feature/Equipos/pages/ListPage.tsx'
import { EditarEquipoPage } from './feature/Equipos/pages/EditarEquipoPage.tsx'
import { NuevoEquipoPage } from './feature/Equipos/pages/NuevoEquipoPage.tsx'

import { ListPage as PersonalListPage } from './feature/Personal/pages/ListPage.tsx'
import { EditarPersonaPage } from './feature/Personal/pages/EditarPersonaPage.tsx'
import { NuevaPersonaPage } from './feature/Personal/pages/NuevaPersonaPage.tsx'

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
            path: 'personal',
            element: <ProtectedRoute requireAdmin />,
            children: [
              { index: true, element: <PersonalListPage /> },
              { path: 'new', element: <NuevaPersonaPage /> },
              { path: ':id/edit', element: <EditarPersonaPage /> },
            ],
          },
          { path: '*', element: <Page404 /> },
        ],
      },
    ],
  },
])

export default router
