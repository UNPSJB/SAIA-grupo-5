import { createBrowserRouter } from 'react-router-dom'

import { HomePage } from './feature/Home/HomePage.tsx'
import { ListPage as IncidentesPage } from './feature/Incidentes/pages/ListPage.tsx'
import { Page404 } from './feature/NotFound/Page404.tsx'

import { ListPage as InsumosListPage } from './feature/Insumos/pages/ListPage.tsx'
import { NuevoInsumoPage } from './feature/Insumos/pages/NuevoInsumoPage.tsx'
import { EditarInsumoPage } from './feature/Insumos/pages/EditarInsumoPage.tsx'
import { VerInsumoPage } from './feature/Insumos/pages/VerInsumoPage.tsx'

import { EquiposPage } from './feature/Equipos/pages/ListPage.tsx'
import { EditarEquipoPage } from './feature/Equipos/pages/EditarEquipoPage.tsx'
import { NuevoEquipoPage } from './feature/Equipos/pages/NuevoEquipoPage.tsx'

import { ListPage as SectoresPage } from './feature/Sectores/pages/ListPage.tsx';
import { EditarSectorPage } from './feature/Sectores/pages/EditarSectorPage.tsx';
import { NuevoSectorPage } from './feature/Sectores/pages/NuevoSectorPage.tsx';

import { ListPage as PersonalListPage } from './feature/Personal/pages/ListPage.tsx'
import { EditarPersonaPage } from './feature/Personal/pages/EditarPersonaPage.tsx'
import { NuevaPersonaPage } from './feature/Personal/pages/NuevaPersonaPage.tsx'
import { ConfiguracionCuentaPage } from './feature/Personal/pages/ConfiguracionCuentaPage.tsx'
import { VerPersonalPage } from './feature/Personal/pages/VerPersonalPage.tsx'

import { ElementosLimpiezaPage } from './feature/ElementosLimpieza/pages/ListPage.tsx';
import { NuevoElementoPage } from "./feature/ElementosLimpieza/pages/NuevoElementoPage";
import { VerElementoPage } from './feature/ElementosLimpieza/pages/VerElementoPage.tsx'
import { EditarElementoPage } from './feature/ElementosLimpieza/pages/EditarElementoPage.tsx'

import { TiposElementoLimpiezaPage } from './feature/TiposElementoLimpieza/pages/ListPage.tsx'
import { NuevoTipoElementoPage } from './feature/TiposElementoLimpieza/pages/NuevoTipoElementoPage.tsx'
import { EditarTipoElementoPage } from './feature/TiposElementoLimpieza/pages/EditarTipoElementoPage.tsx'

import { RecambiosElementoLimpiezaPage } from './feature/RecambiosElementosLimpieza/pages/ListPage.tsx'
import { NuevoRecambioElementoLimpiezaPage } from './feature/RecambiosElementosLimpieza/pages/NuevoRecambioElementoLimpiezaPage.tsx'
import { VerRecambioElementoLimpiezaPage } from './feature/RecambiosElementosLimpieza/pages/VerRecambioElementoLimpiezaPage.tsx'

import { ListPage as ChecklistListPage } from './feature/Checklist/pages/ListPage.tsx'
import { SuperficiesPage } from './feature/Superficies/pages/ListPage.tsx';
import { NuevaSuperficiePage } from './feature/Superficies/pages/NuevoSuperficiePage.tsx';
import { EditarSuperficiePage } from './feature/Superficies/pages/EditarSuperficiePage.tsx';

import { PlanesLimpiezaPage } from './feature/PlanesLimpieza/pages/ListPage.tsx';
import { NuevoPlanLimpiezaPage } from './feature/PlanesLimpieza/pages/NuevoPlanLimpiezaPage.tsx';
import { EditarPlanLimpiezaPage } from './feature/PlanesLimpieza/pages/EditarPlanLimpiezaPage.tsx';

