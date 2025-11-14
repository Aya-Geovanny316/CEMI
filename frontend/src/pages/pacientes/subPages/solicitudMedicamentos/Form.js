import React from 'react';
import { useSolicitudMedicamentosContext } from './Context';

const SolicitudMedicamentosForm = () => {
  const { title } = useSolicitudMedicamentosContext();

  return (
    <div className="placeholder-form">
      <h3>Formulario - {title}</h3>
      <div className="text-muted">Formulario pendiente de definir.</div>
    </div>
  );
};

export default SolicitudMedicamentosForm;
