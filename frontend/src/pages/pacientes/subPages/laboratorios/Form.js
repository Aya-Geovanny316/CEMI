import React from 'react';
import { useLaboratoriosContext } from './Context';

const LaboratoriosForm = () => {
  const { title } = useLaboratoriosContext();

  return (
    <div className="placeholder-form">
      <h3>Formulario - {title}</h3>
      <div className="text-muted">Formulario pendiente de definir.</div>
    </div>
  );
};

export default LaboratoriosForm;
