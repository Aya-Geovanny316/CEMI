import React from 'react'
import { ContextProvider } from './Context';  // Asegúrate de importar el proveedor
import { Users } from './Users';
import ModalCreate from './ModalCreate';
import ModalRol from './ModarRol';

const Index = () => {
  return (
    <ContextProvider>
      <h1>Enfermera</h1>
      {/* <Users />
      <ModalCreate />
      <ModalRol/> */}
    </ContextProvider>
  )
}

export default Index