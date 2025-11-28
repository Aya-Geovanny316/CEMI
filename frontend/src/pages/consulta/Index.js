import React from 'react';

import { ConsultaProvider } from './context';
import ConsultaPage from './ConsultaPage';

const Index = () => (
  <ConsultaProvider>
    <ConsultaPage />
  </ConsultaProvider>
);

export default Index;
