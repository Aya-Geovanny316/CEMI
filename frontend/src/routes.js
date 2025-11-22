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
const EstadoHabitaciones = React.lazy(() => import('./pages/admisiones/estadoHabitacion/Index'));
const ConsultaExterna = React.lazy(() => import('./pages/admisiones/consultaExterna/Index'));
const AdmisionCaja = React.lazy(() => import('./pages/admisiones/caja/Index'));
const AdmisionSeguro = React.lazy(() => import('./pages/admisiones/seguros/Index'));

/* Inventarios */
const InventarioProveedores = React.lazy(() => import('./pages/inventarios/proveedores/Index'));
const inventarioMarca = React.lazy(() => import('./pages/inventarios/marcas/Index'));
const InventarioUnidadesMedida = React.lazy(() => import('./pages/inventarios/unidadesMedida/Index'));
const InventarioCategorias = React.lazy(() => import('./pages/inventarios/categorias/Index'));
const InventarioMovimiento = React.lazy(() => import('./pages/inventarios/historicoMovimientos/Index'));
const InventarioBodega = React.lazy(() => import('./pages/inventarios/bodegas/Index'));
const InventarioSku = React.lazy(() => import('./pages/inventarios/gestionSku/Index'));
const InventarioStock = React.lazy(() => import('./pages/inventarios/stock/Index'));
const InventarioPrecios = React.lazy(() => import('./pages/inventarios/actualizarPrecio/Index'));
const InventarioPrincipiosActivos = React.lazy(() => import('./pages/inventarios/principiosActivos/Index'));
const InventarioVerPrecios = React.lazy(() => import('./pages/inventarios/verPrecio/Index'));

/* Bodegas */
const InventarioComprasGenerar = React.lazy(() => import('./pages/bodegas/compras/generar/Index'));
const InventarioComprasVisualizar = React.lazy(() => import('./pages/bodegas/compras/visualizar/Index'));
const InventarioComprasOrden = React.lazy(() => import('./pages/bodegas/compras/orden/Index'));
const InventarioComprasOrdenDetalle = React.lazy(() => import('./pages/bodegas/compras/orden/Detail'));
const InventarioEntradas = React.lazy(() => import('./pages/bodegas/entradas/Index'));
const InventarioSalidas = React.lazy(() => import('./pages/bodegas/salidas/Index'));
const InventarioTraslados = React.lazy(() => import('./pages/bodegas/traslados/Index'));

/* Pacientes */
const PacientesEnfermeria = React.lazy(() => import('./pages/pacientes/enfermeria/Index'));
const PacientesEnfermeriaFrame = React.lazy(() => import('./pages/pacientes/enfermeria/Frame'));
const PacientesMedicosResidentes = React.lazy(() => import('./pages/pacientes/medicosResidentes/Index'));
const PacientesMedicosTratantes = React.lazy(() => import('./pages/pacientes/medicosTratantes/Index'));
const PacientesDevoluciones = React.lazy(() => import('./pages/pacientes/devoluciones/Index'));
const PacientesCalendario = React.lazy(() => import('./pages/pacientes/calendario/Index'));
const DataPacientes = React.lazy(() => import('./pages/pacientes/subPages/infoPaciente/index'));

/* Mantenimiento */
const MantenimientoHabitacion = React.lazy(() => import('./pages/mantenimiento/estadoHabitacion/Index'));
const Users = React.lazy(() => import('./pages/mantenimiento/users/Index'));
const UsersDoctores = React.lazy(() => import('./pages/mantenimiento/doctor/Index'));
const InventarioSeguros = React.lazy(() => import('./pages/mantenimiento/seguros/Index'));
const DirectorioExtensiones = React.lazy(() => import('./pages/mantenimiento/directorioExtensiones/Index'));
const centroCostos = React.lazy(() => import('./pages/mantenimiento/centroCostos/Index'));
const departamentos = React.lazy(() => import('./pages/mantenimiento/departamentos/Index')); 
const cuentasContables = React.lazy(() => import('./pages/mantenimiento/cuentasContables/Index'));
const CargaMasivaExistencias = React.lazy(() => import('./pages/mantenimiento/cargaMasiva/existencias/Index'));
const CargaMasivaPrecios = React.lazy(() => import('./pages/mantenimiento/cargaMasiva/precios/Index'));

