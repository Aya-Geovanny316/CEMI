import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import '../../../assets/scss/style.scss';
import { useForm } from 'react-hook-form';
import { useComponentContext } from './context';
import Swal from 'sweetalert2';

const logo = '/hospital_predeterminada.png';

const SignUp1 = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { isLoading, error, sendData } = useComponentContext();

  useEffect(() => {
    if (isLoading) {
      Swal.fire({
        title: 'Cargando...',
        text: 'Espere mientras se cargan los datos',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
    } else {
      Swal.close();

      if (error) {
        let mensaje = 'Ha ocurrido un error inesperado.';
      
        if (error.includes("User not found")) {
          mensaje = 'El usuario ingresado no existe.';
        } else if (error.includes("Incorrect password")) {
          mensaje = 'La contraseña ingresada es incorrecta.';
        }
      
        Swal.fire({
          icon: 'error',
          title: 'No se pudo iniciar sesión',
          text: mensaje
        });
      }
      
    }
  }, [isLoading, error]);

  const onSubmit = (data) => {
    sendData(data);
  };

  return (
    <>
      <div className="d-flex flex-column flex-md-row vh-100">
        {/* Columna izquierda */}
        <div className="d-flex flex-column justify-content-center align-items-center bg-light w-100 w-md-50 p-4 p-md-5">
          <h3 className="mb-4 fw-bold text-dark text-center">Inicio de Sesión al Sistema</h3>
          <h5 className="mb-4 text-secondary text-center">(DEV)</h5>

          <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%', maxWidth: '400px' }}>
            <div className="mb-3">
              <label className="form-label">Nombre de usuario</label>
              <input
                type="text"
                className="form-control"
                placeholder="usuario"
                {...register('username', { required: 'El nombre de usuario es requerido' })}
              />
              {errors.username && <div className="text-danger">{errors.username.message}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control"
                placeholder="password"
                {...register('password', { required: 'Contraseña requerida' })}
              />
              {errors.password && <div className="text-danger">{errors.password.message}</div>}
            </div>

            <div className="text-end mb-3">
              <NavLink to="/auth/signin-1" className="text-primary small">
                Inicia Sesión en el Sistema
              </NavLink>
            </div>

            {/* <div className="text-end mb-3">
              <NavLink to="/auth/reset-password-1" className="text-primary small">
                ¿Has olvidado tu contraseña?
              </NavLink>
            </div> */}

            <button type="submit" className="btn btn-primary w-100">Continue</button>
          </form>
        </div>

        {/* Columna derecha */}
        <div
          className="d-none d-md-flex flex-column justify-content-center align-items-center w-100"
          style={{
            backgroundColor: '#c6f4fc',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <img src={logo} alt="Logo EPEQ" style={{ maxWidth: '280px', width: '80%' }} />
        </div>
      </div>
    </>
  );
};

export default SignUp1;
