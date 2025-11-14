import React from 'react';
import { ContextProvider } from './Context';
import Proveedores from './List.js';
import ModalProveedor from './ModalProveedor.js';

const Index = () => (
  <ContextProvider>
    <Proveedores />
    <ModalProveedor />
  </ContextProvider>
);

export default Index;
