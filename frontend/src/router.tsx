import App from './App.tsx'
import { createBrowserRouter } from 'react-router-dom';
import { InsumosPage } from './feature/Insumos/InsumosPage.tsx';
import { NuevoInsumoPage } from './feature/Insumos/NuevoInsumoPage.tsx';
import { EditarInsumoPage } from './feature/Insumos/EditarInsumoPage.tsx';
import { HomePage } from './feature/Home/HomePage.tsx';
import { EquiposPage } from './feature/Equipos/EquiposPage.tsx';
import { NuevoEquipoPage } from './feature/Equipos/NuevoEquipoPage.tsx';
import { PersonalPage } from './feature/Personal/PersonalPage.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "insumos", element: <InsumosPage /> },
      { path: "insumos/new", element: <NuevoInsumoPage />},
      { path: "insumos/:id/edit", element: <EditarInsumoPage/>},
      { path: "equipos", element: <EquiposPage /> },
      { path: "equipos/new", element: <NuevoEquipoPage />},
      { path: "personal", element: <PersonalPage /> },
    ]
  },
]);

export default router