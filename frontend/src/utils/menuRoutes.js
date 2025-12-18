import {
  FiHome, FiUsers, FiSettings, FiShield, FiPackage, FiBox, FiUserPlus,
  FiList, FiFileText, FiEdit3, FiLogOut, FiUserCheck, FiCreditCard, FiGrid, FiTruck,
  FiClipboard, FiHeart, FiFilePlus, FiArchive, FiUser, FiCalendar, FiFileMinus,
  FiDollarSign, FiBookOpen, FiBarChart2, FiMonitor, FiDatabase, FiUploadCloud,
  FiPlusSquare, FiTag
} from 'react-icons/fi';

/**
 * Role IDs (alineados con routes.js)
 * 1  admin
 * ----- Admisiones
 * 2  admisiones - estandar
 * 3  admisiones - auxiliar
 * 4  admisiones - operador
 * 5  admisiones - coordinador
 * ----- Inventario
 * 6  inventario - estandar
 * 7  inventario - auxiliar
 * 8  inventario - operador
 * 9  inventario - coordinador
 * ----- Bodegas
 * 10 bodegas - estandar
 * 11 bodegas - auxiliar
 * 12 bodegas - operador
 * 13 bodegas - coordinador
 * 14 bodegas - autoriza (solo compras/visualizar)
 * ----- Pacientes
 * 15 pacientes - enfermeria
 * 16 pacientes - residente
 * 17 pacientes - tratante
 * 18 pacientes - especialista
 * 19 pacientes - coordinador
 * ----- Examenes
 * 20 examenes - estandar
 * 21 examenes - tecnico
 * 22 examenes - coordinador
 * ----- Mantenimiento
 * 23 mantenimiento - estandar
 * 24 mantenimiento - operador
 * 25 mantenimiento - coordinador
 * ----- Otros
 * 26 doctor
 */

const R = {
  ADMIN: 1,
  ADMISIONES: [1, 2, 3, 4, 5],
  INVENTARIO: [1, 6, 7, 8, 9],
  BODEGAS: [1, 10, 11, 12, 13, 14],
  PACIENTES: [1, 15, 16, 17, 18, 19],
  EXAMENES: [1, 20, 21, 22],
  MANTENIMIENTO: [1, 23, 24, 25],
  DOCTOR: [26],
};

// If you want the dashboard visible for absolutely everyone, include 26 too:
const ALL_NON_ADMIN = [
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26
];
const DASHBOARD_ROLES = [R.ADMIN, ...ALL_NON_ADMIN];

// ==== OPCIONES DESACTIVADAS ====
// Estado de cuenta 
// egreso 
// Caja
// Seguro
// Estado de habitación
// Principios activos
// Exámenes  
// Directorio de extensiones 
// Expedientes 
// Médicos 
// Honorarios médicos
// ===============================

