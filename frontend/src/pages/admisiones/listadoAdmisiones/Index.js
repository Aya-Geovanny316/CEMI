import React from 'react';
import { AppProvider } from './Context';
import ListadoAdmisiones from './ListAdmisiones';
import ModalAdmision from './ModalForm';

const Index = () => {
  return (
    <AppProvider>
      <ListadoAdmisiones />
      <ModalAdmision />
    </AppProvider>
  );
};

export default Index;
