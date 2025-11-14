import React from 'react';
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useDietasContext } from './Context';

const DietasForm = () => {
  const {
    mode,
    mealTimes,
    mealWindows,
    dietTypes,
    formState,
    handleFormChange,
    saveDiet,
    enterListMode,
    feedback,
    setFeedback
  } = useDietasContext();

  const isReadOnly = mode === 'VIEW';

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-white border-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h4 className="mb-1">
            {mode === 'CREATE'
              ? 'Nuevo registro de dieta'
              : mode === 'EDIT'
              ? 'Editar registro de dieta'
              : 'Detalle de dieta'}
          </h4>
          <small className="text-muted">
            Registra la dieta correspondiente para el paciente según la indicación médica.
          </small>
        </div>
        <div className="text-end small text-muted">
          {formState.mealTime ? (
            <div>
              <strong>Horario límite:</strong> {mealWindows[formState.mealTime] ?? '—'}
            </div>
          ) : null}
        </div>
      </Card.Header>
      <Card.Body>
        {feedback ? (
          <Alert
            variant={feedback.type}
            dismissible
            onClose={() => setFeedback(null)}
          >
            {feedback.message}
          </Alert>
        ) : null}

        <Row className="g-4">
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Fecha</Form.Label>
              <Form.Control
                type="date"
                value={formState.date}
                onChange={(event) => handleFormChange('date', event.target.value)}
                disabled={isReadOnly}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Tiempo de comida</Form.Label>
              <Form.Control
                as="select"
                value={formState.mealTime}
                onChange={(event) => handleFormChange('mealTime', event.target.value)}
                disabled={isReadOnly}
              >
                {mealTimes.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </Form.Control>
              <div className="text-muted small mt-1">
                Horario sugerido: {mealWindows[formState.mealTime] ?? '—'}
              </div>
            </Form.Group>
          </Col>
        </Row>

        <Row className="g-4">
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Tipo de dieta</Form.Label>
              <Form.Control
                as="select"
                value={formState.dietType}
                onChange={(event) => handleFormChange('dietType', event.target.value)}
                disabled={isReadOnly}
              >
                {dietTypes.map((diet) => (
                  <option key={diet} value={diet}>
                    {diet}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Responsable</Form.Label>
              <Form.Control value="Usuario Enfermería" disabled />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-4">
          <Form.Label>Observaciones</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={formState.observations}
            onChange={(event) => handleFormChange('observations', event.target.value)}
            disabled={isReadOnly}
            placeholder="Indica detalles específicos para el área de nutrición/cocina"
          />
        </Form.Group>

        <div className="d-flex justify-content-end gap-2">
          <Button variant="outline-secondary" onClick={enterListMode}>
            Volver
          </Button>
          {!isReadOnly ? (
            <Button variant="primary" onClick={saveDiet}>
              Guardar
            </Button>
          ) : null}
        </div>
      </Card.Body>
    </Card>
  );
};

export default DietasForm;
