import App from './App.tsx'
import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from './feature/Home/HomePage.tsx';
<<<<<<< HEAD
=======
import { EquiposPage } from './feature/Equipos/EquiposPage.tsx';
>>>>>>> c801878c62b6b70736b6d627e24b2860f3128a61
import { ListPage as PersonalListPage } from './feature/Personal/pages/ListPage.tsx';
import { EditarPersonaPage } from './feature/Personal/pages/EditarPersonaPage.tsx';
import { PersonalPage } from './feature/Personal/PersonalPage.tsx';
import { NuevaPersonaPage } from './feature/Personal/pages/NuevaPersonaPage.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
     
      {
        path: "personal",
        children: [
          { index: true, element: <PersonalListPage /> },             // /personal
          { path: "new", element: <NuevaPersonaPage /> },             // /personal/new
          { path: ":id/edit", element: <EditarPersonaPage /> },       // /personal/:id/edit
        ],
      },
      { path: "personal", element: <PersonalPage /> },
    ]
  },
]);

export default router