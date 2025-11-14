import React from 'react';
import { ImagenesProvider } from './Context';
import ImagenesList from './List';
import ImagenesForm from './Form';

const Imagenes = () => (
  <ImagenesProvider>
    <div className="placeholder-page">
      <ImagenesList />
      <ImagenesForm />
    </div>
  </ImagenesProvider>
);

export default Imagenes;
