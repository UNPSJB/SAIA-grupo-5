import App from './App.tsx'
import { createBrowserRouter } from 'react-router-dom';
import { InsumosPage } from './feature/Insumos/InsumosPage.tsx';
import { HomePage } from './feature/Home/HomePage.tsx';
import { EquiposPage } from './feature/Equipos/EquiposPage.tsx';
import { PersonalPage } from './feature/Personal/PersonalPage.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "insumos", element: <InsumosPage /> },
      { path: "equipos", element: <EquiposPage /> },
      { path: "personal", element: <PersonalPage /> },
    ]
  },
]);

export default router