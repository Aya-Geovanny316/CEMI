import React from 'react';
import { ContextProvider } from './Context';
import Bodegas from './List.js';
import ModalDirectorio from './ModalMarca.js';

const Index = () => (
  <ContextProvider>
    <Bodegas />
    <ModalDirectorio />
  </ContextProvider>
);

export default Index;
