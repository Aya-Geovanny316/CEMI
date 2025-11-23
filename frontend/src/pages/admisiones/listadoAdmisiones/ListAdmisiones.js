import React, { useContext, useState } from 'react';
import { AppContext } from './Context';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FiEye, FiEdit, FiChevronDown, FiChevronRight, FiChevronLeft } from 'react-icons/fi';

const ListadoAdmisiones = () => {
  const {
    admisionesData,
    cargarAdmision,
    setMostrarModal,
    setModoFormulario,
    setValue,
    nullNextPage,
    nullPrevPage,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    totalCount,
    pageSize,
    page
  } = useContext(AppContext);

  const [seccionesAbiertas, setSeccionesAbiertas] = useState({});

  const handleVer = async (id) => {
    await cargarAdmision(id);
    setModoFormulario('ver');
    setMostrarModal(true);
  };

  const handleEditar = async (id) => {
    await cargarAdmision(id);
    setModoFormulario('editar');
    setMostrarModal(true);
  };

  const toggleSeccion = (area) => {
    setSeccionesAbiertas((prev) => ({
      ...prev,
      [area]: !prev[area],
    }));
  };

  const agrupadoPorArea = admisionesData.reduce((acc, admision) => {
    const area = admision.area || 'SIN ÁREA';
    if (!acc[area]) acc[area] = [];
    acc[area].push(admision);
    return acc;
  }, {});

  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / (pageSize || 25)));

  return (
    <div className="mt-4">
      <h5 className="mb-3">Gestión de Registros</h5>
      <div className="mb-3 w-100 w-md-25">
        <input type="text" placeholder="Buscar..." className="form-control shadow-sm" />
      </div>

      {Object.entries(agrupadoPorArea).map(([area, admisiones]) => {
        const areaKey = area || 'SIN ÁREA';
        const estaAbierta = seccionesAbiertas[areaKey] ?? true;

        return (
          <div key={areaKey} className="mb-4">
            <div
              className="fw-bold bg-light px-2 py-1 border rounded d-flex align-items-center"
              role="button"
              onClick={() => toggleSeccion(areaKey)}
            >
              {estaAbierta ? <FiChevronDown className="me-2" /> : <FiChevronRight className="me-2" />}
              <span>➤ Área =&gt; {areaKey.toUpperCase()}</span>
            </div>

            {estaAbierta && (
              <div className="table-responsive mt-2">
                <table className="table table-bordered table-sm align-middle small">
                  <thead className="table-primary text-dark fw-semibold">
                    <tr>
                      <th>Admisión</th>
                      <th>Fecha</th>
                      <th>Paciente</th>
                      <th>Identificación</th>
                      <th>Aseguradora</th>
                      <th>Área</th>
                      <th>Cama</th>
                      <th>Médico</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admisiones.map((admision, idx) => (
                      <tr key={idx}>
                        <td>{admision.id_admision}</td>
                        <td>{admision.fecha_admision}</td>
                        <td>{admision.paciente}</td>
                        <td>{admision.identificacion}</td>
                        <td>{admision.aseguradora}</td>
                        <td>{admision.area}</td>
                        <td>{admision.habitacion}</td>
                        <td>{admision.medico_tratante || '-'}</td>
                        <td className="text-center">
                          <OverlayTrigger overlay={<Tooltip>Ver admisión</Tooltip>}>
                            <Button className="btn btn-outline-secondary btn-sm me-1" onClick={() => handleVer(admision.id_admision)}>
                              <FiEye />
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger overlay={<Tooltip>Editar admisión</Tooltip>}>
                            <Button className="btn btn-outline-secondary btn-sm" onClick={() => handleEditar(admision.id_admision)}>
                              <FiEdit />
                            </Button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="small text-muted">
          Total registros: {totalCount || admisionesData.length} | Página {page} de {totalPages}
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" onClick={goToFirstPage} disabled={page <= 1}>
            &laquo; Primero
          </Button>
          <Button size="sm" onClick={prevPage} disabled={nullPrevPage === null}>
            <FiChevronLeft />
          </Button>
          <Button size="sm" onClick={nextPage} disabled={nullNextPage === null}>
            <FiChevronRight />
          </Button>
          <Button variant="outline-secondary" size="sm" onClick={goToLastPage} disabled={page >= totalPages}>
            Último &raquo;
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ListadoAdmisiones;
