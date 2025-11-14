import React from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Row,
  Table
} from 'react-bootstrap';
import { useControlMedicamentoContext } from './Context';

const formatDateTime = (iso) => {
  try {
    return new Intl.DateTimeFormat('es-GT', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(iso));
  } catch (error) {
    return iso ?? 'Sin fecha';
  }
};

const OrdersPanel = ({ orders, activeOrderId, setActiveOrderId }) => (
  <Card className="shadow-sm border-0 h-100">
    <Card.Header className="bg-white border-0">
      <h5 className="mb-0">Órdenes médicas activas / en proceso</h5>
      <small className="text-muted">
        Consulta las indicaciones del médico para administrar medicamentos.
      </small>
    </Card.Header>
    <Card.Body className="p-0">
      {orders.length === 0 ? (
        <div className="p-4 text-muted">
          No se encontraron órdenes activas para este paciente.
        </div>
      ) : (
        <div className="list-group list-group-flush">
          {orders.map((order) => (
            <button
              key={order.id}
              type="button"
              className={`list-group-item list-group-item-action text-start ${
                activeOrderId === order.id ? 'active' : ''
              }`}
              onClick={() => setActiveOrderId(order.id)}
            >
              <div className="d-flex justify-content-between align-items-center mb-1">
                <strong>{order.doctor}</strong>
                <Badge bg={order.status === 'EN_PROCESO' ? 'info' : 'warning'}>
                  {order.status === 'EN_PROCESO' ? 'En proceso' : 'Activa'}
                </Badge>
              </div>
              <div className="text-muted small mb-2">
                {order.license} · {formatDateTime(order.createdAt)}
              </div>
              <ol className="ps-3 mb-0 small">
                {Array.isArray(order.description)
                  ? order.description.map((line, index) => (
                      <li key={index}>{line}</li>
                    ))
                  : order.description
                  ? [order.description].map((line, index) => (
                      <li key={index}>{line}</li>
                    ))
                  : null}
              </ol>
            </button>
          ))}
        </div>
      )}
    </Card.Body>
  </Card>
);

const ControlMedicamentoList = () => {
  const {
    title,
    orders,
    activeOrderId,
    setActiveOrderId,
    records,
    timeSlots,
    statusOptions,
    frequencyOptions,
    routeOptions,
    medications,
    resolveMedicationLabel,
    addRecord,
    updateRecordField,
    updateTimelineValue,
    saveRecord,
    feedback,
    clearFeedback
  } = useControlMedicamentoContext();

  return (
    <div className="control-medicamento-module">
      <Row className="g-4">
        <Col lg={4}>
          <OrdersPanel
            orders={orders}
            activeOrderId={activeOrderId}
            setActiveOrderId={setActiveOrderId}
          />
        </Col>
        <Col lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white border-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <h4 className="mb-0">{title}</h4>
                <small className="text-muted">
                  Registra cada aplicación de medicamento según la orden médica.
                </small>
              </div>
              <Button onClick={addRecord}>Agregar nuevo registro</Button>
            </Card.Header>
            <Card.Body className="p-0">
              {feedback ? (
                <Alert
                  variant={feedback.type}
                  className="m-3"
                  dismissible
                  onClose={clearFeedback}
                >
                  {feedback.message}
                </Alert>
              ) : null}

              {records.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  Aún no hay registros de administración de medicamentos.
                </div>
              ) : (
                <div className="table-responsive">
                  <Table bordered hover className="mb-0 align-middle">
                    <thead>
                      <tr className="text-center align-middle">
                        <th style={{ minWidth: '160px' }}>Fecha</th>
                        <th style={{ minWidth: '200px' }}>Nota médica</th>
                        <th style={{ minWidth: '200px' }}>Medicamento</th>
                        <th style={{ minWidth: '110px' }}>Frecuencia</th>
                        <th style={{ minWidth: '110px' }}>Dosis</th>
                        <th style={{ minWidth: '110px' }}>Vía</th>
                        {timeSlots.map((slot) => (
                          <th key={`head-${slot}`} style={{ minWidth: '110px' }}>
                            {slot}
                          </th>
                        ))}
                        <th style={{ minWidth: '200px' }}>Comentario</th>
                        <th style={{ minWidth: '150px' }}>Usuario</th>
                        <th style={{ minWidth: '120px' }}>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record) => (
                        <tr key={record.id}>
                          <td className="small text-muted">
                            <div>{record.dateLabel}</div>
                            {record.lastSavedLabel ? (
                              <div className="text-success">
                                Guardado: {record.lastSavedLabel}
                              </div>
                            ) : (
                              <div className="text-danger">Sin guardar</div>
                            )}
                          </td>
                          <td>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              value={record.note}
                              placeholder="Nota médica asociada"
                              onChange={(event) =>
                                updateRecordField(record.id, 'note', event.target.value)
                              }
                            />
                          </td>
                          <td>
                            <Form.Control
                              as="select"
                              value={record.medicationId}
                              onChange={(event) =>
                                updateRecordField(
                                  record.id,
                                  'medicationId',
                                  event.target.value
                                )
                              }
                            >
                              {medications.map((med) => (
                                <option key={med.id} value={med.id}>
                                  {med.code} - {med.name}
                                </option>
                              ))}
                            </Form.Control>
                          </td>
                          <td>
                            <Form.Control
                              as="select"
                              value={record.frequency}
                              onChange={(event) =>
                                updateRecordField(
                                  record.id,
                                  'frequency',
                                  event.target.value
                                )
                              }
                            >
                              {frequencyOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </Form.Control>
                          </td>
                          <td>
                            <Form.Control
                              value={record.dose}
                              placeholder="Dosis"
                              onChange={(event) =>
                                updateRecordField(record.id, 'dose', event.target.value)
                              }
                            />
                          </td>
                          <td>
                            <Form.Control
                              as="select"
                              value={record.route}
                              onChange={(event) =>
                                updateRecordField(
                                  record.id,
                                  'route',
                                  event.target.value
                                )
                              }
                            >
                              {routeOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </Form.Control>
                          </td>
                          {timeSlots.map((slot) => (
                            <td key={`${record.id}-${slot}`}>
                              <Form.Control
                                as="select"
                                value={record.timeline[slot] ?? ''}
                                onChange={(event) =>
                                  updateTimelineValue(
                                    record.id,
                                    slot,
                                    event.target.value
                                  )
                                }
                              >
                                {statusOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </Form.Control>
                            </td>
                          ))}
                          <td>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              value={record.comment}
                              placeholder="Comentario u observación"
                              onChange={(event) =>
                                updateRecordField(
                                  record.id,
                                  'comment',
                                  event.target.value
                                )
                              }
                            />
                          </td>
                          <td>
                            <div className="fw-semibold">{record.userName}</div>
                          </td>
                          <td className="text-center">
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => saveRecord(record.id)}
                            >
                              Guardar
                            </Button>
                            <div className="small text-muted mt-2">
                              {resolveMedicationLabel(record.medicationId)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ControlMedicamentoList;
