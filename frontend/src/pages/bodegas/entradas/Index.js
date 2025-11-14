import React, { useContext, useEffect } from 'react';
import { ContextProvider, AppContext } from './Context';
import List from './List';
import EntradaForm from './Form';
import DetalleModal from './DetalleModal';

const Inner = () => {
  const { showForm, aplicarEntrada } = useContext(AppContext);

  // Opcional: exponer para pruebas manuales en consola
  useEffect(() => {
    window.applyEntrada = aplicarEntrada;
  }, [aplicarEntrada]);

  return (
    <>
      {!showForm && <List />}
      {showForm && <EntradaForm />}
      <DetalleModal />
    </>
  );
};

const Index = () => (
  <ContextProvider>
    <Inner />
  </ContextProvider>
);

export default Index;
