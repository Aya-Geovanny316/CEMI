import React, { createContext, useContext, useMemo } from 'react';

const DEFAULT_STATE = {
  title: 'Ingesta Excreta'
};

const IngestaExcretaContext = createContext(DEFAULT_STATE);

export const useIngestaExcretaContext = () => useContext(IngestaExcretaContext);

export const IngestaExcretaProvider = ({ children }) => {
  const value = useMemo(() => DEFAULT_STATE, []);

  return (
    <IngestaExcretaContext.Provider value={value}>
      {children}
    </IngestaExcretaContext.Provider>
  );
};
