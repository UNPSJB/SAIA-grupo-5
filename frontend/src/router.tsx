import { createBrowserRouter } from 'react-router-dom'

import { HomePage } from './feature/Home/HomePage.tsx'
import { Page404 } from './feature/NotFound/Page404.tsx'

import { ListPage as InsumosListPage } from './feature/Insumos/pages/ListPage.tsx'
import { NuevoInsumoPage } from './feature/Insumos/pages/NuevoInsumoPage.tsx'
import { EditarInsumoPage } from './feature/Insumos/pages/EditarInsumoPage.tsx'

import { ListPage as PersonalListPage } from './feature/Personal/pages/ListPage.tsx'
import { EditarPersonaPage } from './feature/Personal/pages/EditarPersonaPage.tsx'
import { NuevaPersonaPage } from './feature/Personal/pages/NuevaPersonaPage.tsx'

import App from './App.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
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
      { path: '*', element: <Page404 /> },
    ],
  },
])

export default router
