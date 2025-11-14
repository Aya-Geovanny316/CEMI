import React, { useContext, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { AppContext } from './Context';
import { useForm } from 'react-hook-form';
import { BiSearch } from 'react-icons/bi';

const ModalAdmision = () => {
  const {
    mostrarModal,
    setMostrarModal,
    modoFormulario,
    loading,
    handleSubmit,
    onSubmit,
    register
  } = useContext(AppContext);

  const readOnly = modoFormulario === 'ver';

  const { reset } = useForm(); // ⬅️ importante

  useEffect(() => {
    if (modoFormulario === 'crear') {
      reset(); // ⬅️ limpia todos los campos
    }
  }, [modoFormulario, reset]);

  return (
    <Modal
      show={mostrarModal}
      onHide={() => setMostrarModal(false)}
      size="xl"
      centered
      scrollable
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {modoFormulario === 'ver' ? 'Ver Orden de Consulta Externa' : 'Editar Orden de Consulta Externa'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)}>
          {/* Botones superiores */}
          {modoFormulario !== 'ver' && (
            <div className="d-flex justify-content-end gap-2 mb-4">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button variant="outline-secondary" onClick={() => setMostrarModal(false)}>
                Cancelar
              </Button>
            </div>
          )}

          <Row>
            {/* FORMULARIO PRINCIPAL */}
            <Col md={9}>
              <Row className="mb-3">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Tipo *</Form.Label>
                    <Form.Control as="select" {...register('tipo')} >
                      <option value="">Seleccione</option>
                      <option value="consulta">Consulta</option>
                      <option value="emergencia">Emergencia</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Fecha *</Form.Label>
                    <Form.Control type="date" {...register('fecha')}  />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Paciente</Form.Label>
                    <div className="input-group">
                      <Form.Control type="text" {...register('paciente')} />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Médico *</Form.Label>
                    <Form.Control type="text" {...register('medico')}  />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Correo</Form.Label>
                    <Form.Control type="email" {...register('correo')}  />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label className="d-block">¿Cita?</Form.Label>
                    <Form.Check inline label="Sí" type="radio" value="si" {...register('cita')}  />
                    <Form.Check inline label="No" type="radio" value="no" {...register('cita')}  />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Fecha Cita</Form.Label>
                    <Form.Control type="date" {...register('fecha_cita')}  />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Hora</Form.Label>
                    <Form.Control type="time" {...register('hora_cita')}  />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Dirección</Form.Label>
                    <Form.Control type="text" {...register('direccion')}  />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Observaciones</Form.Label>
                    <Form.Control as="textarea" rows={2} {...register('observaciones')}  />
                  </Form.Group>
                </Col>
              </Row>
            </Col>

            {/* PANEL DE TOTALES */}
            <Col md={3}>
              <div className="bg-light border rounded p-3 h-100">
                <h6 className="text-primary fw-bold border-bottom pb-2 mb-3">Totales</h6>
                <div className="d-flex justify-content-between mb-2">
                  <span>Cantidad de Exámenes:</span>
                  <strong>0</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Cobrar al seguro:</span>
                  <strong>Q0.00</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Cobro al asegurado:</span>
                  <strong>Q0.00</strong>
                </div>
                <div className="d-flex justify-content-between border-top pt-2 mt-2">
                  <span className="fw-bold">Total de la Orden:</span>
                  <strong className="text-primary">Q0.00</strong>
                </div>
              </div>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalAdmision;