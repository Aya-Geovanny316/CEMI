import React from 'react';
import { DietasProvider, useDietasContext } from './Context';
import DietasList from './List';
import DietasForm from './Form';

const DietasContent = () => {
  const { mode } = useDietasContext();

  if (mode === 'LIST') {
    return <DietasList />;
  }

  return <DietasForm />;
};

const Dietas = () => (
  <DietasProvider>
    <DietasContent />
  </DietasProvider>
);

export default Dietas;
