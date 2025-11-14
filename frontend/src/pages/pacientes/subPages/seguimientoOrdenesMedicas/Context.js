import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react';

const TITLE = 'Seguimiento Órdenes Médicas';

const STATUS = {
  ACTIVO: 'ACTIVO',
  EN_PROCESO: 'EN_PROCESO',
  FINALIZADA: 'FINALIZADA',
  OMITIDA: 'OMITIDA'
};

const STATUS_LABELS = {
  [STATUS.ACTIVO]: 'Activo',
  [STATUS.EN_PROCESO]: 'En Proceso',
  [STATUS.FINALIZADA]: 'Finalizada',
  [STATUS.OMITIDA]: 'Omitida'
};

const SAMPLE_ORDERS = [
  {
    id: 'order-1',
    status: STATUS.ACTIVO,
    doctor: 'Dr. Ruiz',
    patient: 'Juan Pérez',
    description: 'Suministrar 500ml de suero intravenoso cada 8 horas.',
    createdAt: '2025-01-22T18:30:00-06:00',
    lastUpdatedAt: null,
    allowedTransitions: [STATUS.EN_PROCESO, STATUS.FINALIZADA],
    canOmit: false
  },
  {
    id: 'order-2',
    status: STATUS.EN_PROCESO,
    doctor: 'Dr. López',
    patient: 'Ana Díaz',
    description: 'Administrar Paracetamol 1g IV cada 6 horas según dolor.',
    createdAt: '2025-01-22T19:10:00-06:00',
    lastUpdatedAt: '2025-01-23T07:45:00-06:00',
    allowedTransitions: [STATUS.EN_PROCESO, STATUS.FINALIZADA],
    canOmit: false
  },
  {
    id: 'order-3',
    status: STATUS.ACTIVO,
    doctor: 'Dr. Gómez',
    patient: 'Luis Méndez',
    description:
      'Control de signos vitales cada 30 minutos durante las primeras 2 horas.',
    createdAt: '2025-01-22T20:05:00-06:00',
    lastUpdatedAt: null,
    allowedTransitions: [STATUS.EN_PROCESO, STATUS.FINALIZADA],
    canOmit: false
  },
  {
    id: 'order-4',
    status: STATUS.ACTIVO,
    doctor: 'Dr. Juan Pérez (Residente)',
    patient: 'Carla Torres',
    description:
      'Evaluar respuesta al tratamiento y documentar cualquier efecto adverso.',
    createdAt: '2025-01-23T09:25:00-06:00',
    lastUpdatedAt: null,
    allowedTransitions: [STATUS.EN_PROCESO, STATUS.FINALIZADA, STATUS.OMITIDA],
    canOmit: true
  }
];

const SeguimientoOrdenesMedicasContext = createContext(null);

export const useSeguimientoOrdenesMedicasContext = () =>
  useContext(SeguimientoOrdenesMedicasContext);

const formatDateTime = (isoString) => {
  if (!isoString) return null;
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('es-GT', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(date);
  } catch (error) {
    return isoString;
  }
};

export const SeguimientoOrdenesMedicasProvider = ({ children }) => {
  const [orders, setOrders] = useState(() =>
    SAMPLE_ORDERS.map((order) => ({
      ...order,
      createdAtLabel: formatDateTime(order.createdAt),
      lastUpdatedAtLabel: formatDateTime(order.lastUpdatedAt)
    }))
  );

  const [activeOrderId, setActiveOrderId] = useState(orders[0]?.id ?? null);
  const [search, setSearch] = useState('');

  const filteredOrders = useMemo(() => {
    if (!search.trim()) {
      return orders;
    }
    const term = search.trim().toLowerCase();
    return orders.filter((order) => {
      const haystack = [
        order.doctor,
        order.patient,
        order.description,
        STATUS_LABELS[order.status]
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [orders, search]);

  const setActiveOrder = useCallback((orderId) => {
    setActiveOrderId(orderId);
  }, []);

  const updateOrderStatus = useCallback((orderId, nextStatus) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) {
          return order;
        }

        const nowIso = new Date().toISOString();
        return {
          ...order,
          status: nextStatus,
          lastUpdatedAt: nowIso,
          lastUpdatedAtLabel: formatDateTime(nowIso)
        };
      })
    );
  }, []);

  const value = useMemo(
    () => ({
      title: TITLE,
      orders,
      filteredOrders,
      activeOrderId,
      setActiveOrder,
      updateOrderStatus,
      STATUS,
      STATUS_LABELS,
      search,
      setSearch
    }),
    [
      TITLE,
      orders,
      filteredOrders,
      activeOrderId,
      setActiveOrder,
      updateOrderStatus,
      STATUS,
      STATUS_LABELS,
      search,
      setSearch
    ]
  );

  return (
    <SeguimientoOrdenesMedicasContext.Provider value={value}>
      {children}
    </SeguimientoOrdenesMedicasContext.Provider>
  );
};

