import React from 'react';
import { HistoriaEnfermedadProvider } from './Context';
import HistoriaEnfermedadForm from './Form';

const HistoriaEnfermedad = () => (
  <HistoriaEnfermedadProvider>
    <HistoriaEnfermedadForm />
  </HistoriaEnfermedadProvider>
);

export default HistoriaEnfermedad;
