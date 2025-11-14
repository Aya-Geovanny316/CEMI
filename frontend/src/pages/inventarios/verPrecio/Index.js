import React from 'react';
import { PreciosProvider } from './Context';
import ListadoPrecios from './ListadoPrecios';
import ModalPrecios from './ModalPrecios';

const Index = () => (
  <PreciosProvider>
    <ListadoPrecios />
    <ModalPrecios />
  </PreciosProvider>
);

export default Index;