import { TareasPage } from './feature/Tareas/pages/ListPage.tsx';
import { HistorialPage } from './feature/Historial/pages/ListPage.tsx';
import { ListPage as InsumoQuimicoListPage } from './feature/InsumosQuimicos/pages/ListPage.tsx'

import { NuevoInsumoQuimicoPage } from './feature/InsumosQuimicos/pages/NuevoInsumoQuimicoPage.tsx'
import { EditarInsumoQuimicoPage } from './feature/InsumosQuimicos/pages/EditarInsumoQuimicoPage.tsx'
import { VerInsumoQuimicoPage } from './feature/InsumosQuimicos/pages/VerInsumoQuimicoPage.tsx'

import { ListPage as TipoQuimicoListPage } from './feature/TiposQuimicos/pages/ListPage.tsx'
import { NuevoTipoQuimicoPage } from './feature/TiposQuimicos/pages/NuevoTipoQuimicoPage.tsx'
import { EditarTipoQuimicoPage } from './feature/TiposQuimicos/pages/EditarTipoQuimicoPage.tsx'
import { VerTipoQuimicoPage } from './feature/TiposQuimicos/pages/VerTipoQuimicoPage.tsx'

import { ListPage as ConsumoProductoListPage } from './feature/ConsumoProducto/pages/ListPage.tsx'
import { EditarConsumoProductoPage } from './feature/ConsumoProducto/pages/EditarConsumoProductoPage.tsx'
import { NuevoConsumoProductoPage } from './feature/ConsumoProducto/pages/NuevoConsumoProductoPage.tsx'
import { ConsumoAcumuladoPage } from './feature/ConsumoProducto/pages/ConsumoAcumuladoPage.tsx'

import { ListPage as TipoDocumentoListPage } from './feature/TiposDocumentos/pages/ListPage.tsx'
import { EditarTipoDocumentoPage } from './feature/TiposDocumentos/pages/EditarTipoDocumentoPage.tsx'
import { NuevoTipoDocumentoPage } from './feature/TiposDocumentos/pages/NuevoTipoDocumentoPage.tsx'
import { VerTipoDocumentoPage } from './feature/TiposDocumentos/pages/VerTipoDocumentoPage.tsx'

import { ListPage as DocumentoListPage } from './feature/Documentos/pages/ListPage.tsx'
import { EditarDocumentoPage } from './feature/Documentos/pages/EditarDocumentoPage.tsx'
import { NuevoDocumentoPage } from './feature/Documentos/pages/NuevoDocumentoPage.tsx'
import { VerDocumentoPage } from './feature/Documentos/pages/VerDocumentoPage.tsx'

import { ListPage as VersionDocumentoListPage } from './feature/VersionesDocumentos/pages/ListPage.tsx'
import { EditarVersionDocumentoPage } from './feature/VersionesDocumentos/pages/EditarVersionDocumentoPage.tsx'
import { NuevaVersionDocumentoPage } from './feature/VersionesDocumentos/pages/NuevaVersionDocumentoPage.tsx'
import { VerVersionDocumentoPage } from './feature/VersionesDocumentos/pages/VerVersionDocumentoPage.tsx'


import { VerDetalleTareaOcurrenciaPage } from './feature/Historial/pages/VerDetalleTareaOcurrenciaPage.tsx'
import { NotificacionesPage } from './feature/Notificaciones/pages/ListPage.tsx'

import { ListPage as TipoVencimientoListPage } from './feature/TiposVencimientos/pages/ListPage.tsx'
import { EditarTipoVencimientoPage } from './feature/TiposVencimientos/pages/EditarTipoVencimientoPage.tsx'
import { NuevoTipoVencimientoPage } from './feature/TiposVencimientos/pages/NuevoTipoVencimientoPage.tsx'
import { VerTipoVencimientoPage } from './feature/TiposVencimientos/pages/VerTipoVencimientoPage.tsx'

