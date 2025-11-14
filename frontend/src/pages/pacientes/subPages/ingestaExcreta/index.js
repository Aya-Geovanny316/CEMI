import React from 'react';
import { IngestaExcretaProvider } from './Context';
import IngestaExcretaList from './List';
import IngestaExcretaForm from './Form';

const IngestaExcreta = () => (
  <IngestaExcretaProvider>
    <div className="placeholder-page">
      <IngestaExcretaList />
      <IngestaExcretaForm />
    </div>
  </IngestaExcretaProvider>
);

export default IngestaExcreta;
