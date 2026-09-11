import App from './App.tsx'
import { createBrowserRouter } from 'react-router-dom'
import { HomePage } from './feature/Home/HomePage.tsx'
import { Page404 } from './feature/NotFound/Page404.tsx'
import { ListPage as PersonalListPage } from './feature/Personal/pages/ListPage.tsx'
import { EditarPersonaPage } from './feature/Personal/pages/EditarPersonaPage.tsx'
import { NuevaPersonaPage } from './feature/Personal/pages/NuevaPersonaPage.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
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