/* Reportes */
const HIstorialGeneral = React.lazy(() => import('./pages/reportes/historialGeneral/Index'));
const UsersReporte = React.lazy(() => import('./pages/reportes/usuarios/Index'));
const InventarioReporte = React.lazy(() => import('./pages/reportes/inventarios/Index'));


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
 * Mapa de roles por módulo (IDs según tu hoja/screenshot)
 * 1  admin
 * Admisiones: 2,3,4,5
 * Inventario: 6,7,8,9
 * Bodegas: 10,11,12,13
 * Pacientes: 14,15,16,17,18,19
 * Examenes: 20,21,22
 * Mantenimiento: 23,24,25
 * 26 doctor
 */
const R = {
  ADMIN: 1,
  ADMISIONES: [1, 2, 3, 4, 5],
  INVENTARIO: [1, 6, 7, 8, 9],
  BODEGAS: [1, 10, 11, 12, 13],
  // Remover 14 de PACIENTES: rol 14 tendrá acceso únicamente a Compras > Visualizar
  PACIENTES: [1, 15, 16, 17, 18, 19],
  EXAMENES: [1, 20, 21, 22],
  MANTENIMIENTO: [1, 23, 24, 25],
  DOCTOR: [26],
};
const ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26];
// Roles para gestión de inventario (admin y operador 8; excluye 6,7,9)
const INVENTARIO_GESTION = [1, 8];
// Roles para consulta de inventario (stock y movimientos): admin, 7, 8 (excluye 9)
const INVENTARIO_CONSULTA = [1, 7, 8];
// Ver precios: admin, 6, 8 (excluye 9)
const INVENTARIO_VER_PRECIOS = [1, 6, 8];
// Todos excepto 6,7,8,9 (excluye perfiles de inventario de Reportes)
const ALL_EXCEPT_6_7_8 = ALL.filter((rid) => rid !== 6 && rid !== 7 && rid !== 8 && rid !== 9);

