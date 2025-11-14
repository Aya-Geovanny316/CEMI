import React from 'react';
import { ContextProvider } from './Context';
import Bodegas from './List.js';
import ModalMarca from './ModalMarca.js';

const Index = () => (
  <ContextProvider>
    <Bodegas />
    <ModalMarca />
  </ContextProvider>
);

export default Index;
