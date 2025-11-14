import React from 'react';
import { ContextProvider } from './Context';
import Medidas from './List.js';
import ModalMedidas from './ModalMedidas.js';
import ModalMovimientoSKU from './ModalMovimientoSKU.js';

const Index = () => (
  <ContextProvider>
    <Medidas />
    <ModalMedidas />
    <ModalMovimientoSKU />
  </ContextProvider>
);

export default Index;
