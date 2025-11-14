import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  Row
} from 'react-bootstrap';
import { useSignosVitalesEmergenciaContext } from './Context';

const buildInitialState = (fields, getInitialFormState) =>
  typeof getInitialFormState === 'function'
    ? getInitialFormState()
    : fields.reduce((acc, field) => {
        acc[field.id] = { value: '', comment: '' };
        return acc;
      }, {});

const SignosVitalesEmergenciaForm = () => {
  const {
    title,
    fields,
    recordVitalSigns,
    getInitialFormState,
    currentUserName
  } = useSignosVitalesEmergenciaContext();
  const [formState, setFormState] = useState(() =>
    buildInitialState(fields, getInitialFormState)
  );
  const [status, setStatus] = useState(null);

  useEffect(() => {
    setFormState(buildInitialState(fields, getInitialFormState));
  }, [fields, getInitialFormState]);

  useEffect(() => {
    if (!status?.type) return undefined;
    const timer = setTimeout(() => setStatus(null), 3500);
    return () => clearTimeout(timer);
  }, [status]);

  const fieldGroups = useMemo(() => {
    const chunk = [];
    for (let i = 0; i < fields.length; i += 2) {
      chunk.push(fields.slice(i, i + 2));
    }
    return chunk;
  }, [fields]);

  const handleValueChange = (fieldId, key) => (event) => {
    const { value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        [key]: value
      }
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const response = recordVitalSigns(formState);

    if (response?.success) {
      setStatus({ type: 'success', message: 'Signos registrados correctamente.' });
      setFormState(buildInitialState(fields, getInitialFormState));
    } else {
      setStatus({
        type: 'danger',
        message: 'Ingresa al menos un signo antes de guardar.'
      });
    }
  };

  return (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Header className="bg-white border-0">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <h4 className="mb-1">{title}</h4>
            <small className="text-muted">
              Registra los signos vitales del ingreso a emergencia. Puedes
              agregar comentarios puntuales para cada medición.
            </small>
          </div>
          <div className="text-end">
            <span className="d-block text-muted small">Será registrado por:</span>
            <strong>{currentUserName}</strong>
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        {status?.type && (
          <Alert
            variant={status.type}
            onClose={() => setStatus(null)}
            dismissible
            className="mb-4"
          >
            {status.message}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          {fieldGroups.map((group, index) => (
            <Row className="g-4 mb-1" key={`group-${index}`}>
              {group.map((field) => {
                const fieldState = formState[field.id] || { value: '', comment: '' };
                return (
                  <Col md={6} key={field.id}>
                    <Card className="h-100 border-0 shadow-sm">
                      <Card.Body>
                        <Form.Label className="fw-semibold d-flex justify-content-between align-items-center">
                          <span>{field.label}</span>
                          {field.unit ? (
                            <span className="badge bg-light text-dark">
                              {field.unit}
                            </span>
                          ) : null}
                        </Form.Label>
                        <InputGroup className="mb-3">
                          <Form.Control
                            type={field.type || 'text'}
                            step={field.step || undefined}
                            placeholder={field.placeholder}
                            value={fieldState.value}
                            onChange={handleValueChange(field.id, 'value')}
                          />
                          {field.unit ? (
                            <InputGroup.Text>{field.unit}</InputGroup.Text>
                          ) : null}
                        </InputGroup>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          placeholder="Comentario opcional"
                          value={fieldState.comment}
                          onChange={handleValueChange(field.id, 'comment')}
                        />
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          ))}

          <div className="d-flex justify-content-end mt-4 gap-2 flex-wrap">
            <Button
              variant="outline-secondary"
              onClick={() =>
                setFormState(buildInitialState(fields, getInitialFormState))
              }
            >
              Limpiar formulario
            </Button>
            <Button type="submit" variant="primary">
              Guardar signos
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default SignosVitalesEmergenciaForm;
