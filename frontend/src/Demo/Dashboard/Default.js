import React from 'react';
import { Container } from 'react-bootstrap';

import Aux from '../../hoc/_Aux';
import welcomeImage from '../../assets/images/hospistal/hospital_image.jpg';

const Dashboard = () => {
  return (
    <Aux>
      <Container
        fluid
        className="vh-100 d-flex flex-column justify-content-center align-items-center bg-light text-center px-3"
      >
        {/* Animación embebida */}
        <style>
          {`
            .fade-in {
              opacity: 0;
              transform: translateY(10px);
              animation: fadeInUp 1s ease forwards;
            }

            @keyframes fadeInUp {
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}
        </style>

        <h2 className="text-primary font-weight-bold fade-in mb-4">
          Bienvenido al sistema del Hospital General
        </h2>

        <img
          src={welcomeImage}
          alt="Bienvenida Hospital"
          className="fade-in img-fluid"
          style={{
            width: '90%',
            marginBottom: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}
        />
      </Container>
    </Aux>
  );
};

export default Dashboard;
