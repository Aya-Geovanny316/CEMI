import React, { useMemo } from 'react';
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';
import { useNotasEnfermeriaContext } from './Context';

const toolbarModules = {
  toolbar: [
    [{ size: ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    ['link'],
    ['clean']
  ]
};

const toolbarFormats = [
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'blockquote',
  'code-block',
  'link'
];

const NotasEnfermeriaForm = () => {
  const {
    mode,
    notes,
    schedules,
    statusOptions,
    statusLabels,
    activeNote,
    editorContent,
    setEditorContent,
    editorSchedule,
    setEditorSchedule,
    editorStatus,
    setEditorStatus,
    saveNote,
    confirmCloseNote,
    enterListMode,
    feedback,
    setFeedback
  } = useNotasEnfermeriaContext();

  const isReadOnly = mode === 'VIEW' || (activeNote && activeNote.status === statusOptions.CERRADA);

  const panelTitle = useMemo(() => {
    switch (mode) {
      case 'CREATE':
        return 'Nueva nota de enfermería';
      case 'EDIT':
        return 'Editar nota de enfermería';
      case 'VIEW':
        return 'Detalle de nota de enfermería';
      default:
        return 'Detalle de nota de enfermería';
    }
  }, [mode]);

  const handleStatusChange = (event) => {
    const value = event.target.value;
    if (value === statusOptions.CERRADA && mode === 'EDIT') {
      const result = confirmCloseNote();
      if (!result.success) {
        // Revert to previous value if cancel
        setEditorStatus(statusOptions.EDICION);
      }
    } else {
      setEditorStatus(value);
    }
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-white border-0">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h4 className="mb-1">{panelTitle}</h4>
            <small className="text-muted">
              {isReadOnly
                ? 'Vista solo lectura. Esta nota se encuentra cerrada.'
                : 'Completa la nota y guarda tus comentarios para el paciente.'}
            </small>
          </div>
          {activeNote ? (
            <div className="text-end small text-muted">
              <div>
                <strong>Autor:</strong> {activeNote.author}
              </div>
              <div>
                <strong>Creación:</strong> {activeNote.createdAtLabel}
              </div>
              {activeNote.lastUpdatedAtLabel ? (
                <div>
                  <strong>Última modificación:</strong> {activeNote.lastUpdatedAtLabel}
                </div>
              ) : null}
              {activeNote.closedAtLabel ? (
                <div>
                  <strong>Cierre:</strong> {activeNote.closedAtLabel}
                </div>
              ) : null}
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
          <Col lg={4}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-0">
                <h6 className="mb-0">Historial de notas</h6>
                <small className="text-muted">Notas recientes primero.</small>
              </Card.Header>
              <Card.Body className="p-0">
                {notes.length === 0 ? (
                  <div className="p-3 text-muted">No hay notas registradas.</div>
                ) : (
                  <div className="list-group list-group-flush">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className={`list-group-item text-start ${
                          activeNote?.id === note.id ? 'active' : ''
                        }`}
                      >
                        <div className="fw-semibold small">{note.createdAtLabel}</div>
                        <div className="text-muted small text-truncate">
                          {note.schedule}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col lg={8}>
            <Form.Group className="mb-3">
              <Form.Label>Horario de la nota</Form.Label>
              <Form.Control
                as="select"
                value={editorSchedule}
                onChange={(event) => setEditorSchedule(event.target.value)}
                disabled={isReadOnly}
              >
                {schedules.map((schedule) => (
                  <option key={schedule} value={schedule}>
                    {schedule}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Estatus</Form.Label>
              <Form.Control
                as="select"
                value={editorStatus}
                onChange={handleStatusChange}
                disabled={isReadOnly}
              >
                <option value={statusOptions.EDICION}>
                  {statusLabels[statusOptions.EDICION]}
                </option>
                <option value={statusOptions.CERRADA}>
                  {statusLabels[statusOptions.CERRADA]}
                </option>
              </Form.Control>
            </Form.Group>

            <ReactQuill
              theme="snow"
              value={editorContent}
              onChange={setEditorContent}
              modules={toolbarModules}
              formats={toolbarFormats}
              readOnly={isReadOnly}
              placeholder="Escribe la nota de enfermería aquí..."
              style={{ minHeight: '260px', marginBottom: '1.5rem' }}
            />

            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-secondary" onClick={enterListMode}>
                Volver
              </Button>
              {!isReadOnly ? (
                <Button variant="primary" onClick={saveNote}>
                  Guardar
                </Button>
              ) : null}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default NotasEnfermeriaForm;
