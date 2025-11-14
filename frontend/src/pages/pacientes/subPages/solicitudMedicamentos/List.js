import React from 'react';
import { useSolicitudMedicamentosContext } from './Context';

const SolicitudMedicamentosList = () => {
  const { title } = useSolicitudMedicamentosContext();

  return (
    <div className="placeholder-page">
      <h2>{title}</h2>
      <div className="text-muted">Contenido pendiente de definir.</div>
    </div>
  );
};

export default SolicitudMedicamentosList;
