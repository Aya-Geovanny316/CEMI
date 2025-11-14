import React from 'react';
import { useInfoPacienteContext } from './Context';
import FormData from './FormData';

const InfoPacienteList = () => {
  const { title, data } = useInfoPacienteContext();

  return (
    <div className="placeholder-page">
      <FormData data={data} />
    </div>
  );
};

export default InfoPacienteList;

