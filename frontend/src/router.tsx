import App from './App.tsx'
import { createBrowserRouter } from 'react-router-dom';
import { NuevoInsumoPage } from './feature/Insumos/pages/NuevoInsumoPage.tsx';
import { EditarInsumoPage } from './feature/Insumos/pages/EditarInsumoPage.tsx';
import { HomePage } from './feature/Home/HomePage.tsx';
import { EquiposPage } from './feature/Equipos/EquiposPage.tsx';
import { EditarEquipoPage } from './feature/Equipos/EditarEquipoPage.tsx';
import { NuevoEquipoPage } from './feature/Equipos/NuevoEquipoPage.tsx';
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
          { index: true, element: <ListPage /> },             // /insumos
          { path: "new", element: <NuevoInsumoPage /> },      // /insumos/new
          { path: ":id/edit", element: <EditarInsumoPage /> },// /insumos/:id/edit
        ],
      },
      { path: "equipos", 
        children: [
          { index: true, element: <EquiposPage /> },
          { path: "new", element: <NuevoEquipoPage /> },
          { path: ":id/edit", element: <EditarEquipoPage /> },
        ],
      },
      { path: "personal", element: <PersonalPage /> },
    ]
  },
]);

export default router