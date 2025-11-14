import React from 'react';
import { Badge, Button, Card, Form, Table } from 'react-bootstrap';
import { useSeguimientoOrdenesMedicasContext } from './Context';

const statusVariant = {
  ACTIVO: 'warning',
  EN_PROCESO: 'info',
  FINALIZADA: 'success',
  OMITIDA: 'secondary'
};

const SeguimientoOrdenesMedicasList = () => {
  const {
    title,
    filteredOrders,
    STATUS_LABELS,
    STATUS,
    search,
    setSearch,
    setActiveOrder,
    activeOrderId
  } = useSeguimientoOrdenesMedicasContext();

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-white border-0">
        <div className="d-flex flex-column flex-lg-row justify-content-lg-between align-items-lg-center gap-3">
          <div>
            <h4 className="mb-1">{title}</h4>
            <small className="text-muted">
              Revisa las órdenes activas o en proceso. Selecciona una orden para
              actualizar su seguimiento.
            </small>
          </div>
          <div className="d-flex gap-2">
            <Form.Control
              type="search"
              placeholder="Buscar por paciente, médico o descripción"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{ minWidth: '260px' }}
            />
            <Button
              variant="outline-secondary"
              onClick={() => setSearch('')}
            >
              Limpiar
            </Button>
          </div>
        </div>
      </Card.Header>
      <Card.Body className="p-0">
        {filteredOrders.length === 0 ? (
          <div className="p-4 text-center text-muted">
            No hay órdenes que coincidan con la búsqueda.
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead>
                <tr>
                  <th style={{ minWidth: '120px' }}>Estado</th>
                  <th style={{ minWidth: '160px' }}>Fecha y hora</th>
                  <th style={{ minWidth: '180px' }}>Médico</th>
                  <th style={{ minWidth: '180px' }}>Paciente</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const variant = statusVariant[order.status] ?? 'secondary';
                  const isActive = activeOrderId === order.id;
                  return (
                    <tr
                      key={order.id}
                      className={isActive ? 'table-primary' : undefined}
                      onClick={() => setActiveOrder(order.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <Badge bg={variant}>{STATUS_LABELS[order.status]}</Badge>
                      </td>
                      <td>{order.createdAtLabel}</td>
                      <td>{order.doctor}</td>
                      <td>{order.patient}</td>
                      <td>{order.description}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
      <Card.Footer className="bg-light">
        <div className="d-flex flex-wrap align-items-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <Badge bg={statusVariant[STATUS.ACTIVO]}>Activo</Badge>
            <span className="text-muted small">
              Orden recién creada por el médico.
            </span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Badge bg={statusVariant[STATUS.EN_PROCESO]}>En Proceso</Badge>
            <span className="text-muted small">
              Enfermería está ejecutando la orden.
            </span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Badge bg={statusVariant[STATUS.FINALIZADA]}>Finalizada</Badge>
            <span className="text-muted small">
              Orden cumplida y registrada.
            </span>
          </div>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default SeguimientoOrdenesMedicasList;

