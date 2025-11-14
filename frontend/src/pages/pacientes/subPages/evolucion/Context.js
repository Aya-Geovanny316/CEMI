import React, { createContext, useContext, useMemo } from 'react';

const DEFAULT_STATE = {
  title: 'Evolucion'
};

const EvolucionContext = createContext(DEFAULT_STATE);

export const useEvolucionContext = () => useContext(EvolucionContext);

export const EvolucionProvider = ({ children }) => {
  const value = useMemo(() => DEFAULT_STATE, []);

  return (
    <EvolucionContext.Provider value={value}>
      {children}
    </EvolucionContext.Provider>
  );
};
