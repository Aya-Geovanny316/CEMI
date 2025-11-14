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
    exportarInventarioPDF,
  } = useMyContext();

  return (
    <div className="mb-4">
      <h5 className="mb-3">Reporte de Inventarios</h5>

      <div className="mb-3">
        <div className="row g-2">
          <div className="col-12 col-md-10">
            {/* <input
              type="text"
              placeholder="Buscar..."
              className="form-control shadow-sm w-100"
            /> */}
          </div>
          <div className="col-12 col-md-2">
            <Button className="w-100" onClick={exportarInventarioPDF}>
              imprimir
            </Button>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-sm mt-2">
          <thead className="table-primary text-dark fw-semibold text-center">
            <tr>
              <th>Interno</th>
              <th>Código</th>
              <th>Nombre</th>
              <th>Marca</th>
              <th>Medida</th>
              <th>Categoría</th>
              <th>Sub Categoría</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {data.map((sku, idx) => (
              <tr key={idx}>
                <td>{sku.id}</td>
                <td>{sku.codigo_sku}</td>
                <td>{sku.nombre}</td>
                <td>{sku.marca}</td>
                <td>{sku.unidad_despacho}</td>
                <td>{sku.categoria}</td>
                <td>{sku.subcategoria}</td>
                <td>{sku.estado === 'alta' ? 'ALTA' : 'BAJA'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-end mt-3">
        <Button onClick={prevPage} disabled={nullPrevPage === null} className="me-2">
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
