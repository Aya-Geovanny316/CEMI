import React, { createContext, useContext, useMemo } from 'react';

const DEFAULT_STATE = {
  title: 'Solicitud de Medicamentos'
};

const SolicitudMedicamentosContext = createContext(DEFAULT_STATE);

export const useSolicitudMedicamentosContext = () => useContext(SolicitudMedicamentosContext);

export const SolicitudMedicamentosProvider = ({ children }) => {
  const value = useMemo(() => DEFAULT_STATE, []);

  return (
    <SolicitudMedicamentosContext.Provider value={value}>
      {children}
    </SolicitudMedicamentosContext.Provider>
  );
};
