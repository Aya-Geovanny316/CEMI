import React, { useContext, useState } from 'react';
import { AppContext } from './Context';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FiEye, FiChevronDown, FiChevronRight, FiChevronLeft } from 'react-icons/fi';

const ListadoHabitaciones = () => {
  const {
    habitacionData,
    cargarHabitacion,
    setMostrarModal,
    setModoFormulario,
    setValue,
    nextPage,
    nullNextPage,
    prevPage,
    nullPrevPage
  } = useContext(AppContext);

  const [seccionesAbiertas, setSeccionesAbiertas] = useState({});
  const [nivelesAbiertos, setNivelesAbiertos] = useState({});

  const handleEditar = async (id) => {
    await cargarHabitacion(id);
    setModoFormulario('editar');
    setMostrarModal(true);
  };

  const toggleSeccion = (area) => {
    setSeccionesAbiertas((prev) => ({
      ...prev,
      [area]: !prev[area],
    }));
  };

  const toggleNivel = (area, nivel) => {
    setNivelesAbiertos((prev) => ({
      ...prev,
      [area]: {
        ...prev[area],
        [nivel]: !prev[area]?.[nivel],
      },
    }));
  };

  const agrupadoPorAreaYNivel = habitacionData.reduce((acc, admision) => {
    const area = admision.area || 'SIN ÁREA';
    const nivel = admision.nivel || 'SIN NIVEL';
    if (!acc[area]) acc[area] = {};
    if (!acc[area][nivel]) acc[area][nivel] = [];
    acc[area][nivel].push(admision);
    return acc;
  }, {});

  return (
    <div className="mt-4">
      <h5 className="mb-3">Listado de habitaciones</h5>

      <div className="mb-3">
        <div className="row">
          <div className="col-12">
            <input
              type="text"
              placeholder="Buscar..."
              className="form-control shadow-sm w-100"
            />
          </div>
        </div>
      </div>

      {Object.entries(agrupadoPorAreaYNivel).map(([areaKey, niveles]) => {
        const estaAreaAbierta = seccionesAbiertas[areaKey] ?? false;

        return (
          <div key={areaKey} className="mb-4">
            <div
              className="fw-bold bg-light px-2 py-1 border rounded d-flex align-items-center"
              role="button"
              onClick={() => toggleSeccion(areaKey)}
            >
              {estaAreaAbierta ? <FiChevronDown className="me-2" /> : <FiChevronRight className="me-2" />}
              <span>➤ Área =&gt; {areaKey.toUpperCase()}</span>
            </div>

            {estaAreaAbierta && (
              <>
                {Object.entries(niveles).map(([nivelKey, admisiones]) => {
                  const estaNivelAbierto = nivelesAbiertos[areaKey]?.[nivelKey] ?? false;

                  return (
                    <div key={nivelKey} className="mt-3">
                      <div
                        className="fw-semibold text-primary mb-1 d-flex align-items-center"
                        role="button"
                        onClick={() => toggleNivel(areaKey, nivelKey)}
                      >
                        {estaNivelAbierto ? <FiChevronDown className="me-2" /> : <FiChevronRight className="me-2" />}
                        Nivel: {nivelKey}
                      </div>

                      {estaNivelAbierto && (
                        <div className="table-responsive">
                          <table className="table table-bordered table-sm">
                            <thead className="table-primary text-dark fw-semibold">
                              <tr>
                                <th>Codigo</th>
                                <th>Area</th>
                                <th>Nivel</th>
                                <th>Estado</th>
                                <th>Admision</th>
                                <th>Paciente</th>
                                <th className="text-center">Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {admisiones.map((admision, idx) => (
                                <tr key={idx}>
                                  <td>{admision.codigo}</td>
                                  <td>{admision.area}</td>
                                  <td>{admision.nivel}</td>
                                  <td>{admision.estado}</td>
                                  <td>{admision.admision}</td>
                                  <td>{admision.paciente}</td>
                                  <td className="text-center">
                                    <OverlayTrigger overlay={<Tooltip>Ver admisión</Tooltip>}>
                                      <Button
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() => handleEditar(admision.id)}
                                      >
                                        <FiEye />
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
              </>
            )}
          </div>
        );
      })}

      <div className="d-flex justify-content-end">
        <Button onClick={prevPage} disabled={nullPrevPage === null}><FiChevronLeft /></Button>
        <Button onClick={nextPage} disabled={nullNextPage === null}><FiChevronRight /></Button>
      </div>
    </div>
  );
};

export default ListadoHabitaciones;