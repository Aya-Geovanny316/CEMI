import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import { useHistoriaEnfermedadContext } from './Context';
import 'quill/dist/quill.snow.css';

const HistoriaEnfermedadForm = () => {
  const { title, content, handleContentChange } =
    useHistoriaEnfermedadContext();

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

  return (
    <div
      className="historia-enfermedad-editor mx-auto"
      style={{ maxWidth: '820px' }}
    >
      <h5 className="mb-3">{title}</h5>
      <ReactQuill
        theme="snow"
        value={content}
        onChange={handleContentChange}
        modules={modules}
        formats={formats}
        placeholder="Describe los antecedentes, diagnósticos y evolución del paciente..."
      />
    </div>
  );
};

export default HistoriaEnfermedadForm;
