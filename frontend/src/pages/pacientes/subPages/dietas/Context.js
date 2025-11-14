import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react';

const TITLE = 'Dietas';

const MEAL_TIMES = [
  'Desayuno',
  'Refacción AM',
  'Almuerzo',
  'Refacción PM',
  'Cena'
];

const MEAL_WINDOWS = {
  Desayuno: '05:00 - 06:30',
  'Refacción AM': '09:00 - 10:30',
  Almuerzo: '12:00 - 13:30',
  'Refacción PM': '17:00 - 18:30',
  Cena: '20:00 - 21:30'
};

const DIET_TYPES = [
  'Hiposódica',
  'Blanda',
  'NPO',
  'Diabética',
  'Alta en Proteína',
  'Libre'
];

const SAMPLE_ORDERS = [
  {
    id: 'order-1',
    createdAt: '2025-09-22T08:43:06-06:00',
    doctor: 'Dr. Ruiz',
    status: 'ACTIVA',
    description: [
      'Control de ingesta de sodio',
      'Paciente en fase post operatoria (día 2)'
    ]
  },
  {
    id: 'order-2',
    createdAt: '2025-09-22T09:15:00-06:00',
    doctor: 'Dra. López',
    status: 'EN_PROCESO',
    description: ['Monitoreo de glucosa', 'Dietas fraccionadas con carbohidratos controlados']
  }
];

const SAMPLE_DIETS = [
  {
    id: 'diet-1',
    date: '2025-09-22',
    mealTime: 'Desayuno',
    dietType: 'Hiposódica',
    observations: 'Control de sal diario',
    responsible: 'Carlos López',
    createdAt: '2025-09-22T05:45:00-06:00',
    createdAtLabel: '22/09/2025 05:45'
  },
  {
    id: 'diet-2',
    date: '2025-09-22',
    mealTime: 'Almuerzo',
    dietType: 'NPO',
    observations: 'Paciente en ayuno preoperatorio',
    responsible: 'María Díaz',
    createdAt: '2025-09-22T12:10:00-06:00',
    createdAtLabel: '22/09/2025 12:10'
  },
  {
    id: 'diet-3',
    date: '2025-09-22',
    mealTime: 'Cena',
    dietType: 'Blanda',
    observations: 'Se toleró el almuerzo sin incidencias',
    responsible: 'Juan Pérez',
    createdAt: '2025-09-22T20:15:00-06:00',
    createdAtLabel: '22/09/2025 20:15'
  }
];

const DietasContext = createContext(null);

const formatDate = (iso) => {
  try {
    return new Intl.DateTimeFormat('es-GT', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(iso));
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

export const DietasProvider = ({ children }) => {
  const [orders] = useState(SAMPLE_ORDERS);
  const [dietRecords, setDietRecords] = useState(SAMPLE_DIETS);
  const [mode, setMode] = useState('LIST'); // LIST | CREATE | EDIT | VIEW
  const [activeDietId, setActiveDietId] = useState(null);
  const [formState, setFormState] = useState(() => ({
    date: new Date().toISOString().slice(0, 10),
    mealTime: MEAL_TIMES[0],
    dietType: DIET_TYPES[0],
    observations: ''
  }));
  const [feedback, setFeedback] = useState(null);

  const activeDiet = useMemo(
    () => dietRecords.find((diet) => diet.id === activeDietId) ?? null,
    [dietRecords, activeDietId]
  );

  const sortedDietRecords = useMemo(
    () =>
      [...dietRecords].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [dietRecords]
  );

  const resetForm = useCallback(() => {
    setFormState({
      date: new Date().toISOString().slice(0, 10),
      mealTime: MEAL_TIMES[0],
      dietType: DIET_TYPES[0],
      observations: ''
    });
  }, []);

  const enterListMode = useCallback(() => {
    setMode('LIST');
    setActiveDietId(null);
    resetForm();
  }, [resetForm]);

  const startCreate = useCallback(() => {
    resetForm();
    setActiveDietId(null);
    setMode('CREATE');
  }, [resetForm]);

  const startEdit = useCallback((dietId) => {
    const diet = dietRecords.find((item) => item.id === dietId);
    if (!diet) return;
    setActiveDietId(dietId);
    setFormState({
      date: diet.date,
      mealTime: diet.mealTime,
      dietType: diet.dietType,
      observations: diet.observations ?? ''
    });
    setMode('EDIT');
  }, [dietRecords]);

  const startView = useCallback((dietId) => {
    setActiveDietId(dietId);
    setMode('VIEW');
  }, []);

  const handleFormChange = useCallback((field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const saveDiet = useCallback(() => {
    if (!formState.dietType || !formState.mealTime || !formState.date) {
      setFeedback({
        type: 'danger',
        message: 'Completa la fecha, el tiempo de comida y la dieta antes de guardar.'
      });
      return { success: false };
    }

    const user = resolveCurrentUser();
    const nowIso = new Date().toISOString();

    if (mode === 'CREATE') {
      const newRecord = {
        id: `diet-${Date.now()}`,
        date: formState.date,
        mealTime: formState.mealTime,
        dietType: formState.dietType,
        observations: formState.observations,
        responsible: user,
        createdAt: nowIso,
        createdAtLabel: formatDate(nowIso)
      };
      setDietRecords((prev) => [newRecord, ...prev]);
      setFeedback({ type: 'success', message: 'Dieta registrada correctamente.' });
      enterListMode();
      return { success: true };
    }

    if (mode === 'EDIT' && activeDietId) {
      setDietRecords((prev) =>
        prev.map((record) =>
          record.id === activeDietId
            ? {
                ...record,
                date: formState.date,
                mealTime: formState.mealTime,
                dietType: formState.dietType,
                observations: formState.observations,
                responsible: user,
                createdAt: record.createdAt,
                createdAtLabel: record.createdAtLabel,
                updatedAt: nowIso,
                updatedAtLabel: formatDate(nowIso)
              }
            : record
        )
      );
      setFeedback({ type: 'success', message: 'Dieta actualizada correctamente.' });
      enterListMode();
      return { success: true };
    }

    setFeedback({ type: 'warning', message: 'Acción no permitida en el estado actual.' });
    return { success: false };
  }, [formState, mode, activeDietId, enterListMode]);

  const contextValue = useMemo(
    () => ({
      title: TITLE,
      orders,
      dietRecords: sortedDietRecords,
      mealTimes: MEAL_TIMES,
      mealWindows: MEAL_WINDOWS,
      dietTypes: DIET_TYPES,
      mode,
      activeDiet,
      activeDietId,
      formState,
      feedback,
      startCreate,
      startEdit,
      startView,
      enterListMode,
      handleFormChange,
      saveDiet,
      setFeedback
    }),
    [
      orders,
      sortedDietRecords,
      mode,
      activeDiet,
      activeDietId,
      formState,
      feedback,
      startCreate,
      startEdit,
      startView,
      enterListMode,
      handleFormChange,
      saveDiet
    ]
  );

  return (
    <DietasContext.Provider value={contextValue}>
      {children}
    </DietasContext.Provider>
  );
};

export const useDietasContext = () => {
  const context = useContext(DietasContext);
  if (!context) {
    throw new Error('useDietasContext must be used within DietasProvider');
  }
  return context;
};
