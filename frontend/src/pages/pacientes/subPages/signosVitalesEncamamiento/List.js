import React, { useEffect, useMemo, useRef } from 'react';
import { Button, Card } from 'react-bootstrap';
import { useSignosVitalesEncamamientoContext } from './Context';

const SignosVitalesEncamamientoList = () => {
  const { title, fieldDefinitions, rows, handleCellChange, saveRows, resetRows, feedback, setFeedback } =
    useSignosVitalesEncamamientoContext();
  const tableContainerRef = useRef(null);

  const firstFilledIndex = useMemo(() => {
    return rows.findIndex((row) =>
      fieldDefinitions.some((field) => `${row[field.key] ?? ''}`.trim() !== '')
    );
  }, [rows, fieldDefinitions]);

  useEffect(() => {
    if (firstFilledIndex < 0 || !tableContainerRef.current) {
      return;
    }
    const targetRow = tableContainerRef.current.querySelector(
      `[data-hour-index="${firstFilledIndex}"]`
    );
    if (targetRow) {
      targetRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [firstFilledIndex]);

  const handleInputFocus = (event) => {
    event.target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-white border-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h4 className="mb-1">{title}</h4>
          <small className="text-muted">
            Registra y consulta los signos vitales por hora durante el encamamiento.
          </small>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <Button variant="outline-secondary" onClick={resetRows}>
            Nuevo registro
          </Button>
          <Button variant="primary" onClick={saveRows}>
            Guardar datos
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        {feedback ? (
          <div className={`alert alert-${feedback.type}`} role="alert">
            {feedback.message}
            <button
              type="button"
              className="btn-close float-end"
              aria-label="Close"
              onClick={() => setFeedback(null)}
            />
          </div>
        ) : null}
        <div className="table-responsive signos-encamamiento-table" ref={tableContainerRef}>
          <table className="table table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ minWidth: '140px' }}>Hora</th>
                {fieldDefinitions.map((field) => (
                  <th key={field.key} style={{ minWidth: '160px' }}>
                    {field.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.hour} data-hour-index={index}>
                  <td className="fw-semibold">{row.hour}</td>
                  {fieldDefinitions.map((field) => (
                    <td key={`${row.hour}-${field.key}`}>
                      <input
                        type={field.type}
                        step={field.step}
                        className="form-control form-control-sm"
                        value={row[field.key] ?? ''}
                        onChange={(event) =>
                          handleCellChange(row.hour, field.key, event.target.value)
                        }
                        onFocus={handleInputFocus}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default SignosVitalesEncamamientoList;
