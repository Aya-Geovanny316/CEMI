import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react';

const TITLE = 'Antecedentes';

const SAMPLE_RECORDS = [
  {
    id: 'antecedente-1',
    createdAt: '2025-01-22T10:15:00-06:00',
    doctorName: 'Dr. Juan Pérez',
    doctorLicense: 'COL.1234',
    content:
      '<p>Paciente con hipertensión controlada, tratamiento con Losartán 50mg diario.</p>'
  },
  {
    id: 'antecedente-2',
    createdAt: '2025-01-23T09:30:00-06:00',
    doctorName: 'Dra. María López',
    doctorLicense: 'COL.4567',
    content:
      '<p>Reacción alérgica a penicilina reportada en 2020. Evitar este antibiótico.</p>'
  },
  {
    id: 'antecedente-3',
    createdAt: '2025-01-24T14:45:00-06:00',
    doctorName: 'Dr. Luis Mendoza',
    doctorLicense: 'COL.9876',
    content:
      '<p>Sin antecedentes quirúrgicos. Último chequeo general en octubre 2024.</p>'
  }
];

const AntecedentesContext = createContext(null);

const formatDate = (isoString) => {
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

export const AntecedentesProvider = ({ children }) => {
  const [records, setRecords] = useState(() =>
    SAMPLE_RECORDS.map((record) => ({
      ...record,
      createdAtLabel: formatDate(record.createdAt)
    }))
  );
  const [mode, setMode] = useState('LIST'); // LIST | CREATE | EDIT | VIEW
  const [activeRecordId, setActiveRecordId] = useState(null);
  const [editorContent, setEditorContent] = useState('');

  const activeRecord = useMemo(
    () => records.find((record) => record.id === activeRecordId) ?? null,
    [records, activeRecordId]
  );

  const startCreate = useCallback(() => {
    setMode('CREATE');
    setActiveRecordId(null);
    setEditorContent('');
  }, []);

  const startEdit = useCallback(
    (recordId) => {
      const target = records.find((record) => record.id === recordId);
      if (!target) return;

      setMode('EDIT');
      setActiveRecordId(recordId);
      setEditorContent(target.content);
    },
    [records]
  );

  const startViewOnly = useCallback(
    (recordId) => {
      const target = records.find((record) => record.id === recordId);
      if (!target) return;

      setMode('VIEW');
      setActiveRecordId(recordId);
      setEditorContent(target.content);
    },
    [records]
  );

  const returnToList = useCallback(() => {
    setMode('LIST');
    setActiveRecordId(null);
    setEditorContent('');
  }, []);

  const saveRecord = useCallback(
    ({ content }) => {
      if (mode !== 'CREATE' && mode !== 'EDIT') {
        return { success: false, reason: 'READ_ONLY' };
      }
      if (!content?.trim()) {
        return { success: false, reason: 'EMPTY' };
      }
      if (mode === 'CREATE') {
        const newRecord = {
          id: `antecedente-${Date.now()}`,
          createdAt: new Date().toISOString(),
          createdAtLabel: formatDate(new Date().toISOString()),
          doctorName: 'Dr. Residente (Mock)',
          doctorLicense: 'COL.0000',
          content
        };
        setRecords((prev) => [newRecord, ...prev]);
      } else if (mode === 'EDIT' && activeRecordId) {
        setRecords((prev) =>
          prev.map((record) =>
            record.id === activeRecordId ? { ...record, content } : record
          )
        );
      }
      setMode('LIST');
      setActiveRecordId(null);
      setEditorContent('');
      return { success: true };
    },
    [mode, activeRecordId]
  );

  const contextValue = useMemo(
    () => ({
      title: TITLE,
      records,
      mode,
      activeRecordId,
      activeRecord,
      editorContent,
      setEditorContent,
      startCreate,
      startEdit,
      startViewOnly,
      returnToList,
      saveRecord
    }),
    [
      records,
      mode,
      activeRecordId,
      activeRecord,
      editorContent,
      startCreate,
      startEdit,
      startViewOnly,
      returnToList,
      saveRecord
    ]
  );

  return (
    <AntecedentesContext.Provider value={contextValue}>
      {children}
    </AntecedentesContext.Provider>
  );
};

export const useAntecedentesContext = () => {
  const context = useContext(AntecedentesContext);
  if (!context) {
    throw new Error('useAntecedentesContext must be used within AntecedentesProvider');
  }
  return context;
};
