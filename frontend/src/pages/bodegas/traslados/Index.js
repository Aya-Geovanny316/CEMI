import React, { useContext } from 'react';
import { ContextProvider, AppContext } from './Context';
import List from './List';
import Form from './Form';
import DetalleModal from './DetalleModal';

const Inner = () => {
  const { showForm } = useContext(AppContext);
  return <>
    {!showForm ? <List /> : <Form />}
    <DetalleModal />
  </>
};

const Index = () => (
  <ContextProvider>
    <Inner />
  </ContextProvider>
);

export default Index;