/* ====== RUTAS ====== */
const routes = [
  // Acceso abierto (dashboard / soporte / placeholders)
  { path: '/dashboard/default', exact: true, name: 'Default', component: DashboardDefault },
  { path: '/dashboard/roles', exact: true, name: 'Roles', component: withGuard(Roles, [R.ADMIN]) },
  { path: '/dashboard/users', exact: true, name: 'Users', component: withGuard(Users, R.MANTENIMIENTO) },
  { path: '/dashboard/404', exact: true, name: '404', component: Error404 },
  { path: '/dashboard/construccion', exact: true, name: '404', component: Construccion },
  { path: '/dashboard/futuro', exact: true, name: '404', component: Futuro },

  // -------------------------------------------------------------------------------------------------------------------------------
  /* Admisiones */
  {
    path: '/dashboard/ingresos/nueva-solicitud',
    exact: true,
    name: 'Nueva Admision',
    component: withGuard(NuevaAdmision, R.ADMISIONES),
  },
  {
    path: '/dashboard/ingresos/gestion-registros',
    exact: true,
    name: 'Listar Admision',
    component: withGuard(ListadoAdmisiones, R.ADMISIONES),
  },
  {
    path: '/dashboard/ingresos/resumen-estados',
    exact: true,
    name: 'Listar Admision',
    component: withGuard(EstadoCuenta, R.ADMISIONES),
  },
  {
    path: '/dashboard/ingresos/consulta-programada',
    exact: true,
    name: 'Consulta Externa',
    component: withGuard(ConsultaExterna, R.ADMISIONES),
  },
  {
    path: '/dashboard/ingresos/caja-operaciones',
    exact: true,
    name: 'Caja',
    component: withGuard(AdmisionCaja, R.ADMISIONES),
  },
  {
    path: '/dashboard/ingresos/censo-habitaciones',
    exact: true,
    name: 'Estado Habitaciones',
    component: withGuard(EstadoHabitaciones, R.ADMISIONES),
  },
  {
    path: '/dashboard/ingresos/aseguradoras',
    exact: true,
    name: 'Seguros',
    component: withGuard(AdmisionSeguro, R.ADMISIONES),
  },

  /* Inventario */
  {
    path: '/dashboard/inventario/proveedores',
    exact: true,
    name: 'Inventario Proveedores',
    component: withGuard(InventarioProveedores, INVENTARIO_GESTION),
  },
  {
    path: '/dashboard/inventario/marcas',
    exact: true,
    name: 'Inventario Marcas',
    component: withGuard(inventarioMarca, INVENTARIO_GESTION),
  },
  {
    path: '/dashboard/inventario/unidades-medida',
    exact: true,
    name: 'Inventario Unidades de Medida',
    component: withGuard(InventarioUnidadesMedida, INVENTARIO_GESTION),
  },
  {
    path: '/dashboard/inventario/categorias',
    exact: true,
    name: 'Inventario Categorias',
    component: withGuard(InventarioCategorias, INVENTARIO_GESTION),
  },
  {
    path: '/dashboard/inventario/movimientos',
    exact: true,
    name: 'Inventario Movimientos',
    component: withGuard(InventarioMovimiento, INVENTARIO_CONSULTA),
  },
  {
    path: '/dashboard/inventario/bodegas',
    exact: true,
    name: 'Inventario Bodega',
    component: withGuard(InventarioBodega, [1]),
  },
  {
    path: '/dashboard/inventario/productos',
    exact: true,
    name: 'Productos',
    component: withGuard(InventarioSku, INVENTARIO_GESTION),
  },
  {
    path: '/dashboard/inventario/stock',
    exact: true,
    name: 'Stock',
    component: withGuard(InventarioStock, INVENTARIO_CONSULTA),
  },
  {
    path: '/dashboard/inventario/precios',
    exact: true,
    name: 'Precios',
    component: withGuard(InventarioPrecios, [1, 9]),
  },
  {
    path: '/dashboard/inventario/principiosActivos',
    exact: true,
    name: 'Principios Activos',
    component: withGuard(InventarioPrincipiosActivos, INVENTARIO_GESTION),
  },
  {
    path: '/dashboard/inventario/ver-precios',
    exact: true,
    name: 'Ver Precios',
    component: withGuard(InventarioVerPrecios, INVENTARIO_VER_PRECIOS),
  },
  /* Bodegas */
  {
    path: '/dashboard/bodegas/compras/generar',
    exact: true,
    name: 'Compras - Generar Requisición',
    component: withGuard(InventarioComprasGenerar, [1, 11]),
  },
  {
    path: '/dashboard/bodegas/compras/visualizar',
    exact: true,
    name: 'Compras - Visualizar Requisiciones',
    // Incluir rol 14 (Bodega - Autoriza) con acceso exclusivo a esta opción
    component: withGuard(InventarioComprasVisualizar, [1, 11, 14]),
  },
  {
    path: '/dashboard/bodegas/compras/orden',
    exact: true,
    name: 'Compras - Orden de Compra',
    component: withGuard(InventarioComprasOrden, [1, 13]),
  },
  {
    path: '/dashboard/bodegas/compras/orden/:id',
    exact: true,
    name: 'Compras - Orden de Compra Detalle',
    component: withGuard(InventarioComprasOrdenDetalle, [1, 13]),
  },
  {
    path: '/dashboard/bodegas/entradas',
    exact: true,
    name: 'Entradas',
    component: withGuard(InventarioEntradas, [1, 10, 12]),
  },
  {
    path: '/dashboard/bodegas/salidas',
    exact: true,
    name: 'Salidas',
    component: withGuard(InventarioSalidas, [1, 10, 12]),
  },
  {
    path: '/dashboard/bodegas/traslados',
    exact: true,
    name: 'Traslados',
    component: withGuard(InventarioTraslados, [1, 10, 12]),
  },
  /*Pacientes*/
  {
    path: '/dashboard/pacientes/enfermeria',
    exact: true,
    name: 'Pacientes',
    component: withGuard(PacientesEnfermeria, R.ADMIN),
  },
  {
    path: '/dashboard/pacientes/enfermeria/iframe/:view',
    exact: true,
    name: 'Pacientes (iframe)',
    component: withGuard(PacientesEnfermeriaFrame, R.ADMIN),
  },
  {
    path: '/dashboard/pacientes/medicos-residentes',
    exact: true,
    name: 'Medicos Residentes',
    component: withGuard(PacientesMedicosResidentes, R.ADMIN),
  },
  {
    path: '/dashboard/pacientes/medicos-tratantes',
    exact: true,
    name: 'Medicos Tratantes',
    component: withGuard(PacientesMedicosTratantes, R.ADMIN),
  },
  {
    path: '/dashboard/pacientes/devoluciones',
    exact: true,
    name: 'Devoluciones a Farmacia',
    component: withGuard(PacientesDevoluciones, R.ADMIN),
  },
  {
    path: '/dashboard/pacientes/calendario-operaciones',
    exact: true,
    name: 'Calentario de Operaciones',
    component: withGuard(PacientesCalendario, R.ADMIN),
  },
  {
    path: '/dashboard/pacientes/info-paciente',
    exact: true,
    name: 'Calentario de Operaciones',
    component: DataPacientes,
  },
  
  /* Mantenimiento */
  {
    path: '/dashboard/mantenimiento/habitaciones',
    exact: true,
    name: 'Estado de Habitaciones',
    component: withGuard(MantenimientoHabitacion, R.MANTENIMIENTO),
  },
  {
    path: '/dashboard/mantenimiento/seguros',
    exact: true,
    name: 'Seguros',
    component: withGuard(InventarioSeguros, R.MANTENIMIENTO),
  },
  {
    path: '/dashboard/mantenimiento/users',
    exact: true,
    name: 'Users',
    component: withGuard(Users, R.MANTENIMIENTO),
  },
  // 🔒 DESACTIVADO — Médicos
  // {
  //   path: '/dashboard/mantenimiento/medicos',
  //   exact: true,
  //   name: 'Médicos',
  //   component: withGuard(UsersDoctores, R.MANTENIMIENTO),
  // },
  // 🔒 DESACTIVADO — Directorio de extensiones
  // {
  //   path: '/dashboard/mantenimiento/extensiones',
  //   exact: true,
  //   name: 'Directorio Extensiones',
  //   component: withGuard(DirectorioExtensiones, R.MANTENIMIENTO),
  // },
  {
    path: '/dashboard/mantenimiento/centroCostos',
    exact: true,
    name: 'Centros de Costo',
    component: withGuard(centroCostos, R.MANTENIMIENTO),
  },
  {
    path: '/dashboard/mantenimiento/departamentos',
    exact: true,
    name: 'Departamentos',
    component: withGuard(departamentos, R.MANTENIMIENTO),
  },
  {
    path: '/dashboard/mantenimiento/cuentasContables',
    exact: true,
    name: 'Cuentas Contables',
    component: withGuard(cuentasContables, R.MANTENIMIENTO),
  },
  {
    path: '/dashboard/mantenimiento/carga-masiva/existencias',
    exact: true,
    name: 'Carga Masiva Existencias',
    component: withGuard(CargaMasivaExistencias, R.MANTENIMIENTO),
  },
  {
    path: '/dashboard/mantenimiento/carga-masiva/precios',
    exact: true,
    name: 'Carga Masiva Precios',
    component: withGuard(CargaMasivaPrecios, R.MANTENIMIENTO),
  },

  /* Reportes (excluye inventario estándar 6, auxiliar 7 y operador 8) */
  {
    path: '/dashboard/reportes/historial-general',
    exact: true,
    name: 'Historial General',
    component: withGuard(HIstorialGeneral, ALL_EXCEPT_6_7_8),
  },
  {
    path: '/dashboard/reportes/users',
    exact: true,
    name: 'Usuarios',
    component: withGuard(UsersReporte, ALL_EXCEPT_6_7_8),
  },
  // 🔒 DESACTIVADO — Reporte de inventarios
  // {
  //   path: '/dashboard/reportes/inventarios',
  //   exact: true,
  //   name: 'Inventarios',
  //   component: withGuard(InventarioReporte, ALL_EXCEPT_6_7_8),
  // },

  // -------------------------------------------------------------------------------------------------------------------------------
];

export default routes;
