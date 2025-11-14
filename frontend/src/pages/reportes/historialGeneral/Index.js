import React from 'react';
import { ContextProvider } from './Context';
import Proveedores from './List.js';

const Index = () => (
  <ContextProvider>
    <Proveedores />
  </ContextProvider>
);

export default Index;
