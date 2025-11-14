import React from 'react';
import { useImagenesContext } from './Context';

const ImagenesForm = () => {
  const { title } = useImagenesContext();

  return (
    <div className="placeholder-form">
      <h3>Formulario - {title}</h3>
      <div className="text-muted">Formulario pendiente de definir.</div>
    </div>
  );
};

export default ImagenesForm;
