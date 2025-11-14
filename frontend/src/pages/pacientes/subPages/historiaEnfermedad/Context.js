import React, { createContext, useContext, useMemo, useState } from 'react';

const DEFAULT_TITLE = 'Historia de la Enfermedad';

const HistoriaEnfermedadContext = createContext({
  title: DEFAULT_TITLE,
  content: '',
  handleContentChange: () => {}
});

export const useHistoriaEnfermedadContext = () =>
  useContext(HistoriaEnfermedadContext);

export const HistoriaEnfermedadProvider = ({ children }) => {
  const [content, setContent] = useState('');

  const value = useMemo(
    () => ({
      title: DEFAULT_TITLE,
      content,
      handleContentChange: setContent
    }),
    [content]
  );

  return (
    <HistoriaEnfermedadContext.Provider value={value}>
      {children}
    </HistoriaEnfermedadContext.Provider>
  );
};
