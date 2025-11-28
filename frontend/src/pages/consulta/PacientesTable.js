import React, { useContext } from 'react';
import {
  Button,
  Card,
  Form,
  Spinner,
  Table,
} from 'react-bootstrap';
import { FiRefreshCw, FiUser } from 'react-icons/fi';

import { ConsultaContext } from './context';

const PacientesTable = () => {
  const {
    patientsLimited,
    patients,
    loadingPatients,
    refreshPatients,
    search,
    setSearch,
    selectPatient,
    selectedPatient,
    cargarHistorial,
    setSelectedDepartamento,
    reset,
  } = useContext(ConsultaContext);

  return (
    <Card className="h-100">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <FiUser />
          <div>
            <div className="fw-bold">Pacientes</div>
            <small className="text-muted">Haz clic en una fila para seleccionarlo</small>
          </div>
        </div>
        <div className="d-flex gap-2">
          <Form.Control
            size="sm"
            type="text"
            placeholder="Buscar nombre o DPI"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            variant="outline-primary"
            size="sm"
            onClick={refreshPatients}
            disabled={loadingPatients}
          >
            {loadingPatients ? <Spinner animation="border" size="sm" /> : <FiRefreshCw />}
          </Button>
        </div>
      </Card.Header>

      <Card.Body className="p-0">
        <div className="table-responsive">
          <Table hover size="sm" className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Paciente</th>
                <th>Identificacion</th>
                <th>Telefono</th>
                <th>Genero</th>
                <th>Historial</th>
              </tr>
            </thead>
            <tbody>
              {patientsLimited.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-3">
                    {loadingPatients ? 'Cargando pacientes...' : 'No hay pacientes disponibles.'}
                  </td>
                </tr>
              )}
              {patientsLimited.map((patient) => {
                const isActive = selectedPatient?.id === patient.id;
                return (
                  <tr
                    key={patient.id}
                    role="button"
                    className={isActive ? 'table-primary' : ''}
                  >
                    <td className="fw-semibold">
                      <button
                        type="button"
                        className="btn btn-link p-0 text-start fw-semibold"
                        onClick={() => {
                          selectPatient(patient);
                          reset({ fecha: '', edad: '', mc: '', hea: '', sv_pa: '', sv_fc: '', sv_fr: '', sv_sat: '', sv_peso: '', examen_fisico: '', estudios: '', impresion_clinica: '', tratamiento: '', plan: '', medico: '', monto: '', metodoPago: '' });
                          setSelectedDepartamento('');
                        }}
                      >
                        {patient.nombre_completo || 'Sin nombre'}
                      </button>
                    </td>
                    <td>{patient.numero_identificacion || 'N/D'}</td>
                    <td>{patient.telefono || patient.telefono1 || 'N/D'}</td>
                    <td>{patient.genero || 'N/D'}</td>
                    <td>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => cargarHistorial(patient)}
                      >
                        Ver
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </Card.Body>
      {patients.length > patientsLimited.length && (
        <div className="px-3 py-2 text-muted" style={{ fontSize: '12px' }}>
          Mostrando 25 de {patients.length} pacientes. Refina la bБsqueda para ver otros registros.
        </div>
      )}
    </Card>
  );
};

export default PacientesTable;
