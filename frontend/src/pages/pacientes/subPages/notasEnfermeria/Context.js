import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react';

const TITLE = 'Notas de Enfermería';

const SCHEDULES = [
  'Nota de Enfermería de 07:00 a 13:00 hrs',
  'Nota de Enfermería de 13:00 a 19:00 hrs',
  'Nota de Enfermería de 19:00 a 23:59 hrs',
  'Nota de Enfermería de 00:00 a 06:59 hrs'
];

const STATUS = {
  EDICION: 'EDICION',
  CERRADA: 'CERRADA'
};

const STATUS_LABELS = {
  [STATUS.EDICION]: 'Edición',
  [STATUS.CERRADA]: 'Cerrada'
};

const SAMPLE_NOTES = [
  {
    id: 'note-1',
    createdAt: '2025-09-20T08:30:00-06:00',
    schedule: SCHEDULES[0],
    status: STATUS.EDICION,
    author: 'María López',
    createdAtLabel: '20/09/2025 08:30',
    content:
      '<p>Paciente sin dolor, controlado, recibe medicación. Signos vitales dentro de rango normal.</p>',
    lastUpdatedAt: '2025-09-20T09:00:00-06:00',
    lastUpdatedBy: 'María López',
    lastUpdatedAtLabel: '20/09/2025 09:00'
  },
  {
    id: 'note-2',
    createdAt: '2025-09-20T14:10:00-06:00',
    schedule: SCHEDULES[1],
    status: STATUS.CERRADA,
    author: 'Carlos Méndez',
    createdAtLabel: '20/09/2025 14:10',
    content:
      '<p>Se administra suero, paciente responde adecuadamente. Se monitorea reacción.</p>',
    lastUpdatedAt: '2025-09-20T18:00:00-06:00',
    lastUpdatedBy: 'Carlos Méndez',
    lastUpdatedAtLabel: '20/09/2025 18:00',
    closedAt: '2025-09-20T19:05:00-06:00',
    closedBy: 'Carlos Méndez',
    closedAtLabel: '20/09/2025 19:05'
  },
  {
    id: 'note-3',
    createdAt: '2025-09-21T07:00:00-06:00',
    schedule: SCHEDULES[0],
    status: STATUS.EDICION,
    author: 'Julio César Chávez',
    createdAtLabel: '21/09/2025 07:00',
    content: '<p>Paciente descansando, sin cambios significativos.</p>',
    lastUpdatedAt: null,
    lastUpdatedBy: null,
    lastUpdatedAtLabel: null
  }
];

const NotasEnfermeriaContext = createContext(null);

