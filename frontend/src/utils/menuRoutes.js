import {
  FiHome, FiUsers, FiSettings, FiPackage, FiBox, FiUserPlus,
  FiList, FiFileText, FiEdit3, FiLogOut, FiCreditCard, FiGrid, FiTruck,
  FiClipboard, FiHeart, FiFilePlus, FiArchive, FiUser, FiCalendar, FiDollarSign, FiBarChart2, FiDatabase, FiUploadCloud,
  FiPlusSquare, FiTag, FiBookOpen, FiUserCheck, FiSearch, FiShield
} from 'react-icons/fi';

/**
 * ROLES DE TRABAJO (Según Base de Datos y PDF):
 * 1: admin
 * 2: secretaria
 * 3: medico
 */

const R = {
  ADMIN: 1,
  SECRETARIA: 2,
  MEDICO: 3,
};

// Grupos de acceso comunes
const ACCESO_ADMIN_SECRETARIA = [R.ADMIN, R.SECRETARIA];
const ACCESO_TODO_PERSONAL = [R.ADMIN, R.SECRETARIA, R.MEDICO];

const staticRoutes = [
  {
    title: 'Panel Principal',
    url: '/dashboard/default',
    icon: <FiHome />,
    roles: ACCESO_TODO_PERSONAL,
  },

  // === SECRETARIA: ATENCIÓN DE PACIENTES ===
  {
    title: 'Recepción y Admisión',
    icon: <FiClipboard />,
    roles: ACCESO_ADMIN_SECRETARIA,
    children: [
      { 
        title: 'Registrar Paciente', // Ingreso de pacientes a BD general
        url: '/dashboard/ingresos/nueva-solicitud', 
        icon: <FiUserPlus />, 
        roles: ACCESO_ADMIN_SECRETARIA 
      }, 
      { 
        title: 'Sala de Espera', // Asignar al médico, Tomar signos vitales
        url: '/dashboard/ingresos/gestion-registros', 
        icon: <FiList />, 
        roles: ACCESO_ADMIN_SECRETARIA 
      },
      { 
        title: 'Consulta Programada', 
        url: '/dashboard/ingresos/consulta-programada', 
        icon: <FiCalendar />, 
        roles: ACCESO_ADMIN_SECRETARIA 
      },
    ],
  },

  // === SECRETARIA: CAJA Y VENTAS ===
  {
    title: 'Caja y Facturación',
    icon: <FiDollarSign />,
    roles: ACCESO_ADMIN_SECRETARIA,
    children: [
      { 
        title: 'Caja de Cobros', // Control de caja, cobrar consulta, medicamentos
        url: '/dashboard/ingresos/caja-operaciones', 
        icon: <FiCreditCard />, 
        roles: ACCESO_ADMIN_SECRETARIA 
      },
      { 
        title: 'Cierre Diario', // Poder hacer el cierre diario y editarlo
        url: '/dashboard/caja/cierre', // Ruta a implementar/verificar
        icon: <FiFileText />, 
        roles: ACCESO_ADMIN_SECRETARIA 
      },
      // Estado de cuenta si es necesario
      { title: 'Estados de Cuenta', url: '/dashboard/ingresos/resumen-estados', icon: <FiFileText />, roles: ACCESO_ADMIN_SECRETARIA },
    ],
  },

  // === MÉDICO: ATENCIÓN ===
  {
    title: 'Consultorio Médico',
    icon: <FiUser />,
    roles: [R.ADMIN, R.MEDICO],
    children: [
      { 
        title: 'Mis Pacientes', // Atender paciente asignado
        url: '/dashboard/consulta', 
        icon: <FiUserCheck />, 
        roles: [R.ADMIN, R.MEDICO] 
      },
      // Historial clínico modificaciones posteriores
    ],
  },

  // === SECRETARIA & ADMIN: INVENTARIO (Ver y Vender) ===
  {
    title: 'Farmacia e Inventario',
    icon: <FiBox />,
    roles: ACCESO_ADMIN_SECRETARIA, // Secretaria tiene autorización para ver inventario
    children: [
      { title: 'Existencias', url: '/dashboard/inventario/stock', icon: <FiDatabase />, roles: ACCESO_ADMIN_SECRETARIA }, // Ver si hay producto
      { title: 'Productos', url: '/dashboard/inventario/productos', icon: <FiBox />, roles: [R.ADMIN] }, // Gestión productos (Admin)
      { title: 'Movimientos', url: '/dashboard/inventario/movimientos', icon: <FiArchive />, roles: [R.ADMIN] },
      { title: 'Precios', url: '/dashboard/inventario/ver-precios', icon: <FiDollarSign />, roles: ACCESO_ADMIN_SECRETARIA },
    ],
  },

  // === SECRETARIA: COMPRAS (Visualizar) ===
  {
    title: 'Compras y Bodega',
    icon: <FiPackage />,
    roles: ACCESO_ADMIN_SECRETARIA,
    children: [
      { title: 'Ver Requisiciones', url: '/dashboard/bodegas/compras/visualizar', icon: <FiClipboard />, roles: ACCESO_ADMIN_SECRETARIA },
      { title: 'Generar Requisición', url: '/dashboard/bodegas/compras/generar', icon: <FiFilePlus />, roles: [R.ADMIN] }, 
      { title: 'Entradas', url: '/dashboard/bodegas/entradas', icon: <FiPlusSquare />, roles: [R.ADMIN] },
    ],
  },

  // === PACIENTES (Historial) ===
  {
    title: 'Expedientes',
    icon: <FiUsers />,
    roles: ACCESO_TODO_PERSONAL,
    children: [
      { title: 'Buscar Paciente', url: '/dashboard/pacientes/info-paciente', icon: <FiSearch />, roles: ACCESO_TODO_PERSONAL }, 
      // Secretaria ve historia pero no modifica. Medico modifica.
    ],
  },

  // === MANTENIMIENTO (Admin) ===
  {
    title: 'Configuración',
    icon: <FiSettings />,
    roles: [R.ADMIN],
    children: [
      { title: 'Gestión de Usuarios', url: '/dashboard/mantenimiento/users', icon: <FiUsers /> },
      { title: 'Aseguradoras', url: '/dashboard/mantenimiento/seguros', icon: <FiShield /> },
      { title: 'Carga Masiva', url: '/dashboard/mantenimiento/carga-masiva/existencias', icon: <FiUploadCloud /> },
    ].map(item => ({ ...item, roles: [R.ADMIN] })),
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
