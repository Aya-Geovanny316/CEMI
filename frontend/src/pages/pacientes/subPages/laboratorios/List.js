import React from 'react';
import { useLaboratoriosContext } from './Context';

const LaboratoriosList = () => {
  const { title } = useLaboratoriosContext();

  return (
    <div className="placeholder-page">
      <h2>{title}</h2>
      <div className="text-muted">Contenido pendiente de definir.</div>
    </div>
  );
};

export default LaboratoriosList;
