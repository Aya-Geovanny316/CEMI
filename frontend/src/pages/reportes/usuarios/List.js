import React from 'react';
import { Button } from 'react-bootstrap';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useMyContext } from './Context';

const Usuarios = () => {
  const {
    data,
    prevPage,
    nextPage,
    nullPrevPage,
    nullNextPage,
    exportarUsuariosPDF,
  } = useMyContext();

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-end mb-2">
        <Button variant="success" size="sm" onClick={exportarUsuariosPDF}>
          Descargar PDF
        </Button>
      </div>

      <h5 className="mb-3">Listado de Usuarios</h5>

      <table className="table table-bordered table-sm mt-2">
        <thead className="table-primary text-dark fw-semibold">
          <tr>
            <th className="text-center">Id</th>
            <th className="text-center">Usuario</th>
            <th className="text-center">Nombre</th>
            <th className="text-center">E-mail</th>
            <th className="text-center">Activo</th>
          </tr>
        </thead>
        <tbody>
          {data.map((user, idx) => (
            <tr key={idx}>
              <td className="text-center">{user.id}</td>
              <td className="text-center">{user.username}</td>
              <td>{user.perfil.primer_nombre} {user.perfil.primer_apellido}</td>
              <td>{user.email}</td>
              <td className="text-center">
                <span className={`badge ${user.is_active ? 'badge-success' : 'badge-danger'}`}>
                  {user.is_active ? 'Sí' : 'No'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="d-flex justify-content-end">
        <Button onClick={prevPage} disabled={nullPrevPage === null}>
          <FiChevronLeft />
        </Button>
        <Button onClick={nextPage} disabled={nullNextPage === null}>
          <FiChevronRight />
        </Button>
      </div>
    </div>
  );
};

export default Usuarios;
