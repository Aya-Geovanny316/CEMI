import React, { useContext, useState } from 'react';
import { AppContext } from './Context';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FiEye, FiEdit, FiTrash2, FiChevronDown, FiChevronRight, FiChevronLeft } from 'react-icons/fi';

const ListadoHabitaciones = () => {
  const {
    habitacionData,
    cargarHabitacion,
    setMostrarModal,
    setModoFormulario,
    nextPage,
    nullNextPage,
    prevPage,
    nullPrevPage,
    eliminarHabitacion,
    limpiarFormularioHabitacion
  } = useContext(AppContext);

  const [seccionesAbiertas, setSeccionesAbiertas] = useState({});
  const [nivelesAbiertos, setNivelesAbiertos] = useState({});

  const handleVer = async (id) => {
    await cargarHabitacion(id);
    setModoFormulario('ver');
    setMostrarModal(true);
  };

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

  const agrupadoPorAreaYNivel = habitacionData.reduce((acc, habitacion) => {
    const area = habitacion.area || 'SIN ÁREA';
    const nivel = habitacion.nivel || 'SIN NIVEL';
    if (!acc[area]) acc[area] = {};
    if (!acc[area][nivel]) acc[area][nivel] = [];
    acc[area][nivel].push(habitacion);
    return acc;
  }, {});

  return (
    <div className="mt-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
        <h5 className="mb-0">Listado de habitaciones</h5>
        <Button
          variant="dark"
          size="sm"
          onClick={() => {
            setModoFormulario('crear');
            setMostrarModal(true);
            limpiarFormularioHabitacion();
          }}
        >
          + Nueva habitación
        </Button>
      </div>

      <div className="mb-3" style={{ maxWidth: '300px' }}>
        <input type="text" placeholder="Buscar..." className="form-control shadow-sm" />
      </div>

      {Object.entries(agrupadoPorAreaYNivel).map(([areaKey, niveles]) => {
        const estaAreaAbierta = seccionesAbiertas[areaKey] ?? true;

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
                {Object.entries(niveles).map(([nivelKey, habitaciones]) => {
                  const estaNivelAbierto = nivelesAbiertos[areaKey]?.[nivelKey] ?? true;

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
                                <th>Código</th>
                                <th>Área</th>
                                <th>Nivel</th>
                                <th>Estado</th>
                                <th>Admisión</th>
                                <th>Paciente</th>
                                <th className="text-center">Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {habitaciones.map((hab, idx) => (
                                <tr key={idx}>
                                  <td>{hab.codigo}</td>
                                  <td>{hab.area}</td>
                                  <td>{hab.nivel}</td>
                                  <td>{hab.estado}</td>
                                  <td>{hab.admision}</td>
                                  <td>{hab.paciente}</td>
                                  <td className="text-center">
                                    <OverlayTrigger overlay={<Tooltip>Ver habitación</Tooltip>}>
                                      <Button
                                        className="btn btn-outline-secondary btn-sm me-1"
                                        onClick={() => handleVer(hab.id)}
                                      >
                                        <FiEye />
                                      </Button>
                                    </OverlayTrigger>
                                    <OverlayTrigger overlay={<Tooltip>Editar habitación</Tooltip>}>
                                      <Button
                                        className="btn btn-outline-secondary btn-sm me-1"
                                        onClick={() => handleEditar(hab.id)}
                                      >
                                        <FiEdit />
                                      </Button>
                                    </OverlayTrigger>
                                    <OverlayTrigger overlay={<Tooltip>Eliminar habitación</Tooltip>}>
                                      <Button
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => eliminarHabitacion(hab.id)}
                                      >
                                        <FiTrash2 />
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
      <div className="d-flex justify-content-end mt-3">
        <Button onClick={prevPage} disabled={nullPrevPage === null}><FiChevronLeft /></Button>
        <Button onClick={nextPage} disabled={nullNextPage === null}><FiChevronRight /></Button>
      </div>
    </div>
  );
};

export default ListadoHabitaciones;
