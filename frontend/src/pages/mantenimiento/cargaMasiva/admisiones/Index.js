import React from 'react';
import { ContextProvider } from './Context';
import List from './List';
import Modals from './Modal';

const Index = () => (
  <ContextProvider>
    <List />
    <Modals />
  </ContextProvider>
);

export default Index;
