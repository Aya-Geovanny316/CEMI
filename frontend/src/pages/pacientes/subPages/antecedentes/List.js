import React from 'react';
import { Badge, Button, Card, Table } from 'react-bootstrap';
import { useAntecedentesContext } from './Context';

const AntecedentesList = () => {
  const {
    title,
    records,
    activeRecordId,
    startCreate,
    startEdit,
    startViewOnly
  } = useAntecedentesContext();

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-white border-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h4 className="mb-1">{title} - Listado General</h4>
          <small className="text-muted">
            Consulta los antecedentes clínicos registrados por médicos
            residentes.
          </small>
        </div>
        <Button onClick={startCreate}>Nuevo antecedente</Button>
      </Card.Header>
      <Card.Body className="p-0">
        {records.length === 0 ? (
          <div className="p-4 text-center text-muted">
            Aún no hay antecedentes registrados.
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead>
                <tr>
                  <th style={{ minWidth: '180px' }}>Fecha y hora</th>
                  <th style={{ minWidth: '220px' }}>Médico</th>
                  <th>Antecedente</th>
                  <th style={{ minWidth: '160px' }} className="text-end">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr
                    key={record.id}
                    className={
                      activeRecordId === record.id ? 'table-primary' : undefined
                    }
                  >
                    <td>{record.createdAtLabel}</td>
                    <td>
                      <div className="d-flex flex-column">
                        <span>{record.doctorName}</span>
                        <Badge bg="light" text="dark" className="align-self-start">
                          {record.doctorLicense}
                        </Badge>
                      </div>
                    </td>
                    <td>
                      <div
                        className="antecedente-preview"
                        dangerouslySetInnerHTML={{ __html: record.content }}
                      />
                    </td>
                    <td className="text-end">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => startViewOnly(record.id)}
                      >
                        Ver
                      </Button>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="ms-2"
                        onClick={() => startEdit(record.id)}
                      >
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default AntecedentesList;
