import React from 'react';
import { ContextProvider } from './Context';
import Proveedores from './List.js';
import ModalCategoria from './ModalCategoria.js';

const Index = () => (
  <ContextProvider>
    <Proveedores />
    <ModalCategoria />
  </ContextProvider>
);

export default Index;
