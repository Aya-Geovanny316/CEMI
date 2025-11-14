import React, { useContext, useState } from 'react';
import { AppContext } from './Context';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FiEye, FiEdit, FiChevronDown, FiChevronRight } from 'react-icons/fi';

const ListadoAdmisiones = () => {
  const {
    admisionesData,
    setMostrarModal,
    getMovimientos,
    setIdAdmision,
    setValue,
  } = useContext(AppContext);

  const [seccionesAbiertas, setSeccionesAbiertas] = useState({});


  const handleEditar = async (id) => {
    setIdAdmision(id)
    await getMovimientos(id);
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

  return (
    <div className="mt-4">
      <h5 className="mb-3">Listado de pacientes ingresados (estado de cuentas)</h5>
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
