import React from 'react';
import { AntecedentesProvider, useAntecedentesContext } from './Context';
import AntecedentesList from './List';
import AntecedentesEditor from './Editor';

const AntecedentesContent = () => {
  const { mode } = useAntecedentesContext();

  if (mode === 'LIST') {
    return <AntecedentesList />;
  }

  return <AntecedentesEditor />;
};

const Antecedentes = () => (
  <AntecedentesProvider>
    <AntecedentesContent />
  </AntecedentesProvider>
);

export default Antecedentes;