import { ListPage as VencimientoPersonalListPage } from './feature/VencimientoPersonal/pages/ListPage.tsx'
import { EditarVencimientoPersonalPage } from './feature/VencimientoPersonal/pages/EditarVencimientoPersonalPage.tsx'
import { NuevoVencimientoPersonalPage } from './feature/VencimientoPersonal/pages/NuevoVencimientoPersonalPage.tsx'
import { VerVencimientoPersonalPage } from './feature/VencimientoPersonal/pages/VerVencimientoPersonalPage.tsx'
import { VencimientoConsolidadoPage } from './feature/VencimientoPersonal/pages/ListadoConsolidadoVencimientoPersonal.tsx'

import { ListPage as TipoIncidenteListPage } from './feature/TiposIncidentes/pages/ListPage.tsx'
import { EditarTipoIncidentePage } from './feature/TiposIncidentes/pages/EditarTipoIncidentePage.tsx'
import { NuevoTipoIncidentePage } from './feature/TiposIncidentes/pages/NuevoTipoIncidentePage.tsx'
import { VerTipoIncidentePage } from './feature/TiposIncidentes/pages/VerTipoIncidentePage.tsx'
import { ListPage as AditivosListPage } from './feature/Aditivos/pages/ListPage.tsx'
import { NuevoAditivoPage } from './feature/Aditivos/pages/NuevoAditivoPage.tsx'
import { EditarAditivoPage } from './feature/Aditivos/pages/EditarAditivoPage.tsx'

import { EditarIncidentePage } from './feature/Incidentes/pages/EditarIncidentePage.tsx'
import { NuevoIncidentePage } from './feature/Incidentes/pages/NuevoIncidentePage.tsx'
import { VerIncidentePage } from './feature/Incidentes/pages/VerIncidentePage.tsx'
import { IncidentesHistorialPage } from './feature/IncidentesHistorial/pages/ListPage.tsx'

import { ConfiguracionSistemaPage } from './feature/ConfiguracionSistema/pages/ConfiguracionSistemaPage.tsx'
import { VistaPublicaPage } from './feature/ConfiguracionSistema/pages/VistaPublicaPage.tsx'
import { VistaPublicaVisitantePage } from './feature/ConfiguracionSistema/pages/VistaPublicaVisitantePage.tsx'

import { VencimientosConsolidadosPage } from './feature/VencimientosConsolidados/pages/VencimientosConsolidadosPage.tsx'

import { PlanesCalibracionPage } from './feature/PlanesCalibracion/pages/PlanesCalibracionPage.tsx'
import { NuevoPlanCalibracionPage } from './feature/PlanesCalibracion/pages/NuevoPlanCalibracionPage.tsx'
import { EditarPlanCalibracionPage } from './feature/PlanesCalibracion/pages/EditarPlanCalibracionPage.tsx'

import { ListPage as UnidadMedidaListPage } from './feature/UnidadMedida/pages/ListPage.tsx'
import { NuevaUnidadMedidaPage } from './feature/UnidadMedida/pages/NuevaUnidadMedidaPage.tsx'
import { EditarUnidadMedidaPage } from './feature/UnidadMedida/pages/EditarUnidadMedidaPage.tsx'
import { VerUnidadMedidaPage } from './feature/UnidadMedida/pages/VerUnidadMedidaPage.tsx'

import { ListPage as ProductoListPage } from './feature/Productos/pages/ListPage.tsx'
import { NuevoProductoPage } from './feature/Productos/pages/NuevoProductoPage.tsx'
import { EditarProductoPage } from './feature/Productos/pages/EditarProductoPage.tsx'
import { VerProductoPage } from './feature/Productos/pages/VerProductoPage.tsx'
import { EscalarRecetaPage } from './feature/Recetas/pages/EscalarRecetaPage.tsx'

import { LotesHistorialPage } from './feature/LoteProduccionHistorial/pages/ListPage.tsx'
import { ListPage as LoteProduccionListPage } from './feature/LotesProduccion/pages/ListPage.tsx'
import { NuevoLoteProduccionPage } from './feature/LotesProduccion/pages/NuevoLoteProduccionPage.tsx'
import { EditarLoteProduccionPage } from './feature/LotesProduccion/pages/EditarLoteProduccionPage.tsx'
import { VerLoteProduccionPage } from './feature/LotesProduccion/pages/VerLoteProduccionPage.tsx'

