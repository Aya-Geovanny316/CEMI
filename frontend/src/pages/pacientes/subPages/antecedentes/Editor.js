import React, { useMemo } from 'react';
import { Alert, Button, Card } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import { useAntecedentesContext } from './Context';
import 'quill/dist/quill.snow.css';

const AntecedentesEditor = () => {
  const {
    mode,
    activeRecord,
    editorContent,
    setEditorContent,
    returnToList,
    saveRecord
  } = useAntecedentesContext();

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ size: ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['blockquote', 'code-block'],
        ['link'],
        ['clean']
      ]
    }),
    []
  );

  const formats = useMemo(
    () => [
      'size',
      'bold',
      'italic',
      'underline',
      'strike',
      'color',
      'background',
      'list',
      'bullet',
      'blockquote',
      'code-block',
      'link'
    ],
    []
  );

  const isReadOnly = mode === 'VIEW';

  const handleSave = () => {
    const response = saveRecord({ content: editorContent });
    if (!response.success) {
      window.alert('Debes ingresar contenido para guardar el antecedente.');
    }
  };

  const headerTitle =
    mode === 'EDIT'
      ? 'Editar antecedente'
      : mode === 'CREATE'
      ? 'Nuevo antecedente'
      : 'Detalle de antecedente';

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-white border-0">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <h4 className="mb-0">{headerTitle}</h4>
          <div className="text-end">
            {activeRecord ? (
              <>
                <strong>Médico:</strong> {activeRecord.doctorName}{' '}
                <span className="text-muted">
                  ({activeRecord.doctorLicense})
                </span>
                <div className="text-muted small">
                  Registrado: {activeRecord.createdAtLabel}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        {isReadOnly ? (
          <Alert variant="info">
            Vista en modo lectura. Puedes consultar el antecedente sin
            modificarlo.
          </Alert>
        ) : (
          <Alert variant="light" className="border">
            Completa la información necesaria y guarda los antecedentes del
            paciente.
          </Alert>
        )}

        <div className="mx-auto" style={{ maxWidth: '820px' }}>
          <ReactQuill
            theme="snow"
            value={editorContent}
            onChange={setEditorContent}
            modules={modules}
            formats={formats}
            readOnly={isReadOnly}
            placeholder="Escribe los antecedentes del paciente..."
            style={{ minHeight: '360px' }}
          />
        </div>
      </Card.Body>
      <Card.Footer className="bg-white d-flex justify-content-end gap-2">
        <Button variant="outline-secondary" onClick={returnToList}>
          Volver
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={isReadOnly}>
          Guardar
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default AntecedentesEditor;
