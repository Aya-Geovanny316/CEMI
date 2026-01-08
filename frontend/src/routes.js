import React from 'react';

const DashboardDefault = React.lazy(() => import('./Demo/Dashboard/Default'));
const Roles = React.lazy(() => import('./pages/roles/Index'));

const Error404 = React.lazy(() => import('./pages/404/Index'));
const Construccion = React.lazy(() => import('./pages/construccion/Index'));
const Futuro = React.lazy(() => import('./pages/futuro/Index'));

/* ADMISIONES PAGINAS */
const NuevaAdmision = React.lazy(() => import('./pages/admisiones/nuevaAdmision/Index'));
const ListadoAdmisiones = React.lazy(() => import('./pages/admisiones/listadoAdmisiones/Index'));
const EstadoCuenta = React.lazy(() => import('./pages/admisiones/estadoCuentas/Index'));
const ConsultaExterna = React.lazy(() => import('./pages/admisiones/consultaExterna/Index'));
const AdmisionCaja = React.lazy(() => import('./pages/admisiones/caja/Index'));

/* Inventarios */
const InventarioProveedores = React.lazy(() => import('./pages/inventarios/proveedores/Index'));
const inventarioMarca = React.lazy(() => import('./pages/inventarios/marcas/Index'));
const InventarioMovimiento = React.lazy(() => import('./pages/inventarios/historicoMovimientos/Index'));
const InventarioSku = React.lazy(() => import('./pages/inventarios/gestionSku/Index'));
const InventarioStock = React.lazy(() => import('./pages/inventarios/stock/Index'));
const InventarioVerPrecios = React.lazy(() => import('./pages/inventarios/verPrecio/Index'));

/* Bodegas */
const InventarioComprasGenerar = React.lazy(() => import('./pages/bodegas/compras/generar/Index'));
const InventarioComprasVisualizar = React.lazy(() => import('./pages/bodegas/compras/visualizar/Index'));
const InventarioComprasOrden = React.lazy(() => import('./pages/bodegas/compras/orden/Index'));
const InventarioEntradas = React.lazy(() => import('./pages/bodegas/entradas/Index'));

/* Pacientes */
const DataPacientes = React.lazy(() => import('./pages/pacientes/subPages/infoPaciente/index'));
const Consulta = React.lazy(() => import('./pages/consulta/Index'));

/* Mantenimiento */
const Users = React.lazy(() => import('./pages/mantenimiento/users/Index'));
const InventarioSeguros = React.lazy(() => import('./pages/mantenimiento/seguros/Index'));
const CargaMasivaExistencias = React.lazy(() => import('./pages/mantenimiento/cargaMasiva/existencias/Index'));


/* ====== PERMISOS ====== */

const getEffectivePermissions = () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      return [];
    }
    const parsed = JSON.parse(storedUser);
    return (parsed?.roles || [])
      .map((role) => Number(role?.id ?? role))
      .filter((roleId) => !Number.isNaN(roleId));
  } catch (error) {
    console.warn('No se pudieron obtener los roles del usuario desde localStorage:', error);
    return [];
  }
};

const canAccess = (allowed) => {
  if (allowed == null) {
    return true;
  }
  const normalized = Array.isArray(allowed) ? allowed : [allowed];
  const effectivePermissions = getEffectivePermissions();
  return effectivePermissions.some((roleId) => normalized.includes(roleId));
};

const withGuard = (Component, allowed) => {
  if (allowed == null) {
    return Component;
  }

  const GuardedComponent = (props) => {
    if (!canAccess(allowed)) {
      return <Error404 {...props} />;
    }
    return <Component {...props} />;
  };

  GuardedComponent.displayName = `Guarded(${Component.displayName || Component.name || 'Component'})`;
  return GuardedComponent;
};

/**
 * ROLES DEFINIDOS EN BD
 * 1: admin
 * 2: secretaria
 * 3: medico
 */
const R = {
  ADMIN: 1,
  SECRETARIA: 2,
  MEDICO: 3,
};

const ALL = [R.ADMIN, R.SECRETARIA, R.MEDICO];
const ADMIN_SECRETARIA = [R.ADMIN, R.SECRETARIA];
const ADMIN_MEDICO = [R.ADMIN, R.MEDICO];

