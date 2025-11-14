import React from 'react';
import { AppProvider } from './Context';
import ListadoHabitaciones from './List';
import ModalForm from './ModalForm';

const Index = () => {
  return (
    <AppProvider>
      <ListadoHabitaciones />
      <ModalForm />
    </AppProvider>
  );
};

export default Index;
