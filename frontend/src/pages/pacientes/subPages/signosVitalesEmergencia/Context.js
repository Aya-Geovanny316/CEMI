import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react';

const TITLE = 'Signos Vitales (Emergencia)';

const FIELDS = [
  {
    id: 'peso',
    label: 'Peso',
    placeholder: 'Ej. 180',
    unit: 'lbs',
    type: 'number',
    step: '0.1'
  },
  {
    id: 'estatura',
    label: 'Estatura',
    placeholder: 'Ej. 165',
    unit: 'cm',
    type: 'number',
    step: '0.1'
  },
  {
    id: 'presionArterial',
    label: 'Presión Arterial',
    placeholder: 'Ej. 120/80',
    unit: 'mmHg',
    type: 'text'
  },
  {
    id: 'presionArterialMedia',
    label: 'Presión Arterial Media',
    placeholder: 'Ej. 95',
    unit: 'mmHg',
    type: 'number'
  },
  {
    id: 'temperatura',
    label: 'Temperatura',
    placeholder: 'Ej. 36.5',
    unit: '°C',
    type: 'number',
    step: '0.1'
  },
  {
    id: 'frecuenciaCardiaca',
    label: 'Frecuencia Cardíaca',
    placeholder: 'Ej. 80',
    unit: 'ppm',
    type: 'number'
  },
  {
    id: 'oxigenacion',
    label: 'Oxigenación',
    placeholder: 'Ej. 95',
    unit: '%',
    type: 'number'
  },
  {
    id: 'frecuenciaRespiratoria',
    label: 'Frecuencia Respiratoria',
    placeholder: 'Ej. 18',
    unit: 'rpm',
    type: 'number'
  },
  {
    id: 'glucosa',
    label: 'Glucosa',
    placeholder: 'Ej. 110',
    unit: 'mg/dL',
    type: 'number'
  },
  {
    id: 'insulina',
    label: 'Insulina',
    placeholder: 'Ej. 8',
    unit: 'U',
    type: 'number'
  }
];

const resolveCurrentUser = () => {
  if (typeof window === 'undefined') return 'Usuario actual';
  try {
    const storedUser =
      window.localStorage?.getItem('user') ||
      window.localStorage?.getItem('usuario');
    if (!storedUser) {
      return 'Usuario actual';
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
      'Usuario actual'
    );
  } catch (error) {
    return 'Usuario actual';
  }
};

const buildSeedRecords = () => {
  const seedTimestamp = new Date('2025-01-23T20:51:47-06:00').toISOString();
  const sampleMeasurements = [
    { fieldId: 'peso', value: '180', comment: '' },
    { fieldId: 'estatura', value: '1.61', comment: '' },
    { fieldId: 'presionArterial', value: '141/85', comment: '' },
    { fieldId: 'temperatura', value: '36.5', comment: '' },
    { fieldId: 'frecuenciaCardiaca', value: '80', comment: '' },
    { fieldId: 'oxigenacion', value: '93', comment: '' },
    { fieldId: 'frecuenciaRespiratoria', value: '20', comment: '' }
  ];

  return [
    {
      id: 'seed-record-1',
      timestamp: seedTimestamp,
      takenBy: 'JHONY GERARDO PINEDA CASTRO',
      measurements: sampleMeasurements
        .map((entry) => {
          const field = FIELDS.find((item) => item.id === entry.fieldId);
          if (!field) return null;

          return {
            id: field.id,
            label: field.label,
            unit: field.unit,
            value: entry.value,
            comment: entry.comment
          };
        })
        .filter(Boolean)
    }
  ];
};

const SignosVitalesEmergenciaContext = createContext(null);

export const useSignosVitalesEmergenciaContext = () =>
  useContext(SignosVitalesEmergenciaContext);

export const SignosVitalesEmergenciaProvider = ({ children }) => {
  const [records, setRecords] = useState(buildSeedRecords);

  const recordVitalSigns = useCallback((formValues) => {
    const measurements = FIELDS.map((field) => {
      const fieldValues = formValues[field.id] || {};
      const value = `${fieldValues.value ?? ''}`.trim();
      const comment = `${fieldValues.comment ?? ''}`.trim();

      return {
        id: field.id,
        label: field.label,
        unit: field.unit,
        value,
        comment
      };
    }).filter((item) => item.value !== '');

    if (measurements.length === 0) {
      return { success: false, reason: 'EMPTY' };
    }

    setRecords((prev) => [
      {
        id: `record-${Date.now()}`,
        timestamp: new Date().toISOString(),
        takenBy: resolveCurrentUser(),
        measurements
      },
      ...prev
    ]);

    return { success: true };
  }, []);

  const getInitialFormState = useCallback(() => {
    return FIELDS.reduce((acc, field) => {
      acc[field.id] = { value: '', comment: '' };
      return acc;
    }, {});
  }, []);

  const value = useMemo(
    () => ({
      title: TITLE,
      fields: FIELDS,
      records,
      recordVitalSigns,
      getInitialFormState,
      currentUserName: resolveCurrentUser()
    }),
    [records, recordVitalSigns, getInitialFormState]
  );

  return (
    <SignosVitalesEmergenciaContext.Provider value={value}>
      {children}
    </SignosVitalesEmergenciaContext.Provider>
  );
};
