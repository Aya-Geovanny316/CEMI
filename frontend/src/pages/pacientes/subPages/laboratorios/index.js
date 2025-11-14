import React from 'react';
import { LaboratoriosProvider } from './Context';
import LaboratoriosList from './List';
import LaboratoriosForm from './Form';

const Laboratorios = () => (
  <LaboratoriosProvider>
    <div className="placeholder-page">
      <LaboratoriosList />
      <LaboratoriosForm />
    </div>
  </LaboratoriosProvider>
);

export default Laboratorios;
