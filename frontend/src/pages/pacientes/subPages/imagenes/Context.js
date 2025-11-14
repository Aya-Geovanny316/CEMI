import React, { createContext, useContext, useMemo } from 'react';

const DEFAULT_STATE = {
  title: 'Imagenes'
};

const ImagenesContext = createContext(DEFAULT_STATE);

export const useImagenesContext = () => useContext(ImagenesContext);

export const ImagenesProvider = ({ children }) => {
  const value = useMemo(() => DEFAULT_STATE, []);

  return (
    <ImagenesContext.Provider value={value}>
      {children}
    </ImagenesContext.Provider>
  );
};
