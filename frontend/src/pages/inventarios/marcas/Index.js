import React from 'react';
import { ContextProvider } from './Context';
import Proveedores from './List.js';
import ModalMarca from './ModalMarca.js';

const Index = () => (
  <ContextProvider>
    <Proveedores />
    <ModalMarca />
  </ContextProvider>
);

export default Index;
