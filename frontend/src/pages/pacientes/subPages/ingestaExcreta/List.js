import React from 'react';
import { useIngestaExcretaContext } from './Context';

const IngestaExcretaList = () => {
  const { title } = useIngestaExcretaContext();

  return (
    <div className="placeholder-page">
      <h2>{title}</h2>
      <div className="text-muted">Contenido pendiente de definir.</div>
    </div>
  );
};

export default IngestaExcretaList;
