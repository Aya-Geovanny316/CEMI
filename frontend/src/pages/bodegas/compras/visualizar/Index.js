import React from 'react';
import { ContextProvider } from './Context';
import List from './List';
import ModalRequisicion from './ModalRequisicion';

const Index = () => {
  return (
    <ContextProvider>
      <List />
      <ModalRequisicion />
    </ContextProvider>
  );
};

export default Index;