import { ListPage as ProveedorListPage } from './feature/Proveedores/pages/ListPage.tsx'
import { NuevoProveedorPage } from './feature/Proveedores/pages/NuevoProveedorPage.tsx'
import { EditarProveedorPage } from './feature/Proveedores/pages/EditarProveedorPage.tsx'
import { VerProveedorPage } from './feature/Proveedores/pages/VerProveedorPage.tsx'

import { ListPage as LoteProveedorListPage } from './feature/LotesProveedor/pages/ListPage.tsx'
import { NuevoLoteProveedorPage } from './feature/LotesProveedor/pages/NuevoLoteProveedorPage.tsx'
import { EditarLoteProveedorPage } from './feature/LotesProveedor/pages/EditarLoteProveedorPage.tsx'
import { VerLoteProveedorPage } from './feature/LotesProveedor/pages/VerLoteProveedorPage.tsx'

import { ListPage as ClientesListPage } from './feature/Clientes/pages/ListPage.tsx'
import { NuevoClientePage } from './feature/Clientes/pages/NuevoClientePage.tsx'
import { EditarClientePage } from './feature/Clientes/pages/EditarClientePage.tsx'
import { VerClientePage } from './feature/Clientes/pages/VerClientePage.tsx'

import { ListPage as InsumoLoteListPage } from './feature/InsumosLote/pages/ListPage.tsx'
import { VerInsumoLotePage } from './feature/InsumosLote/pages/VerInsumoLotePage.tsx'

import { ListPage as PedidosProveedorListPage } from './feature/PedidosProveedor/pages/Listpage.tsx'
import { NuevoPedidoProveedorPage } from './feature/PedidosProveedor/pages/NuevoPedidoProveedorPage.tsx'
import { EditarPedidoProveedorPage } from './feature/PedidosProveedor/pages/EditarPedidoProveedorPage.tsx'
import { VerPedidoProveedorPage } from './feature/PedidosProveedor/pages/VerPedidoProveedorPage.tsx'


import { Login, NoAutorizado } from './feature/auth'
import AuthLayout from './layouts/AuthLayout.tsx'
import { ProtectedRoute } from './components/ProtectedRoute.tsx'
import { NotificationHistoryRoute } from './components/NotificationHistoryRoute.tsx'

import App from './App.tsx'

