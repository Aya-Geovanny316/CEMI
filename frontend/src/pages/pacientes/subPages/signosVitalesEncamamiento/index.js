import React from 'react';
import { SignosVitalesEncamamientoProvider } from './Context';
import SignosVitalesEncamamientoList from './List';

const SignosVitalesEncamamiento = () => (
  <SignosVitalesEncamamientoProvider>
    <SignosVitalesEncamamientoList />
  </SignosVitalesEncamamientoProvider>
);

export default SignosVitalesEncamamiento;
