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

import { ListPage as InsumoQuimicoListPage } from './feature/InsumosQuimicos/pages/ListPage.tsx'
import { NuevoInsumoQuimicoPage } from './feature/InsumosQuimicos/pages/NuevoInsumoQuimicoPage.tsx'
import { EditarInsumoQuimicoPage } from './feature/InsumosQuimicos/pages/EditarInsumoQuimicoPage.tsx'
import { VerInsumoQuimicoPage } from './feature/InsumosQuimicos/pages/VerInsumoQuimicoPage.tsx'

import { ListPage as TipoQuimicoListPage } from './feature/TiposQuimicos/pages/ListPage.tsx'
import { NuevoTipoQuimicoPage } from './feature/TiposQuimicos/pages/NuevoTipoQuimicoPage.tsx'
import { EditarTipoQuimicoPage } from './feature/TiposQuimicos/pages/EditarTipoQuimicoPage.tsx'
import { VerTipoQuimicoPage } from './feature/TiposQuimicos/pages/VerTipoQuimicoPage.tsx'

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
        path: 'insumos-quimicos',
        children: [
          {index: true, element: <InsumoQuimicoListPage />},
          {path: 'new', element: <NuevoInsumoQuimicoPage />},
          {path: ':id/edit', element: <EditarInsumoQuimicoPage />},
          {path: ':id', element: <VerInsumoQuimicoPage />},
        ],
      },
      {
        path: 'tipos-quimicos',
        children: [
          {index: true, element: <TipoQuimicoListPage />},
          {path: 'new', element: <NuevoTipoQuimicoPage />},
          {path: ':id/edit', element: <EditarTipoQuimicoPage />},
          {path: ':id', element: <VerTipoQuimicoPage />},
        ],
      },
      { path: '*', element: <Page404 /> },
    ],
  },
])

export default router
