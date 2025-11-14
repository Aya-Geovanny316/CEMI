import React from 'react'
import { ContextProvider } from './Context';  // Asegúrate de importar el proveedor
import { Roles } from './Roles';
import ModalCreate from './ModalCreate';

const Index = () => {
  return (
    <ContextProvider>
      <Roles />
      <ModalCreate />
    </ContextProvider>
  )
}

export default Index