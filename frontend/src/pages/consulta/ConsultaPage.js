import React, { useContext } from 'react';
import { Badge, Card, Col, Container, Row } from 'react-bootstrap';

import { ConsultaContext } from './context';
import ConsultaForm from './ConsultaForm';
import PacientesTable from './PacientesTable';
import HistorialModal from './HistorialModal';

const ConsultaPage = () => {
  const { selectedPatient } = useContext(ConsultaContext);

  return (
    <Container fluid className="mt-2">
      <Row className="mb-3">
        <Col>
          <h3 className="mb-1">Modulo de consulta</h3>
          <p className="text-muted mb-0">
            Selecciona un paciente, captura los sintomas y genera el recibo en PDF al guardar.
          </p>
        </Col>
        <Col className="text-end d-flex align-items-start justify-content-end gap-2">
          {selectedPatient && (
            <Badge bg="primary" pill>
              Paciente seleccionado
            </Badge>
          )}
        </Col>
      </Row>

      <Row>
        <Col lg={7} className="mb-3">
          <PacientesTable />
        </Col>
        <Col lg={5}>
          <Card>
            <Card.Body>
              <ConsultaForm />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <HistorialModal />
    </Container>
  );
};

export default ConsultaPage;