const router = createBrowserRouter([
  {
    path: '/iniciar-sesion',
    element: <Login />,
  },
  {
    path: '/publica/:token',
    element: <VistaPublicaVisitantePage />,
  },
  {
    path: '/no-autorizado',
    element: <NoAutorizado />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/',
        element: <App />,
        children: [
          { index: true, element: <HomePage /> },
          {
            path: 'notificaciones',
            element: <ProtectedRoute requireAdmin />,
            children: [
              { index: true, element: <NotificationHistoryRoute><NotificacionesPage /></NotificationHistoryRoute> },
            ],
          },
          {
            path: 'configuracion-cuenta',
            element: <ConfiguracionCuentaPage />,
          },
          {
            path: 'configuracion-sistema',
            element: <ProtectedRoute requireAdmin />,
            children: [
              { index: true, element: <ConfiguracionSistemaPage /> },
              { path: 'vista-publica', element: <VistaPublicaPage /> },
            ],
          },
          {
            path: 'vencimientos',
            element: <ProtectedRoute requireAdmin />,
            children: [
              { index: true, element: <VencimientosConsolidadosPage /> },
            ],
          },
          {
            path: 'personal',
            element: <ProtectedRoute requireAdmin />,
            children: [
              { index: true, element: <PersonalListPage /> },
              { path: 'new', element: <NuevaPersonaPage /> },
              { path: ':id/edit', element: <EditarPersonaPage /> },
              { path: ':personaId/vencimientos', element: <VencimientoPersonalListPage /> },
              { path: ':personaId/vencimientos/new', element: <NuevoVencimientoPersonalPage /> },
              { path: ':id', element: <VerPersonalPage /> },
            ],
          },
          {
            path: 'documentos',
            children: [
              { index: true, element: <DocumentoListPage /> },
              { path: ':id', element: <VerDocumentoPage /> },
              {
                element: <ProtectedRoute requireAdmin />,
                children: [
                  { path: 'new', element: <NuevoDocumentoPage /> },
                  { path: ':id/edit', element: <EditarDocumentoPage /> },
                ],
              },
            ],
          },
          {
            path: 'versiones-documentos',
            children: [
              { path: 'documento/:documentoId', element: <VersionDocumentoListPage /> },
              { path: 'version/:id', element: <VerVersionDocumentoPage /> },
              {
                element: <ProtectedRoute requireAdmin />,
                children: [
                  { path: 'documento/:documentoId/new', element: <NuevaVersionDocumentoPage /> },
                  { path: 'version/:id/edit', element: <EditarVersionDocumentoPage /> },
                ],
              },
            ],
          },
          {
            path: 'tipos-vencimientos',
            element: <ProtectedRoute requireAdmin />,
            children: [
              { index: true, element: <TipoVencimientoListPage /> },
              { path: 'new', element: <NuevoTipoVencimientoPage /> },
              { path: ':id', element: <VerTipoVencimientoPage /> },
              { path: ':id/edit', element: <EditarTipoVencimientoPage /> },
            ],
          },
          {
            path: 'unidades-medida',
            element: <ProtectedRoute requireAdmin />,
            children: [
              { index: true, element: <UnidadMedidaListPage />},
              { path: 'new', element: <NuevaUnidadMedidaPage />},
              { path: ':id', element: <VerUnidadMedidaPage />},
              { path: ':id/edit', element: <EditarUnidadMedidaPage />},
            ],
          },
          {
            path: 'productos',
            element: <ProtectedRoute requireAdmin />,
            children: [
              { index: true, element: <ProductoListPage />},
              { path: 'new', element: <NuevoProductoPage />},
              { path: ':id/edit', element: <EditarProductoPage />},
              { path: ':id', element: <VerProductoPage />},
              { path: ':id/receta/escalar', element: <EscalarRecetaPage />},
            ],
          },
          {
            path: 'pedidos-proveedor',
            element: <ProtectedRoute requireAdmin />,
            children: [
              { index: true, element: <PedidosProveedorListPage />},
              { path: 'new', element: <NuevoPedidoProveedorPage />},
              { path: ':id/edit', element: <EditarPedidoProveedorPage />},
              { path: ':id', element: <VerPedidoProveedorPage />},
            ]
          },
          {
            path: 'lotes-historial',
            element: <ProtectedRoute requireAdmin />,
            children: [
              { index: true, element: <LotesHistorialPage /> },
            ],
          },
          {
            path: 'vencimiento-personal',
            element: <ProtectedRoute requireAdmin />,
            children: [
              { index: true, element: <VencimientoConsolidadoPage /> },
              { path: ':id', element: <VerVencimientoPersonalPage /> },
              { path: ':id/edit', element: <EditarVencimientoPersonalPage /> },
            ],
          },
          {
            path: 'insumos-lote',
            children: [
              { index: true, element: <InsumoLoteListPage />},
              { path: ':id', element: <VerInsumoLotePage />}
            ]
          },
          {
            path: 'clientes',
            element: <ProtectedRoute requireAdmin />,
            children: [
              { index: true, element: <ClientesListPage />},
              { path: 'new', element: <NuevoClientePage />},
              { path: ':id', element: <VerClientePage />},
              { path: ':id/edit', element: <EditarClientePage />},
            ]
          },
          { path: 'tareas', element: <TareasPage /> },
          { path: 'checklist', element: <ChecklistListPage /> },
          {
            path: 'incidentes',
            children: [
              { index: true, element: <IncidentesPage /> },
              { path: 'abiertos', element: <IncidentesPage /> },
              { path: ':id', element: <VerIncidentePage /> },
              { path: 'new', element: <NuevoIncidentePage /> },
              { path: ':id/edit', element: <EditarIncidentePage /> },
            ],
          },
          {
            path: 'planes-limpieza',
            children: [
              { index: true, element: <PlanesLimpiezaPage /> },
              {
                element: <ProtectedRoute requireAdmin />,
                children: [
                  { path: 'new', element: <NuevoPlanLimpiezaPage /> },
                  { path: ':id/edit', element: <EditarPlanLimpiezaPage /> },
                ],
              },
            ],
          },
          {
            path: 'insumos-quimicos',
            children: [
              { index: true, element: <InsumoQuimicoListPage /> },
              { path: ':id', element: <VerInsumoQuimicoPage /> },
              {
                element: <ProtectedRoute requireAdmin />,
                children: [
                  { path: 'new', element: <NuevoInsumoQuimicoPage /> },
                  { path: ':id/edit', element: <EditarInsumoQuimicoPage /> },
                ],
              },
            ],
          },
          {
            path: 'consumos-productos',
            children: [
              { index: true, element: <ConsumoProductoListPage /> },
              { path: 'tarea/:id', element: <ConsumoProductoListPage /> },
              {
                element: <ProtectedRoute requireAdmin />,
                children: [
                  { path: 'new', element: <NuevoConsumoProductoPage /> },
                  { path: ':id/edit', element: <EditarConsumoProductoPage /> },
                  { path: 'consulta', element: <ConsumoAcumuladoPage /> },
                ],
              },
            ],
          },
          {
            path: 'elementos-limpieza',
            children: [
              { index: true, element: <ElementosLimpiezaPage /> },
              { path: ':id', element: <VerElementoPage /> },
              {
                element: <ProtectedRoute requireAdmin />,
                children: [
                  { path: 'new', element: <NuevoElementoPage /> },
                  { path: ':id/edit', element: <EditarElementoPage /> },
                ],
              },
            ],
          },
          {
            path: "recambios-elementos-limpieza",
            children: [
              { index: true, element: <RecambiosElementoLimpiezaPage /> },
              { path: "new", element: <NuevoRecambioElementoLimpiezaPage /> },
              { path: "new/:elementoId", element: <NuevoRecambioElementoLimpiezaPage /> },
              { path: ":id", element: <VerRecambioElementoLimpiezaPage /> },
            ],
          },
          {
            path: 'equipos',
            children: [
              { index: true, element: <EquiposPage /> },
              {
                element: <ProtectedRoute requireAdmin />,
                children: [
                  { path: 'new', element: <NuevoEquipoPage /> },
                  { path: ':id/edit', element: <EditarEquipoPage /> },
                ],
              },
            ],
          },
          {
            path: 'planes-calibracion',
            children: [
              { index: true, element: <PlanesCalibracionPage /> },
              {
                element: <ProtectedRoute requireAdmin />,
                children: [
                  { path: 'new', element: <NuevoPlanCalibracionPage /> },
                  { path: ':id/edit', element: <EditarPlanCalibracionPage /> },
                ],
              },
            ],
          },
          {
            path: 'insumos',
            children: [
              { index: true, element: <InsumosListPage /> },
              { path: ':id', element: <VerInsumoPage /> },
              {
                element: <ProtectedRoute requireAdmin />,
                children: [
                  { path: 'new', element: <NuevoInsumoPage /> },
                  { path: ':id/edit', element: <EditarInsumoPage /> },
                ],
              },
            ],
          },
          {
            path: 'lotes-produccion',
            children: [
              { index: true, element: <LoteProduccionListPage />},
              { path: 'new', element: <NuevoLoteProduccionPage />},
              { path: ':id/edit', element: <EditarLoteProduccionPage />},
              { path: ':id', element: <VerLoteProduccionPage />},
            ],
          },
          {
            path: 'proveedores',
            element: <ProtectedRoute requireAdmin />,
            children: [
              { index: true, element: <ProveedorListPage /> },
              { path: 'new', element: <NuevoProveedorPage /> },
              { path: ':id', element: <VerProveedorPage /> },
              { path: ':id/edit', element: <EditarProveedorPage /> },
            ]
          },
          {
            path: 'recepciones',
            children: [
              { index: true, element: <LoteProveedorListPage /> },
              { path: 'new', element: <NuevoLoteProveedorPage /> },
              { path: ':id', element: <VerLoteProveedorPage />},
              { path: ':id/edit', element: <EditarLoteProveedorPage />}
            ]
          },
          {
            path: 'historial',
            element: <ProtectedRoute requireAdmin />,
            children: [
              { index: true, element: <HistorialPage /> },
            ],
          },
          {
            path: 'tareas-ocurrencia',
            element: <ProtectedRoute requireAdmin />,
            children: [
              { path: ':id', element: <VerDetalleTareaOcurrenciaPage /> }
            ]
          },
          {
            path: 'incidentes-historial',
            element: <ProtectedRoute requireAdmin />,
            children: [
              { index: true, element: <IncidentesHistorialPage /> },
            ],
          },
          {
            path: 'sectores',
            element: <ProtectedRoute requireAdmin />,
            children: [
              { index: true, element: <SectoresPage /> },
              { path: 'new', element: <NuevoSectorPage /> },
              { path: ':id/edit', element: <EditarSectorPage /> },
            ],
          },
          {
            path: 'superficies',
            element: <ProtectedRoute requireAdmin />,
            children: [
              { index: true, element: <SuperficiesPage /> },
              { path: 'new', element: <NuevaSuperficiePage /> },
              { path: ':id/edit', element: <EditarSuperficiePage /> },
            ],
          },
          {
            path: 'tipos-quimicos',
            children: [
              { index: true, element: <TipoQuimicoListPage /> },
              { path: ':id', element: <VerTipoQuimicoPage /> },
              {
                element: <ProtectedRoute requireAdmin />,
                children: [
                  { path: 'new', element: <NuevoTipoQuimicoPage /> },
                  { path: ':id/edit', element: <EditarTipoQuimicoPage /> },
                ],
              },
            ],
          },
          {
            path: "tipos-elementos-limpieza",
            element: <ProtectedRoute requireAdmin />,
            children: [
              { index: true, element: <TiposElementoLimpiezaPage /> },
              { path: "new", element: <NuevoTipoElementoPage /> },
              { path: ":id/edit", element: <EditarTipoElementoPage /> },
            ],
          },
          {
            path: 'tipos-documentos',
            children: [
              { index: true, element: <TipoDocumentoListPage /> },
              { path: ':id', element: <VerTipoDocumentoPage /> },
              {
                element: <ProtectedRoute requireAdmin />,
                children: [
                  { path: 'new', element: <NuevoTipoDocumentoPage /> },
                  { path: ':id/edit', element: <EditarTipoDocumentoPage /> },
                ],
              },
            ],
          },
          {
            path: 'tipos-incidentes',
            element: <ProtectedRoute requireAdmin />,
            children: [
              { index: true, element: <TipoIncidenteListPage /> },
              { path: 'new', element: <NuevoTipoIncidentePage /> },
              { path: ':id', element: <VerTipoIncidentePage /> },
              { path: ':id/edit', element: <EditarTipoIncidentePage /> },
            ],
          },
          {
            path: 'aditivos',
            element: <ProtectedRoute requireAdmin />,
            children: [
              { index: true, element: <AditivosListPage /> },
              { path: 'new', element: <NuevoAditivoPage /> },
              { path: ':id/edit', element: <EditarAditivoPage /> },
            ],
          },
          { path: '*', element: <Page404 /> }
        ],
      },
    ],
  },
])

export default router
