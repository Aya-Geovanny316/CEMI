import React from 'react';
import { SignosVitalesEmergenciaProvider } from './Context';
import SignosVitalesEmergenciaForm from './Form';
import SignosVitalesEmergenciaList from './List';

const SignosVitalesEmergencia = () => (
  <SignosVitalesEmergenciaProvider>
    <div className="signos-vitales-emergencia d-flex flex-column gap-4">
      <SignosVitalesEmergenciaForm />
      <SignosVitalesEmergenciaList />
    </div>
  </SignosVitalesEmergenciaProvider>
);

export default SignosVitalesEmergencia;
