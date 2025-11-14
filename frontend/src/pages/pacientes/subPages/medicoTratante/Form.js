import React from 'react';
import { useMedicoTratanteContext } from './Context';

const MedicoTratanteForm = () => {
  useMedicoTratanteContext();

  return (
    <div className="placeholder-form">
      <div className="text-muted">Formulario pendiente de definir.</div>
    </div>
  );
};

export default MedicoTratanteForm;
