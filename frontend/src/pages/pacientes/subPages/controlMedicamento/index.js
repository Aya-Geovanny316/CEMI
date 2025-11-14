import React from 'react';
import { ControlMedicamentoProvider } from './Context';
import ControlMedicamentoList from './List';

const ControlMedicamento = () => (
  <ControlMedicamentoProvider>
    <ControlMedicamentoList />
  </ControlMedicamentoProvider>
);

export default ControlMedicamento;

