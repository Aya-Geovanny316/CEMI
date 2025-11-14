import React, { useMemo } from 'react';
import { Alert, Badge, Button, Card } from 'react-bootstrap';
import { useSeguimientoOrdenesMedicasContext } from './Context';

const statusTimeline = [
  { key: 'ACTIVO', label: 'Activo' },
  { key: 'EN_PROCESO', label: 'En proceso' },
  { key: 'FINALIZADA', label: 'Finalizada' }
];

const SeguimientoOrdenesMedicasDetail = () => {
  const {
    orders,
    activeOrderId,
    STATUS,
    STATUS_LABELS,
    updateOrderStatus
  } = useSeguimientoOrdenesMedicasContext();

  const activeOrder = useMemo(
    () => orders.find((order) => order.id === activeOrderId) ?? orders[0] ?? null,
    [orders, activeOrderId]
  );

  if (!activeOrder) {
    return (
      <Card className="shadow-sm border-0">
        <Card.Body>
          <Alert variant="info" className="mb-0">
            Selecciona una orden del listado para ver su detalle.
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  const availableStatuses = activeOrder.allowedTransitions ?? [];
  const currentStatusLabel = STATUS_LABELS[activeOrder.status];
  const currentVariant =
    activeOrder.status === STATUS.ACTIVO
      ? 'warning'
      : activeOrder.status === STATUS.EN_PROCESO
      ? 'info'
      : activeOrder.status === STATUS.FINALIZADA
      ? 'success'
      : 'secondary';

  const isTransitionDisabled = (status) => {
    if (status === STATUS.OMITIDA) {
      return !activeOrder.canOmit;
    }
    return !availableStatuses.includes(status);
  };

  const renderTimeline = () =>
    statusTimeline.map((step) => {
      const isReached =
        step.key === STATUS.ACTIVO ||
        step.key === activeOrder.status ||
        (step.key === STATUS.FINALIZADA &&
          activeOrder.status === STATUS.FINALIZADA);

      return (
        <div className="d-flex align-items-center gap-2" key={step.key}>
          <div
            className={`timeline-dot ${isReached ? 'active' : ''}`}
            aria-hidden="true"
          />
          <span className={`small ${isReached ? 'fw-semibold' : 'text-muted'}`}>
            {step.label}
          </span>
          {step.key !== 'FINALIZADA' ? (
            <div className="timeline-connector" />
          ) : null}
        </div>
      );
    });

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-white border-0">
        <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
          <div>
            <h4 className="mb-2">Detalle de Orden Médica</h4>
            <div className="d-flex align-items-center gap-2">
              <Badge bg={currentVariant}>{currentStatusLabel}</Badge>
              <span className="text-muted small">
                Última actualización:{' '}
                {activeOrder.lastUpdatedAtLabel ?? 'Sin registrar'}
              </span>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            {renderTimeline()}
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        <dl className="row mb-0">
          <dt className="col-sm-3 text-muted">Médico responsable</dt>
          <dd className="col-sm-9">{activeOrder.doctor}</dd>

          <dt className="col-sm-3 text-muted">Paciente</dt>
          <dd className="col-sm-9">{activeOrder.patient}</dd>

          <dt className="col-sm-3 text-muted">Fecha de creación</dt>
          <dd className="col-sm-9">{activeOrder.createdAtLabel}</dd>

          <dt className="col-sm-3 text-muted">Descripción</dt>
          <dd className="col-sm-9">{activeOrder.description}</dd>
        </dl>

        <Alert variant="light" className="border mt-4">
          <strong>Nota:</strong> Enfermería solo puede actualizar el estado de la
          orden. El contenido debe permanecer tal como lo definió el médico.
        </Alert>

        <div className="d-flex flex-wrap gap-2 mt-3">
          <Button
            variant="outline-primary"
            disabled={isTransitionDisabled(STATUS.EN_PROCESO)}
            onClick={() => updateOrderStatus(activeOrder.id, STATUS.EN_PROCESO)}
          >
            Marcar en proceso
          </Button>
          <Button
            variant="success"
            disabled={isTransitionDisabled(STATUS.FINALIZADA)}
            onClick={() => updateOrderStatus(activeOrder.id, STATUS.FINALIZADA)}
          >
            Marcar finalizada
          </Button>
          <Button
            variant="outline-danger"
            disabled={isTransitionDisabled(STATUS.OMITIDA)}
            onClick={() => updateOrderStatus(activeOrder.id, STATUS.OMITIDA)}
          >
            Omitir orden (solo médico residente)
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default SeguimientoOrdenesMedicasDetail;

