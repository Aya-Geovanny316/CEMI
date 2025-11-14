import React from 'react';
import { Button } from 'react-bootstrap';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useMyContext } from './Context';

const Marcas = () => {
  const {
    data,
    prevPage,
    nextPage,
    nullPrevPage,
    nullNextPage,
    setFechaInicio,
    setFechaFin,
    cargarDatos,
    fechaFin,
    fechaInicio,
    exportarHistorialPDF
  } = useMyContext();

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Historial de cambios</h5>
        <Button variant="success" size="sm" onClick={exportarHistorialPDF}>
          Descargar PDF
        </Button>
      </div>

      <div className="d-flex align-items-end gap-3 mb-3">
        <div>
          <label>Desde:</label>
          <input
            type="date"
            className="form-control"
            value={fechaInicio}
            onChange={(e) => {
              setFechaInicio(e.target.value);
              cargarDatos();
            }}
          />
        </div>

        <div>
          <label>Hasta:</label>
          <input
            type="date"
            className="form-control"
            value={fechaFin}
            onChange={(e) => {
              setFechaFin(e.target.value);
              cargarDatos();
            }}
          />
        </div>
      </div>

      <table className="table table-bordered table-sm mt-2">
        <thead className="table-primary text-dark fw-semibold">
          <tr>
            <th className="text-center">ID</th>
            <th className="text-center">Fecha</th>
            <th className="text-center">Usuario</th>
            <th className="text-center">Método</th>
            <th className="text-center">Descripción</th>
            <th className="text-center">Estado</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => {
            const metodoColor = {
              POST: 'badge-success',
              PUT: 'badge-warning text-dark',
              DELETE: 'badge-danger'
            }[item.metodo] || 'badge-secondary';

            return (
              <tr key={idx}>
                <td className="text-center">{item.id}</td>
                <td>{new Date(item.fecha).toLocaleString()}</td>
                <td>{item.usuario__username || 'Anónimo'}</td>
                <td className="text-center">
                  <span className={`badge ${metodoColor}`}>
                    {{
                      POST: 'Crear',
                      PUT: 'Editar',
                      DELETE: 'Eliminar'
                    }[item.metodo] || item.metodo}
                  </span>
                </td>
                <td>{item.descripcion || '-'}</td>
                <td className="text-center">
                  <span className={`badge ${item.exito ? 'badge-success' : 'badge-danger'}`}>
                    {item.exito ? 'Éxito' : 'Error'}
                  </span>
                </td>
              </tr>
            );
          })}
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

export default Marcas;
