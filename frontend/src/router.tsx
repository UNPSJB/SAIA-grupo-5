import App from './App.tsx'
import { createBrowserRouter } from 'react-router-dom';
import { NuevoInsumoPage } from './feature/Insumos/pages/NuevoInsumoPage.tsx';
import { EditarInsumoPage } from './feature/Insumos/pages/EditarInsumoPage.tsx';
import { HomePage } from './feature/Home/HomePage.tsx';
import { EquiposPage } from './feature/Equipos/EquiposPage.tsx';
import { ListPage as InsumosListPage } from './feature/Insumos/pages/ListPage.tsx';
import { ListPage as PersonalListPage } from './feature/Personal/pages/ListPage.tsx';
import { EditarPersonaPage } from './feature/Personal/pages/EditarPersonaPage.tsx';
import { PersonalPage } from './feature/Personal/PersonalPage.tsx';
import { ListPage } from './feature/Insumos/pages/ListPage.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "insumos",
        children: [
          { index: true, element: <InsumosListPage /> },             // /insumos
          { index: true, element: <ListPage /> },             // /insumos
          { path: "new", element: <NuevoInsumoPage /> },      // /insumos/new
          { path: ":id/edit", element: <EditarInsumoPage /> },// /insumos/:id/edit
        ],
      },
      { path: "equipos", element: <EquiposPage /> },
      {
        path: "personal",
        children: [
          { index: true, element: <PersonalListPage /> },             // /personal
          { path: ":id/edit", element: <EditarPersonaPage /> },       // /personal/:id/edit
        ],
      },
      { path: "personal", element: <PersonalPage /> },
    ]
  },
]);

export default router