import App from './App.tsx'
import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from './feature/Home/HomePage.tsx';
import { EquiposPage } from './feature/Equipos/pages/EquiposPage.tsx';
import { EditarEquipoPage } from './feature/Equipos/pages/EditarEquipoPage.tsx';
import { NuevoEquipoPage } from './feature/Equipos/pages/NuevoEquipoPage.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "equipos", 
        children: [
          { index: true, element: <EquiposPage /> },
          { path: "new", element: <NuevoEquipoPage /> },
          { path: ":id/edit", element: <EditarEquipoPage /> },
        ],
      },
    ]
  },
]);

export default router