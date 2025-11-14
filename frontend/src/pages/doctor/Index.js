import React from 'react'
import { ContextProvider } from './Context';  // Asegúrate de importar el proveedor
import ModalCreate from './PrescriptionForm';
import ModalRol from './ModarRol';
import PrescriptionForm from './PrescriptionForm';
import PrescriptionTable from './PrescriptionTable';

const Index = () => {
  return (
    <ContextProvider>
      <PrescriptionForm />
      <PrescriptionTable />
      {/* <ModalCreate /> */}
      <ModalRol/>
    </ContextProvider>
  )
}

export default Index