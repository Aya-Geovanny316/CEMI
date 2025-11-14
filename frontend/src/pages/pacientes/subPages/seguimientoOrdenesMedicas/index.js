import React from 'react';
import { SeguimientoOrdenesMedicasProvider } from './Context';
import SeguimientoOrdenesMedicasList from './List';
import SeguimientoOrdenesMedicasDetail from './Detail';

const SeguimientoOrdenesMedicas = () => (
  <SeguimientoOrdenesMedicasProvider>
    <div className="seguimiento-ordenes-medicas d-flex flex-column gap-4">
      <SeguimientoOrdenesMedicasList />
      <SeguimientoOrdenesMedicasDetail />
    </div>
  </SeguimientoOrdenesMedicasProvider>
);

export default SeguimientoOrdenesMedicas;

