import React from 'react';
import { EvolucionProvider } from './Context';
import EvolucionList from './List';
import EvolucionForm from './Form';

const Evolucion = () => (
  <EvolucionProvider>
    <div className="placeholder-page">
      <EvolucionList />
      <EvolucionForm />
    </div>
  </EvolucionProvider>
);

export default Evolucion;
