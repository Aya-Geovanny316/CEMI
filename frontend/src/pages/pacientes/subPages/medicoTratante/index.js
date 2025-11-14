import React from 'react';
import { MedicoTratanteProvider } from './Context';
import MedicoTratanteList from './List';
import MedicoTratanteForm from './Form';

const MedicoTratante = () => (
  <MedicoTratanteProvider>
    <div className="placeholder-page">
      <MedicoTratanteList />
      {/* <MedicoTratanteForm /> */}
    </div>
  </MedicoTratanteProvider>
);

export default MedicoTratante;
