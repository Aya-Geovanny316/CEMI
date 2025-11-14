import React, { useContext, useState } from 'react';
import { AppContext } from './Context';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FiEye, FiEdit, FiChevronDown, FiChevronRight } from 'react-icons/fi';

const ListadoAdmisiones = () => {
  const {
    admisionesData,
    cargarAdmision,
    setMostrarModal,
    setModoFormulario,
    setValue,
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

  const toggleSeccion = (estado) => {
    setSeccionesAbiertas((prev) => ({
      ...prev,
      [estado]: !prev[estado],
    }));
  };

  const agrupadoPorEstado = admisionesData.reduce((acc, admision) => {
    const estado = admision.estado || 'SIN ESTADO';
    if (!acc[estado]) acc[estado] = [];
    acc[estado].push(admision);
    return acc;
  }, {});

  return (
    <div className="mt-4">
      <h5 className="mb-3">Listado de pacientes ingresados</h5>

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

      {Object.entries(agrupadoPorEstado).map(([estado, admisiones]) => {
        const estadoKey = estado || 'SIN ESTADO';
        const estaAbierta = seccionesAbiertas[estadoKey] ?? true;

        return (
          <div key={estadoKey} className="mb-4">
            <div
              className="fw-bold bg-light px-2 py-1 border rounded d-flex align-items-center"
              role="button"
              onClick={() => toggleSeccion(estadoKey)}
            >
              {estaAbierta ? <FiChevronDown className="me-2" /> : <FiChevronRight className="me-2" />}
              <span>➤ Estado =&gt; {estadoKey.toUpperCase()}</span>
            </div>

            {estaAbierta && (
              <div className="table-responsive mt-2">
                <table className="table table-bordered table-sm">
                  <thead className="table-primary text-dark fw-semibold">
                    <tr>
                      <th>Admisión</th>
                      <th>Fecha</th>
                      <th>Paciente</th>
                      <th>Identificación</th>
                      <th>Género</th>
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
                        <td>{admision.genero}</td>
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
    </div>
  );
};

export default ListadoAdmisiones;
