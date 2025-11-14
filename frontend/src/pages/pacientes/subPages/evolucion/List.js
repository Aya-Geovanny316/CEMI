import React from 'react';
import { useEvolucionContext } from './Context';

const EvolucionList = () => {
  const { title } = useEvolucionContext();

  return (
    <div className="placeholder-page">
      <h2>{title}</h2>
      <div className="text-muted">Contenido pendiente de definir.</div>
    </div>
  );
};

export default EvolucionList;
