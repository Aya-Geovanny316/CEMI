import React from 'react';
import { NotasEnfermeriaProvider, useNotasEnfermeriaContext } from './Context';
import NotasEnfermeriaList from './List';
import NotasEnfermeriaForm from './Form';

const NotasEnfermeriaContent = () => {
  const { mode } = useNotasEnfermeriaContext();

  if (mode === 'LIST') {
    return <NotasEnfermeriaList />;
  }

  return <NotasEnfermeriaForm />;
};

const NotasEnfermeria = () => (
  <NotasEnfermeriaProvider>
    <NotasEnfermeriaContent />
  </NotasEnfermeriaProvider>
);

export default NotasEnfermeria;
