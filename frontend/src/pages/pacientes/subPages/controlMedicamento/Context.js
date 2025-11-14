import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react';

const TITLE = 'Control de Medicamento';

const TIME_SLOTS = [
  'STAT',
  '02',
  '04',
  '06',
  '08',
  '10',
  '12',
  '14',
  '16',
  '18',
  '20',
  '22',
  '24'
];

const STATUS_OPTIONS = [
  { value: '', label: 'Seleccionar' },
  { value: 'APLICADO', label: 'Aplicado' },
  { value: 'OMITIDO', label: 'Omitido' },
  { value: 'CAMBIO_HORARIO', label: 'Cambio de Horario' }
];

const FREQUENCY_OPTIONS = [
  'BID',
  'TID',
  'QUID',
  'Q2',
  'Q4',
  'Q6',
  'Q8',
  'Q24',
  'AYUNAS',
  'STAT'
];

const ROUTE_OPTIONS = [
  'IM',
  'INHALADOR',
  'IV',
  'OCULAR',
  'OFTÁLMICO',
  'ÓTICA',
  'ORAL',
  'PO',
  'RECTAL',
  'SUBCUTÁNEA',
  'TÓPICO',
  'TRANSDÉRMICA',
  'VAGINAL'
];

const MEDICATIONS = [
  { id: 'MED-001', code: 'Z04512', name: 'Dobutamina' },
  { id: 'MED-002', code: 'A12378', name: 'Paracetamol 1g IV' },
  { id: 'MED-003', code: 'B54321', name: 'Suero fisiológico 500ml' }
];

const SAMPLE_ORDERS = [
  {
    id: 'order-1',
    createdAt: '2025-09-22T08:43:06-06:00',
    doctor: 'USUARIO PARA MÉDICO DE PRUEBA',
    license: 'COL:0000',
    status: 'EN_PROCESO',
    description: [
      'Disminuir dobutamina a 0.6 cc/hr BIC',
      'Listerizar estricta cada 4 horas',
      'Higiene oral con Listerine',
      'Aplicar crema hidratante cada 6 horas'
    ]
  },
  {
    id: 'order-2',
    createdAt: '2025-09-22T09:05:00-06:00',
    doctor: 'Dr. María López',
    license: 'COL:4567',
    status: 'ACTIVO',
    description: [
      'Administrar Paracetamol 1g IV según dolor',
      'Evaluar respuesta y registrar temperatura'
    ]
  }
];

const SAMPLE_RECORDS = [
  {
    id: 'cm-1',
    date: '2025-09-21T14:30:00-06:00',
    note: 'Aplicar dobutamina cada 6 horas.',
    medicationId: 'MED-001',
    frequency: 'Q6',
    dose: '100 cc',
    route: 'IV',
    timeline: {
      STAT: 'APLICADO',
      '02': 'OMITIDO',
      '04': '',
      '06': 'APLICADO',
      '08': '',
      '10': '',
      '12': '',
      '14': '',
      '16': '',
      '18': '',
      '20': '',
      '22': '',
      '24': ''
    },
    comment: 'Aplicado 14:30 por María López.',
    userName: 'María López',
    lastSavedAt: '2025-09-21T14:45:00-06:00'
  },
  {
    id: 'cm-2',
    date: '2025-09-21T08:10:00-06:00',
    note: 'Suero fisiológico según indicación médica.',
    medicationId: 'MED-003',
    frequency: 'Q8',
    dose: '500 ml',
    route: 'IV',
    timeline: {
      STAT: 'APLICADO',
      '02': '',
      '04': '',
      '06': 'APLICADO',
      '08': '',
      '10': '',
      '12': '',
      '14': '',
      '16': '',
      '18': '',
      '20': '',
      '22': '',
      '24': ''
    },
    comment: 'Paciente hidratado, sin incidencias.',
    userName: 'Carlos Méndez',
    lastSavedAt: '2025-09-21T08:20:00-06:00'
  }
];

const ControlMedicamentoContext = createContext(null);

