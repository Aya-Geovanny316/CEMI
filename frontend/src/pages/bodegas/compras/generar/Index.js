import React from 'react';
import { ContextProvider } from './Context';
import Form from './Form';
import ModalProveedor from './ModalProveedor';

const Index = () => {
  return (
    <ContextProvider>
      <Form />
      <ModalProveedor />
    </ContextProvider>
  );
};

export default Index;
