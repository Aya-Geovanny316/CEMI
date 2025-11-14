import React from 'react';
import { OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
import { FiEye, FiEdit, FiChevronLeft, FiChevronRight, FiTrash2 } from 'react-icons/fi';
import { useMyContext } from './Context';

const Bodegas = () => {
  const {
    data,
    abrirModalCrear,
    abrirModalEditar,
    abrirModalVer,
    prevPage,
    nextPage,
    nullPrevPage,
    nullNextPage,
    eliminarProveedor
  } = useMyContext();

  const handleVer = (prov) => abrirModalVer(prov);
  const handleEditar = (prov) => abrirModalEditar(prov);

  return (
    <div className="mb-4">
      <h5 className="mb-3">Listado de Seguros</h5>

      <div className="mb-3">
        <div className="row g-2">
          <div className="col-12 col-md-10">
            <input
              type="text"
              placeholder="Buscar..."
              className="form-control shadow-sm w-100"
            />
          </div>
          <div className="col-12 col-md-2">
            <Button className="w-100" onClick={abrirModalCrear}>
              Nuevo seguro
            </Button>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-sm mt-2">
          <thead className="table-primary text-dark fw-semibold">
            <tr>
              <th className="text-center">ID</th>
              <th className="text-center">Nombre Bodega</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((prov, idx) => (
              <tr key={idx}>
                <td>{prov.id}</td>
                <td>{prov.nombre}</td>
                <td className="text-center">
                  <OverlayTrigger overlay={<Tooltip>Ver Bodega</Tooltip>}>
                    <Button className="btn btn-outline-secondary btn-sm me-1" onClick={() => handleVer(prov)}>
                      <FiEye />
                    </Button>
                  </OverlayTrigger>
                  <OverlayTrigger overlay={<Tooltip>Editar Bodega</Tooltip>}>
                    <Button className="btn btn-outline-secondary btn-sm me-1" onClick={() => handleEditar(prov)}>
                      <FiEdit />
                    </Button>
                  </OverlayTrigger>
                  <OverlayTrigger overlay={<Tooltip>Eliminar Bodega</Tooltip>}>
                    <Button className="btn btn-outline-secondary btn-sm" onClick={() => eliminarProveedor(prov.id)}>
                      <FiTrash2 />
                    </Button>
                  </OverlayTrigger>
                </td>
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

export default Bodegas;
