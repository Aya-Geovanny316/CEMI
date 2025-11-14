import React from 'react';
import { Badge, Button, Card, Table } from 'react-bootstrap';
import { useNotasEnfermeriaContext } from './Context';

const NotasEnfermeriaList = () => {
  const {
    title,
    notes,
    statusLabels,
    startCreate,
    startView,
    startEdit
  } = useNotasEnfermeriaContext();

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-white border-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h4 className="mb-1">{title}</h4>
          <small className="text-muted">
            Registrar y consultar todas las notas realizadas por enfermería al paciente.
          </small>
        </div>
        <Button onClick={startCreate}>Nueva Nota</Button>
      </Card.Header>
      <Card.Body className="p-0">
        {notes.length === 0 ? (
          <div className="p-4 text-center text-muted">
            No hay notas para este paciente.
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead>
                <tr>
                  <th style={{ minWidth: '180px' }}>Inicio</th>
                  <th style={{ minWidth: '120px' }}>Estatus</th>
                  <th style={{ minWidth: '240px' }}>Nota</th>
                  <th style={{ minWidth: '220px' }}>Modifica / Cierra</th>
                  <th style={{ minWidth: '160px' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {notes.map((note) => (
                  <tr key={note.id}>
                    <td>
                      <div className="fw-semibold">{note.author}</div>
                      <div className="text-muted small">{note.createdAtLabel}</div>
                    </td>
                    <td>
                      <Badge
                        bg={note.status === 'CERRADA' ? 'secondary' : 'info'}
                      >
                        {statusLabels[note.status] ?? note.status}
                      </Badge>
                    </td>
                    <td>
                      <div className="fw-semibold">{note.schedule}</div>
                      <div className="text-muted small">Última act.: {note.lastUpdatedAtLabel ?? '—'}</div>
                    </td>
                    <td>
                      <div className="small">
                        {note.lastUpdatedBy ? (
                          <div>
                            <strong>Modificó:</strong> {note.lastUpdatedBy}
                          </div>
                        ) : null}
                        {note.closedBy ? (
                          <div>
                            <strong>Cerró:</strong> {note.closedBy}
                          </div>
                        ) : null}
                        {note.closedAtLabel ? (
                          <div className="text-muted">{note.closedAtLabel}</div>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => startView(note.id)}
                        >
                          Ver
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          disabled={note.status === 'CERRADA'}
                          onClick={() => startEdit(note.id)}
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
  );
};

export default NotasEnfermeriaList;
