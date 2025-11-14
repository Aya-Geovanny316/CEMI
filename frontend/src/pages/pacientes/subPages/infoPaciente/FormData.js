import React from 'react';
import { Card, Row, Col, Form } from 'react-bootstrap';

const FormData = ({ data }) => {
  // Example shape:
  // data = {
  //   paciente: {
  //     fechaNacimiento: "1990-05-12",
  //     religion: "Católica",
  //     direccion: "Zona 10, Ciudad de Guatemala",
  //     telefono: "5555-1234",
  //     tipoIdentificacion: "DPI",
  //     numeroIdentificacion: "1234567890101"
  //   },
  //   acompanante: {
  //     parentesco: "Hermano",
  //     nombre: "Luis Pérez",
  //     correo: "luis@example.com",
  //     telefono: "5555-9876"
  //   }
  // }

  return (
    <Card className="p-4 shadow-sm border-0">
      <h4 className="mb-4 text-primary fw-bold">
        Información Detallada del Paciente
      </h4>

      {/* PACIENTE */}
      <h5 className="text-secondary mb-3">Paciente</h5>
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Fecha de Nacimiento</Form.Label>
            <Form.Control
              type="text"
              readOnly
              value={data?.paciente?.fechaNacimiento || ''}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Religión</Form.Label>
            <Form.Control
              type="text"
              readOnly
              value={data?.paciente?.religion || ''}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              readOnly
              value={data?.paciente?.telefono || ''}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Dirección</Form.Label>
            <Form.Control
              type="text"
              readOnly
              value={data?.paciente?.direccion || ''}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Tipo de Identificación</Form.Label>
            <Form.Control
              type="text"
              readOnly
              value={data?.paciente?.tipoIdentificacion || ''}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Número de Identificación</Form.Label>
            <Form.Control
              type="text"
              readOnly
              value={data?.paciente?.numeroIdentificacion || ''}
            />
          </Form.Group>
        </Col>
      </Row>

      <hr className="my-4" />

      {/* ACOMPAÑANTE */}
      <h5 className="text-secondary mb-3">Acompañante</h5>
      <Row className="mb-3">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Parentesco</Form.Label>
            <Form.Control
              type="text"
              readOnly
              value={data?.acompanante?.parentesco || ''}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              readOnly
              value={data?.acompanante?.nombre || ''}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Correo</Form.Label>
            <Form.Control
              type="text"
              readOnly
              value={data?.acompanante?.correo || ''}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              readOnly
              value={data?.acompanante?.telefono || ''}
            />
          </Form.Group>
        </Col>
      </Row>
    </Card>
  );
};

export default FormData;
