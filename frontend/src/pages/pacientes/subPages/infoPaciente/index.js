import React from 'react';
import { InfoPacienteProvider } from './Context';
import InfoPacienteList from './List';

const InfoPaciente = () => (
  <InfoPacienteProvider>
    <InfoPacienteList />
  </InfoPacienteProvider>
);

export default InfoPaciente;
