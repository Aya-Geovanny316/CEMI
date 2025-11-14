import React, { createContext, useContext, useMemo } from 'react';

const DEFAULT_STATE = {
  title: 'Médico Tratante',
  columns: [
    { key: 'medico', label: 'Médico' },
    { key: 'especialidad', label: 'Especialidad' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'correo', label: 'Correo' },
    { key: 'observaciones', label: 'Observaciones' }
  ],
  items: []
};

const MedicoTratanteContext = createContext(DEFAULT_STATE);

export const useMedicoTratanteContext = () => useContext(MedicoTratanteContext);

export const MedicoTratanteProvider = ({ children, value }) => {
  const contextValue = useMemo(
    () => ({ ...DEFAULT_STATE, ...value }),
    [value]
  );

  return (
    <MedicoTratanteContext.Provider value={contextValue}>
      {children}
    </MedicoTratanteContext.Provider>
  );
};
