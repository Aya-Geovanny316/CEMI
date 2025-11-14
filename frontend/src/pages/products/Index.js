import React from 'react';
import { ContextProvider } from './Context';
import { Products } from './Products';
import ModalProductForm from './ModalProductForm'; // ✅ nombre nuevo

const Index = () => {
  return (
    <ContextProvider>
      <Products />
      <ModalProductForm />
    </ContextProvider>
  );
};

export default Index;
