import React from 'react';
import { useIngestaExcretaContext } from './Context';

const IngestaExcretaForm = () => {
  const { title } = useIngestaExcretaContext();

  return (
    <div className="placeholder-form">
      <h3>Formulario - {title}</h3>
      <div className="text-muted">Formulario pendiente de definir.</div>
    </div>
  );
};

export default IngestaExcretaForm;
