import React, { createContext, useContext, useMemo } from 'react';

const DEFAULT_STATE = {
  title: 'Información del Paciente',
  data: null
};

const InfoPacienteContext = createContext(DEFAULT_STATE);

export const useInfoPacienteContext = () => useContext(InfoPacienteContext);

export const InfoPacienteProvider = ({ children, value }) => {
  const contextValue = useMemo(() => ({ ...DEFAULT_STATE, ...value }), [value]);

  return (
    <InfoPacienteContext.Provider value={contextValue}>
      {children}
    </InfoPacienteContext.Provider>
  );
};