/* ====== RUTAS ====== */
const routes = [
  // Acceso abierto / Común
  { path: '/dashboard/default', exact: true, name: 'Default', component: DashboardDefault },
  { path: '/dashboard/404', exact: true, name: '404', component: Error404 },
  { path: '/dashboard/construccion', exact: true, name: 'Construccion', component: Construccion },
  { path: '/dashboard/futuro', exact: true, name: 'Futuro', component: Futuro },

  // --- ADMISIONES (Secretaria) ---
  {
    path: '/dashboard/ingresos/nueva-solicitud',
    exact: true,
    name: 'Nueva Admision',
    component: withGuard(NuevaAdmision, ADMIN_SECRETARIA),
  },
  {
    path: '/dashboard/ingresos/gestion-registros',
    exact: true,
    name: 'Listar Admision',
    component: withGuard(ListadoAdmisiones, ADMIN_SECRETARIA),
  },
  {
    path: '/dashboard/ingresos/resumen-estados',
    exact: true,
    name: 'Estado de Cuenta',
    component: withGuard(EstadoCuenta, ADMIN_SECRETARIA),
  },
  {
    path: '/dashboard/ingresos/consulta-programada',
    exact: true,
    name: 'Consulta Externa',
    component: withGuard(ConsultaExterna, ADMIN_SECRETARIA),
  },
  {
    path: '/dashboard/ingresos/caja-operaciones',
    exact: true,
    name: 'Caja',
    component: withGuard(AdmisionCaja, ADMIN_SECRETARIA),
  },

  // --- INVENTARIO (Secretaria Ver/Vender, Admin Gestión) ---
  {
    path: '/dashboard/inventario/proveedores',
    exact: true,
    name: 'Proveedores',
    component: withGuard(InventarioProveedores, [R.ADMIN]),
  },
  {
    path: '/dashboard/inventario/marcas',
    exact: true,
    name: 'Marcas',
    component: withGuard(inventarioMarca, [R.ADMIN]),
  },
  {
    path: '/dashboard/inventario/movimientos',
    exact: true,
    name: 'Movimientos',
    component: withGuard(InventarioMovimiento, [R.ADMIN]),
  },
  {
    path: '/dashboard/inventario/productos',
    exact: true,
    name: 'Productos',
    component: withGuard(InventarioSku, [R.ADMIN]),
  },
  {
    path: '/dashboard/inventario/stock',
    exact: true,
    name: 'Stock',
    component: withGuard(InventarioStock, ADMIN_SECRETARIA), // Secretaria ve existencias para venta
  },
  {
    path: '/dashboard/inventario/ver-precios',
    exact: true,
    name: 'Ver Precios',
    component: withGuard(InventarioVerPrecios, ADMIN_SECRETARIA),
  },

  // --- BODEGAS / COMPRAS ---
  {
    path: '/dashboard/bodegas/compras/generar',
    exact: true,
    name: 'Generar Requisición',
    component: withGuard(InventarioComprasGenerar, [R.ADMIN]),
  },
  {
    path: '/dashboard/bodegas/compras/visualizar',
    exact: true,
    name: 'Visualizar Requisiciones',
    component: withGuard(InventarioComprasVisualizar, ADMIN_SECRETARIA), // Secretaria autorizada ver compras
  },
  {
    path: '/dashboard/bodegas/compras/orden',
    exact: true,
    name: 'Orden de Compra',
    component: withGuard(InventarioComprasOrden, [R.ADMIN]),
  },
  {
    path: '/dashboard/bodegas/entradas',
    exact: true,
    name: 'Entradas',
    component: withGuard(InventarioEntradas, [R.ADMIN]),
  },

  // --- PACIENTES / CONSULTA (Médico) ---
  {
    path: '/dashboard/consulta',
    exact: true,
    name: 'Consulta',
    component: withGuard(Consulta, ADMIN_MEDICO),
  },
  {
    path: '/dashboard/pacientes/info-paciente',
    exact: true,
    name: 'Info Paciente',
    component: DataPacientes, // Acceso general (controlado internamente o read-only)
  },

  // --- MANTENIMIENTO (Admin) ---
  {
    path: '/dashboard/mantenimiento/users',
    exact: true,
    name: 'Usuarios',
    component: withGuard(Users, [R.ADMIN]),
  },
  {
    path: '/dashboard/mantenimiento/seguros',
    exact: true,
    name: 'Seguros',
    component: withGuard(InventarioSeguros, [R.ADMIN]),
  },
  {
    path: '/dashboard/mantenimiento/carga-masiva/existencias',
    exact: true,
    name: 'Carga Masiva',
    component: withGuard(CargaMasivaExistencias, [R.ADMIN]),
  },
];

export default routes;