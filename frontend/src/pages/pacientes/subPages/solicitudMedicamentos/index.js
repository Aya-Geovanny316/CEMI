import React from 'react';
import { SolicitudMedicamentosProvider } from './Context';
import SolicitudMedicamentosList from './List';
import SolicitudMedicamentosForm from './Form';

const SolicitudMedicamentos = () => (
  <SolicitudMedicamentosProvider>
    <div className="placeholder-page">
      <SolicitudMedicamentosList />
      <SolicitudMedicamentosForm />
    </div>
  </SolicitudMedicamentosProvider>
);

export default SolicitudMedicamentos;
