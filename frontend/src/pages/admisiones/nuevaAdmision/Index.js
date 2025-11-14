import React from 'react'
import { AppProvider } from './Context';  // Asegúrate de importar el proveedor
import FormularioAdmision from './Form';

const Index = () => {
  return (
    <AppProvider>
      <FormularioAdmision />
    </AppProvider>
  )
}

export default Index