const formatDateLabel = (iso) => {
  try {
    const date = new Date(iso);
    return new Intl.DateTimeFormat('es-GT', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(date);
  } catch (error) {
    return iso;
  }
};

const resolveCurrentUser = () => {
  if (typeof window === 'undefined') return 'Usuario Enfermería';
  try {
    const storedUser =
      window.localStorage?.getItem('user') ||
      window.localStorage?.getItem('usuario');
    if (!storedUser) {
      return 'Usuario Enfermería';
    }
    const parsed =
      typeof storedUser === 'string' && storedUser.startsWith('{')
        ? JSON.parse(storedUser)
        : { username: storedUser };
    return (
      parsed?.nombreCompleto ||
      parsed?.fullName ||
      parsed?.username ||
      parsed?.nombre ||
      'Usuario Enfermería'
    );
  } catch (error) {
    return 'Usuario Enfermería';
  }
};

const buildTimelineTemplate = () =>
  TIME_SLOTS.reduce((acc, slot) => {
    acc[slot] = '';
    return acc;
  }, {});

const enrichRecord = (record) => ({
  ...record,
  dateLabel: formatDateLabel(record.date),
  lastSavedLabel: record.lastSavedAt ? formatDateLabel(record.lastSavedAt) : null,
  timeline: { ...buildTimelineTemplate(), ...(record.timeline ?? {}) }
});

export const ControlMedicamentoProvider = ({ children }) => {
  const [orders] = useState(SAMPLE_ORDERS);
  const [activeOrderId, setActiveOrderId] = useState(orders[0]?.id ?? null);
  const [records, setRecords] = useState(() =>
    SAMPLE_RECORDS.map(enrichRecord)
  );
  const [feedback, setFeedback] = useState(null);

  const currentOrder = useMemo(
    () => orders.find((order) => order.id === activeOrderId) ?? orders[0] ?? null,
    [orders, activeOrderId]
  );

  const resolveMedicationLabel = useCallback((medicationId) => {
    const med = MEDICATIONS.find((item) => item.id === medicationId);
    if (!med) return '';
    return `${med.code} - ${med.name}`;
  }, []);

  const addRecord = useCallback(() => {
    const nowIso = new Date().toISOString();
    const defaultMedication = MEDICATIONS[0]?.id ?? '';
    const newRecord = enrichRecord({
      id: `cm-${Date.now()}`,
      date: nowIso,
      note: currentOrder?.description?.[0] ?? '',
      medicationId: defaultMedication,
      frequency: 'Q6',
      dose: '',
      route: 'IV',
      timeline: buildTimelineTemplate(),
      comment: '',
      userName: resolveCurrentUser(),
      lastSavedAt: null
    });

    setRecords((prev) => [newRecord, ...prev]);
    setFeedback({
      type: 'info',
      message: 'Se agregó un nuevo registro. Completa los campos y guarda los cambios.'
    });
  }, [currentOrder]);

  const updateRecordField = useCallback(
    (recordId, field, value) => {
      setRecords((prev) =>
        prev.map((record) =>
          record.id === recordId
            ? {
                ...record,
                [field]: value,
                userName: resolveCurrentUser()
              }
            : record
        )
      );
    },
    []
  );

  const updateTimelineValue = useCallback((recordId, slot, value) => {
    setRecords((prev) =>
      prev.map((record) =>
        record.id === recordId
          ? {
              ...record,
              timeline: {
                ...record.timeline,
                [slot]: value
              },
              userName: resolveCurrentUser()
            }
          : record
      )
    );
  }, []);

  const saveRecord = useCallback((recordId) => {
    const nowIso = new Date().toISOString();
    setRecords((prev) =>
      prev.map((record) =>
        record.id === recordId
          ? {
              ...record,
              lastSavedAt: nowIso,
              lastSavedLabel: formatDateLabel(nowIso),
              userName: resolveCurrentUser()
            }
          : record
      )
    );
    setFeedback({
      type: 'success',
      message: 'Registro de medicación guardado correctamente.'
    });
  }, []);

  const clearFeedback = useCallback(() => setFeedback(null), []);

  const contextValue = useMemo(
    () => ({
      title: TITLE,
      orders,
      activeOrderId,
      currentOrder,
      setActiveOrderId,
      records,
      timeSlots: TIME_SLOTS,
      statusOptions: STATUS_OPTIONS,
      frequencyOptions: FREQUENCY_OPTIONS,
      routeOptions: ROUTE_OPTIONS,
      medications: MEDICATIONS,
      resolveMedicationLabel,
      addRecord,
      updateRecordField,
      updateTimelineValue,
      saveRecord,
      feedback,
      clearFeedback
    }),
    [
      orders,
      activeOrderId,
      currentOrder,
      records,
      resolveMedicationLabel,
      addRecord,
      updateRecordField,
      updateTimelineValue,
      saveRecord,
      feedback,
      clearFeedback
    ]
  );

  return (
    <ControlMedicamentoContext.Provider value={contextValue}>
      {children}
    </ControlMedicamentoContext.Provider>
  );
};

export const useControlMedicamentoContext = () => {
  const context = useContext(ControlMedicamentoContext);
  if (!context) {
    throw new Error(
      'useControlMedicamentoContext must be used within ControlMedicamentoProvider'
    );
  }
  return context;
};

