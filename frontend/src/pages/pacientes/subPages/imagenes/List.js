import React from 'react';
import { useImagenesContext } from './Context';

const ImagenesList = () => {
  const { title } = useImagenesContext();

  return (
    <div className="placeholder-page">
      <h2>{title}</h2>
      <div className="text-muted">Contenido pendiente de definir.</div>
    </div>
  );
};

export default ImagenesList;
