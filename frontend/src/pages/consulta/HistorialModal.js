import React, { useContext } from 'react';
import { Badge, Modal, Spinner, Table } from 'react-bootstrap';

import { ConsultaContext } from './context';

const HistorialModal = () => {
  const {
    showHistorial,
    setShowHistorial,
    historial,
    loadingHistorial,
    selectedPatient,
    descargarReciboHistorial,
    eliminarConsulta,
  } = useContext(ConsultaContext);

  return (
    <Modal
      show={showHistorial}
      onHide={() => setShowHistorial(false)}
      size="lg"
      centered
      scrollable
    >
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2">
          Historial de consultas
          {selectedPatient?.nombre_completo && (
            <Badge bg="secondary">{selectedPatient.nombre_completo}</Badge>
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loadingHistorial ? (
          <div className="d-flex align-items-center gap-2">
            <Spinner animation="border" size="sm" /> Cargando...
          </div>
        ) : historial.length === 0 ? (
          <div className="text-muted">No hay consultas registradas para este paciente.</div>
        ) : (
          <div className="table-responsive">
            <Table striped hover size="sm" className="mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Motivo</th>
                  <th>Sintomas</th>
                  <th>Diagnostico</th>
                  <th>Medico</th>
                  <th>Monto</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.fecha ? new Date(c.fecha).toLocaleString() : 'N/D'}</td>
                    <td>{c.motivo || 'N/D'}</td>
                    <td style={{ minWidth: '160px', whiteSpace: 'pre-wrap' }}>{c.sintomas || 'N/D'}</td>
                    <td style={{ minWidth: '160px', whiteSpace: 'pre-wrap' }}>{c.diagnostico || 'N/D'}</td>
                    <td>{c.medico || 'N/D'}</td>
                    <td>Q {Number(c.monto || 0).toFixed(2)}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => descargarReciboHistorial(c.id)}
                        >
                          PDF
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => eliminarConsulta(c.id)}
                        >
                          Borrar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default HistorialModal;