const formatDate = (iso) => {
  if (!iso) return null;
  try {
    const formatter = new Intl.DateTimeFormat('es-GT', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
    return formatter.format(new Date(iso));
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

export const NotasEnfermeriaProvider = ({ children }) => {
  const [notes, setNotes] = useState(() => SAMPLE_NOTES);
  const [mode, setMode] = useState('LIST'); // LIST | CREATE | EDIT | VIEW
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [editorSchedule, setEditorSchedule] = useState(SCHEDULES[0]);
  const [editorStatus, setEditorStatus] = useState(STATUS.EDICION);
  const [feedback, setFeedback] = useState(null);

  const activeNote = useMemo(
    () => notes.find((note) => note.id === activeNoteId) ?? null,
    [notes, activeNoteId]
  );

  const sortedNotes = useMemo(
    () =>
      [...notes].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [notes]
  );

  const enterListMode = useCallback(() => {
    setMode('LIST');
    setActiveNoteId(null);
    setEditorContent('');
    setEditorSchedule(SCHEDULES[0]);
    setEditorStatus(STATUS.EDICION);
  }, []);

  const startCreate = useCallback(() => {
    setMode('CREATE');
    setActiveNoteId(null);
    setEditorContent('');
    setEditorSchedule(SCHEDULES[0]);
    setEditorStatus(STATUS.EDICION);
  }, []);

  const startView = useCallback((noteId) => {
    const note = notes.find((item) => item.id === noteId);
    if (!note) return;
    setActiveNoteId(noteId);
    setEditorContent(note.content);
    setEditorSchedule(note.schedule);
    setEditorStatus(note.status);
    setMode('VIEW');
  }, [notes]);

  const startEdit = useCallback((noteId) => {
    const note = notes.find((item) => item.id === noteId);
    if (!note) return;
    setActiveNoteId(noteId);
    setEditorContent(note.content);
    setEditorSchedule(note.schedule);
    setEditorStatus(note.status);
    setMode('EDIT');
  }, [notes]);

  const saveNote = useCallback(() => {
    if (!editorContent || editorContent.trim() === '' || editorContent === '<p><br></p>') {
      setFeedback({ type: 'danger', message: 'Debes ingresar contenido para la nota.' });
      return { success: false };
    }

    const user = resolveCurrentUser();
    const nowIso = new Date().toISOString();

    if (mode === 'CREATE') {
      const newNote = {
        id: `note-${Date.now()}`,
        createdAt: nowIso,
        createdAtLabel: formatDate(nowIso),
        schedule: editorSchedule,
        status: editorStatus,
        author: user,
        content: editorContent,
        lastUpdatedAt: null,
        lastUpdatedBy: null,
        lastUpdatedAtLabel: null,
        closedAt: null,
        closedBy: null,
        closedAtLabel: null
      };
      setNotes((prev) => [newNote, ...prev]);
      setFeedback({ type: 'success', message: 'Nota registrada correctamente.' });
      enterListMode();
      return { success: true };
    }

    if (mode === 'EDIT' && activeNoteId) {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === activeNoteId
            ? {
                ...note,
                content: editorContent,
                schedule: editorSchedule,
                status: editorStatus,
                lastUpdatedAt: nowIso,
                lastUpdatedBy: user,
                lastUpdatedAtLabel: formatDate(nowIso)
              }
            : note
        )
      );
      setFeedback({ type: 'success', message: 'Nota actualizada correctamente.' });
      enterListMode();
      return { success: true };
    }

    setFeedback({ type: 'warning', message: 'Acción no permitida en el estado actual.' });
    return { success: false };
  }, [editorContent, editorSchedule, editorStatus, mode, activeNoteId, enterListMode]);

  const confirmCloseNote = useCallback(() => {
    if (mode !== 'EDIT' || editorStatus !== STATUS.CERRADA || !activeNoteId) {
      return { success: false };
    }
    const shouldClose = window.confirm(
      '¿Desea cerrar la nota? Una vez cerrada no podrá editarse.'
    );
    if (!shouldClose) {
      return { success: false };
    }
    const user = resolveCurrentUser();
    const nowIso = new Date().toISOString();
    setNotes((prev) =>
      prev.map((note) =>
        note.id === activeNoteId
          ? {
              ...note,
              status: STATUS.CERRADA,
              closedAt: nowIso,
              closedBy: user,
              closedAtLabel: formatDate(nowIso)
            }
          : note
      )
    );
    setFeedback({ type: 'success', message: 'La nota fue cerrada correctamente.' });
    enterListMode();
    return { success: true };
  }, [mode, editorStatus, activeNoteId, enterListMode]);

  const contextValue = useMemo(
    () => ({
      title: TITLE,
      notes: sortedNotes,
      schedules: SCHEDULES,
      statusOptions: STATUS,
      statusLabels: STATUS_LABELS,
      mode,
      activeNoteId,
      activeNote,
      editorContent,
      setEditorContent,
      editorSchedule,
      setEditorSchedule,
      editorStatus,
      setEditorStatus,
      startCreate,
      startView,
      startEdit,
      saveNote,
      confirmCloseNote,
      enterListMode,
      feedback,
      setFeedback
    }),
    [
      sortedNotes,
      mode,
      activeNoteId,
      activeNote,
      editorContent,
      editorSchedule,
      editorStatus,
      startCreate,
      startView,
      startEdit,
      saveNote,
      confirmCloseNote,
      enterListMode,
      feedback
    ]
  );

  return (
    <NotasEnfermeriaContext.Provider value={contextValue}>
      {children}
    </NotasEnfermeriaContext.Provider>
  );
};

export const useNotasEnfermeriaContext = () => {
  const context = useContext(NotasEnfermeriaContext);
  if (!context) {
    throw new Error('useNotasEnfermeriaContext must be used within NotasEnfermeriaProvider');
  }
  return context;
};
