import React, { createContext, useContext, useMemo } from 'react';

const DEFAULT_STATE = {
  title: 'Laboratorios'
};

const LaboratoriosContext = createContext(DEFAULT_STATE);

export const useLaboratoriosContext = () => useContext(LaboratoriosContext);

export const LaboratoriosProvider = ({ children }) => {
  const value = useMemo(() => DEFAULT_STATE, []);

  return (
    <LaboratoriosContext.Provider value={value}>
      {children}
    </LaboratoriosContext.Provider>
  );
};
