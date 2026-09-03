import App from './App.tsx'
import { createBrowserRouter } from 'react-router';
import { InsumosPage } from './feature/Insumos/InsumosPage.tsx';
import { HomePage } from './feature/Home/HomePage.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "/insumos", element: <InsumosPage /> },
    ]
  },
]);

export default router