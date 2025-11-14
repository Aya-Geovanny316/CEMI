import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react';

const TITLE = 'Signos Vitales (Encamamiento)';

const FIELD_DEFINITIONS = [
  { key: 'frecuenciaRespiratoria', label: 'Frecuencia Respiratoria', type: 'number' },
  { key: 'presionArterial', label: 'Presión Arterial', type: 'text' },
  { key: 'presionArterialMedia', label: 'Presión Arterial Media', type: 'number' },
  { key: 'temperatura', label: 'Temperatura °C', type: 'number', step: '0.1' },
  { key: 'frecuenciaCardiaca', label: 'Frecuencia Cardíaca', type: 'number' },
  { key: 'oxigenacion', label: 'Oxigenación (%)', type: 'number' },
  { key: 'glucosa', label: 'Glucosa', type: 'number' },
  { key: 'insulina', label: 'Insulina (UI)', type: 'number' }
];

const HOURS_TEMPLATE = [
  '07:00 - 08:00',
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  '17:00 - 18:00',
  '18:00 - 19:00',
  '19:00 - 20:00',
  '20:00 - 21:00',
  '21:00 - 22:00',
  '22:00 - 23:00',
  '23:00 - 00:00',
  '00:00 - 01:00',
  '01:00 - 02:00',
  '02:00 - 03:00',
  '03:00 - 04:00',
  '04:00 - 05:00',
  '05:00 - 06:00',
  '06:00 - 07:00'
];

const SAMPLE_DATA = [
  {
    hour: '07:00 - 08:00',
    frecuenciaRespiratoria: '12',
    presionArterial: '150/69',
    presionArterialMedia: '68',
    temperatura: '36.8',
    frecuenciaCardiaca: '71',
    oxigenacion: '',
    glucosa: '154',
    insulina: ''
  },
  {
    hour: '08:00 - 09:00',
    frecuenciaRespiratoria: '12',
    presionArterial: '168/66',
    presionArterialMedia: '71',
    temperatura: '37.1',
    frecuenciaCardiaca: '97',
    oxigenacion: '',
    glucosa: '159',
    insulina: ''
  },
  {
    hour: '09:00 - 10:00',
    frecuenciaRespiratoria: '13',
    presionArterial: '192/71',
    presionArterialMedia: '110',
    temperatura: '38.1',
    frecuenciaCardiaca: '68',
    oxigenacion: '142',
    glucosa: '142',
    insulina: ''
  }
];

const SignosVitalesEncamamientoContext = createContext(null);

const resolveCurrentUser = () => {
  if (typeof window === 'undefined') return 'Usuario Enfermería';
  try {
    const storedUser =
      window.localStorage?.getItem('user') ||
      window.localStorage?.getItem('usuario');
    if (!storedUser) return 'Usuario Enfermería';
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

const buildEmptyRow = (hour) => {
  const row = { hour };
  FIELD_DEFINITIONS.forEach((field) => {
    row[field.key] = '';
  });
  return row;
};

const buildInitialRows = () => {
  const sampleMap = new Map(SAMPLE_DATA.map((item) => [item.hour, item]));
  return HOURS_TEMPLATE.map((hour) => {
    if (sampleMap.has(hour)) {
      return { ...buildEmptyRow(hour), ...sampleMap.get(hour) };
    }
    return buildEmptyRow(hour);
  });
};

export const SignosVitalesEncamamientoProvider = ({ children }) => {
  const [rows, setRows] = useState(buildInitialRows);
  const [feedback, setFeedback] = useState(null);

  const handleCellChange = useCallback((hour, field, value) => {
    setRows((prev) =>
      prev.map((row) =>
        row.hour === hour
          ? {
              ...row,
              [field]: value
            }
          : row
      )
    );
  }, []);

  const saveRows = useCallback(() => {
    const user = resolveCurrentUser();
    const now = new Date().toISOString();

    // In a real implementation this data would be sent to the backend
    const payload = rows.map((row) => ({
      ...row,
      recordedBy: user,
      recordedAt: now
    }));

    console.table(payload); // Dev aid
    setFeedback({
      type: 'success',
      message: 'Signos vitales guardados correctamente (simulación).'
    });
    return payload;
  }, [rows]);

  const resetRows = useCallback(() => {
    setRows(buildInitialRows());
    setFeedback(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      title: TITLE,
      fieldDefinitions: FIELD_DEFINITIONS,
      rows,
      handleCellChange,
      saveRows,
      resetRows,
      feedback,
      setFeedback
    }),
    [rows, handleCellChange, saveRows, resetRows, feedback]
  );

  return (
    <SignosVitalesEncamamientoContext.Provider value={contextValue}>
      {children}
    </SignosVitalesEncamamientoContext.Provider>
  );
};

export const useSignosVitalesEncamamientoContext = () => {
  const context = useContext(SignosVitalesEncamamientoContext);
  if (!context) {
    throw new Error(
      'useSignosVitalesEncamamientoContext must be used within SignosVitalesEncamamientoProvider'
    );
  }
  return context;
};
