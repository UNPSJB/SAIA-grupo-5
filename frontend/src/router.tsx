import { createBrowserRouter } from 'react-router-dom';

import { HomePage } from './feature/Home/HomePage.tsx';
import { Page404 } from './feature/NotFound/Page404.tsx';

import { ListPage } from './feature/Insumos/pages/ListPage.tsx';
import { NuevoInsumoPage } from './feature/Insumos/pages/NuevoInsumoPage.tsx';
import { EditarInsumoPage } from './feature/Insumos/pages/EditarInsumoPage.tsx';

import App from './App.tsx'

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
      { path: "*", element: <Page404 /> },
    ]
  },
]);

export default router