const staticRoutes = [
  {
    title: 'Panel Principal',
    url: '/dashboard/default',
    icon: <FiHome />,
    roles: DASHBOARD_ROLES,
  },

  // ADMISIONS
  {
    title: 'Gestión de Admisiones',
    icon: <FiClipboard />,
    roles: R.ADMISIONES,
    children: [
      { title: 'Registrar Ingreso', url: '/dashboard/ingresos/nueva-solicitud', icon: <FiUserPlus /> },
      { title: 'Gestión de Registros', url: '/dashboard/ingresos/gestion-registros', icon: <FiList /> },

      // 🔒 DESACTIVADO — Estado de cuenta
      // { title: 'Estados de Cuenta', url: '/dashboard/ingresos/resumen-estados', icon: <FiFileText /> },

      // 🔒 DESACTIVADO — Egreso
      // { title: 'Egreso de Pacientes', url: '/dashboard/construccion', icon: <FiLogOut /> },

      { title: 'Consulta Programada', url: '/dashboard/ingresos/consulta-programada', icon: <FiCalendar /> },

      // 🔒 DESACTIVADO — Caja
      // { title: 'Caja de Cobros', url: '/dashboard/ingresos/caja-operaciones', icon: <FiCreditCard /> },

      // 🔒 DESACTIVADO — Seguros
      // { title: 'Seguros Médicos', url: '/dashboard/ingresos/aseguradoras', icon: <FiShield /> },

      // 🔒 DESACTIVADO — Estado habitación
      // { title: 'Ocupación de Habitaciones', url: '/dashboard/ingresos/censo-habitaciones', icon: <FiGrid /> },
    ].map(item => ({ ...item, roles: item.roles ?? R.ADMISIONES })),
  },

  // INVENTORY
  {
    title: 'Gestión de Inventario',
    icon: <FiBox />,
    roles: R.INVENTARIO,
    children: [
      { title: 'Catálogo de Proveedores', url: '/dashboard/inventario/proveedores', icon: <FiTruck />, roles: [1, 8] },
      { title: 'Gestión de Marcas', url: '/dashboard/inventario/marcas', icon: <FiTag />, roles: [1, 8] },
      { title: 'Unidades de Medida', url: '/dashboard/inventario/unidades-medida', icon: <FiGrid />, roles: [1, 8] },

      // 🔒 DESACTIVADO — Principios activos
      // { title: 'Principios Activos', url: '/dashboard/inventario/principiosActivos', icon: <FiHeart />, roles: [1, 8] },

      { title: 'Categorías de Productos', url: '/dashboard/inventario/categorias', icon: <FiList />, roles: [1, 8] },
      { title: 'Configuración de Bodegas', url: '/dashboard/inventario/bodegas', icon: <FiPackage />, roles: [1] },
      { title: 'Productos', url: '/dashboard/inventario/productos', icon: <FiBox />, roles: [1, 8] },
      { title: 'Existencias Actuales', url: '/dashboard/inventario/stock', icon: <FiDatabase />, roles: [1, 7, 8] },
      { title: 'Historial de Movimientos', url: '/dashboard/inventario/movimientos', icon: <FiArchive />, roles: [1, 7, 8] },
      { title: 'Actualización de Precios', url: '/dashboard/inventario/precios', icon: <FiEdit3 />, roles: [1, 9] },

      // 🔒 DESACTIVADO — Exámenes
      // { title: 'Consumo por Exámenes', url: '/dashboard/futuro', icon: <FiMonitor />, roles: [1, 9] },

      { title: 'Consulta de Precios', url: '/dashboard/inventario/ver-precios', icon: <FiDollarSign />, roles: [1, 6] },
    ],
  },

  // WAREHOUSES
  {
    title: 'Almacenes y Bodegas',
    icon: <FiPackage />,
    roles: R.BODEGAS,
    children: [
      {
        title: 'Módulo de Compras',
        icon: <FiFilePlus />,
        children: [
          { title: 'Generar Requisición', url: '/dashboard/bodegas/compras/generar', icon: <FiFilePlus />, roles: [1, 11] },
          { title: 'Revisar Requisiciones', url: '/dashboard/bodegas/compras/visualizar', icon: <FiClipboard />, roles: [1, 11, 14] },
          { title: 'Órdenes de Compra', url: '/dashboard/bodegas/compras/orden', icon: <FiFileText />, roles: [1, 13] },
        ].map(item => ({ ...item, roles: item.roles ?? R.BODEGAS })),
      },
      { title: 'Registro de Entradas', url: '/dashboard/bodegas/entradas', icon: <FiPlusSquare />, roles: [1, 10, 12] },
      { title: 'Salidas de Bodega', url: '/dashboard/bodegas/salidas', icon: <FiLogOut />, roles: [1, 10, 12] },
      { title: 'Traslados de Inventario', url: '/dashboard/bodegas/traslados', icon: <FiTruck />, roles: [1, 10, 12] },
    ].map(item => ({ ...item, roles: item.roles ?? R.BODEGAS })),
  },

  // PATIENTS
  {
    title: 'Gestión de Pacientes',
    icon: <FiUsers />,
    roles: R.PACIENTES,
    children: [
      { title: 'Consultas', url: '/dashboard/consulta', icon: <FiFileText /> },
      // { title: 'Módulo de Enfermería', url: '/dashboard/pacientes/enfermeria', icon: <FiHeart /> },
      // { title: 'Médicos Residentes', url: '/dashboard/pacientes/medicos-residentes', icon: <FiUserCheck /> },
      // { title: 'Médicos Tratantes', url: '/dashboard/pacientes/medicos-tratantes', icon: <FiUser /> },
      // { title: 'Devoluciones a Farmacia', url: '/dashboard/pacientes/devoluciones', icon: <FiArchive /> },

      // 🔒 DESACTIVADO — Expedientes
      // { title: 'Agenda de Cirugías', url: '/dashboard/pacientes/calendario-operaciones', icon: <FiCalendar /> },
    ].map(item => ({ ...item, roles: item.roles ?? R.PACIENTES })),
  },

  // 🔒 DESACTIVADO — Exámenes (órdenes y catálogo)
  // {
  //   title: 'Servicios Diagnósticos',
  //   icon: <FiMonitor />,
  //   roles: R.EXAMENES,
  //   children: [
  //     { title: 'Órdenes de Laboratorio', url: '/dashboard/futuro', icon: <FiFileText /> },
  //     { title: 'Órdenes de Radiología', url: '/dashboard/futuro', icon: <FiFileMinus /> },
  //     { title: 'Catálogo de Exámenes', url: '/dashboard/futuro', icon: <FiList /> },
  //   ].map(item => ({ ...item, roles: item.roles ?? R.EXAMENES })),
  // },

  // MAINTENANCE
  {
    title: 'Configuración y Mantenimiento',
    icon: <FiSettings />,
    roles: R.MANTENIMIENTO,
    children: [
      {
        title: 'Carga Masiva de Datos',
        icon: <FiUploadCloud />,
        children: [
          { title: 'Carga de Existencias', url: '/dashboard/mantenimiento/carga-masiva/existencias', icon: <FiDatabase /> },
          { title: 'Carga de Precios', url: '/dashboard/mantenimiento/carga-masiva/precios', icon: <FiDollarSign /> },
          { title: 'Carga de Admisiones', url: '/dashboard/mantenimiento/carga-masiva/admisiones', icon: <FiUserCheck /> },
        ].map(item => ({ ...item, roles: item.roles ?? R.MANTENIMIENTO })),
      },

      // 🔒 DESACTIVADO — Directorio Extensiones
      // { title: 'Extensiones Internas', url: '/dashboard/mantenimiento/extensiones', icon: <FiBookOpen /> },

      // 🔒 DESACTIVADO — Médicos
      // { title: 'Directorio de Médicos', url: '/dashboard/mantenimiento/medicos', icon: <FiUser /> },

      { title: 'Aseguradoras', url: '/dashboard/mantenimiento/seguros', icon: <FiShield /> },
      { title: 'Centros de Costo', url: '/dashboard/mantenimiento/centroCostos', icon: <FiGrid /> },
      { title: 'Departamentos Internos', url: '/dashboard/mantenimiento/departamentos', icon: <FiUsers /> },
      { title: 'Cuentas Contables', url: '/dashboard/mantenimiento/cuentasContables', icon: <FiBookOpen /> },
    ].map(item => ({ ...item, roles: item.roles ?? R.MANTENIMIENTO })),
  },

  // REPORTS
  {
    title: 'Informes y Estadísticas',
    icon: <FiBarChart2 />,
    roles: [R.ADMIN],
    children: [
      // 🔒 DESACTIVADO — Expedientes
      // { title: 'Imprimir Expediente', url: '/dashboard/futuro', icon: <FiFileText />, roles: [R.ADMIN] },

      // 🔒 DESACTIVADO — Médicos
      // { title: 'Reporte de Médicos', url: '/dashboard/futuro', icon: <FiUser />, roles: [R.ADMIN] },

      // 🔒 DESACTIVADO — Honorarios médicos
      // { title: 'Honorarios Médicos', url: '/dashboard/futuro', icon: <FiDollarSign />, roles: [R.ADMIN] },

      { title: 'Historial General', url: '/dashboard/reportes/historial-general', icon: <FiFileText />, roles: [R.ADMIN] },
      // 🔒 DESACTIVADO — Histórico de admisiones
      // { title: 'Histórico de Admisiones', url: '/dashboard/futuro', icon: <FiArchive />, roles: [R.ADMIN] },
      // 🔒 DESACTIVADO — Inventarios
      // { title: 'Inventarios', url: '/dashboard/reportes/inventarios', icon: <FiDatabase />, roles: [R.ADMIN] },
      // 🔒 DESACTIVADO — Caja
      // { title: 'Movimientos de Caja', url: '/dashboard/futuro', icon: <FiCreditCard />, roles: [R.ADMIN] },
      // 🔒 DESACTIVADO — Facturación (SKU cobrados)
      // { title: 'SKU Cobrados', url: '/dashboard/futuro', icon: <FiList />, roles: [R.ADMIN] },
      // 🔒 DESACTIVADO — Facturación (precios)
      // { title: 'Listado de Precios', url: '/dashboard/futuro', icon: <FiDollarSign />, roles: [R.ADMIN] },
      // 🔒 DESACTIVADO — Órdenes de compra
      // { title: 'Órdenes de Compra', url: '/dashboard/futuro', icon: <FiFilePlus />, roles: [R.ADMIN] },
      // 🔒 DESACTIVADO — Consignación
      // { title: 'Consignación', url: '/dashboard/futuro', icon: <FiPackage />, roles: [R.ADMIN] },
      // 🔒 DESACTIVADO — Controlados
      // { title: 'Controlados', url: '/dashboard/futuro', icon: <FiShield />, roles: [R.ADMIN] },
      // 🔒 DESACTIVADO — Ingresos y egresos
      // { title: 'Ingresos vs Egresos', url: '/dashboard/futuro', icon: <FiBarChart2 />, roles: [R.ADMIN] },
    ],
  },
];


let menuIdCounter = 0;

const addIds = (items, parentId = null) =>
  items.map(item => {
    const id = `menu-${menuIdCounter++}`;
    const newItem = { ...item, id, roles: item.roles ?? [] };
    if (parentId) newItem.parentId = parentId;
    if (item.children) newItem.children = addIds(item.children, id);
    return newItem;
  });

const routesWithIds = addIds(staticRoutes);

export default routesWithIds;
