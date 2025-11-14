import React from 'react';
import { ContextProvider } from './Context';
import Medidas from './List.js';
import ModalMedidas from './ModalMedidas.js';

const Index = () => (
  <ContextProvider>
    <Medidas />
    <ModalMedidas />
  </ContextProvider>
);

export default Index;
