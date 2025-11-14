import React from 'react'
import { ContextProvider } from './Context';  // Asegúrate de importar el proveedor
import Users from './Users';
import ModalUserForm from './ModalUserForm';
import ModalResetPassword from './ModalResetPassword';

const Index = () => {
  return (
    <ContextProvider>
      <Users />
      <ModalUserForm />
      <ModalResetPassword />
    </ContextProvider>
  )
}

export default Index