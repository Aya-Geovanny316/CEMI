import React from 'react';
import { Badge, Button, Card, Col, Row, Table } from 'react-bootstrap';
import { useDietasContext } from './Context';

const OrdersPanel = ({ orders }) => (
  <Card className="shadow-sm border-0 h-100">
    <Card.Header className="bg-white border-0">
      <h5 className="mb-0">Órdenes médicas vigentes</h5>
      <small className="text-muted">
        Indicaciones del médico relacionadas con la alimentación.
      </small>
    </Card.Header>
    <Card.Body className="p-0">
      {orders.length === 0 ? (
        <div className="p-4 text-muted">No hay órdenes médicas registradas.</div>
      ) : (
        <div className="list-group list-group-flush">
          {orders.map((order) => (
            <div key={order.id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <strong>{order.doctor}</strong>
                <Badge bg={order.status === 'EN_PROCESO' ? 'info' : 'warning'}>
                  {order.status === 'EN_PROCESO' ? 'En proceso' : 'Activa'}
                </Badge>
              </div>
              <div className="text-muted small mb-2">
                {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Sin fecha'}
              </div>
              <ul className="ps-3 mb-0 small">
                {order.description.map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Card.Body>
  </Card>
);

const DietasList = () => {
  const { title, orders, dietRecords, mealWindows, startCreate, startEdit, startView } =
    useDietasContext();

  return (
    <div className="dietas-module">
      <Row className="g-4">
        <Col lg={4}>
          <OrdersPanel orders={orders} />
        </Col>
        <Col lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white border-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <h4 className="mb-1">{title} - Paciente</h4>
                <small className="text-muted">
                  Registra las dietas según la indicación médica y horarios disponibles.
                </small>
              </div>
              <Button onClick={startCreate}>Agregar nueva dieta</Button>
            </Card.Header>
            <Card.Body className="p-0">
              {dietRecords.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  No hay dietas registradas para este paciente.
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0 align-middle">
                    <thead>
                      <tr>
                        <th style={{ minWidth: '140px' }}>Fecha</th>
                        <th style={{ minWidth: '160px' }}>Tiempo de comida</th>
                        <th style={{ minWidth: '160px' }}>Dieta</th>
                        <th style={{ minWidth: '220px' }}>Observaciones</th>
                        <th style={{ minWidth: '160px' }}>Responsable</th>
                        <th style={{ minWidth: '160px' }}>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dietRecords.map((diet) => (
                        <tr key={diet.id}>
                          <td>
                            <div className="fw-semibold">{diet.date}</div>
                            <div className="text-muted small">{diet.createdAtLabel}</div>
                          </td>
                          <td>
                            <div className="fw-semibold">{diet.mealTime}</div>
                            <div className="text-muted small">
                              Horario: {diet.mealTime ? mealWindows[diet.mealTime] ?? '—' : '—'}
                            </div>
                          </td>
                          <td>{diet.dietType}</td>
                          <td>{diet.observations || '—'}</td>
                          <td>{diet.responsible}</td>
                          <td>
                            <div className="d-flex gap-2 flex-wrap">
                              <Button
                                size="sm"
                                variant="outline-secondary"
                                onClick={() => startView(diet.id)}
                              >
                                Ver
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => startEdit(diet.id)}
                              >
                                Editar
                              </Button>
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

export default DietasList;
