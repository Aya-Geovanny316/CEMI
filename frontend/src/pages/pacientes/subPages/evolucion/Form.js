import React from 'react';
import { useEvolucionContext } from './Context';

const EvolucionForm = () => {
  const { title } = useEvolucionContext();

  return (
    <div className="placeholder-form">
      <h3>Formulario - {title}</h3>
      <div className="text-muted">Formulario pendiente de definir.</div>
    </div>
  );
};

export default EvolucionForm;
