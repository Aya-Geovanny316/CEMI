import React from 'react';
import { Card, Table } from 'react-bootstrap';
import { useMedicoTratanteContext } from './Context';

const MedicoTratanteList = () => {
  const { title, columns, items } = useMedicoTratanteContext();

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-white border-0">
        <h4 className="mb-0">{title}</h4>
        {/* <small className="text-muted">
          Pendiente de definir campos y fuente de datos.
        </small> */}
      </Card.Header>
      <Card.Body className="p-0">
        <Table responsive hover className="mb-0">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item, index) => (
                <tr key={index}>
                  {columns.map((col) => (
                    <td key={col.key}>{item[col.key] || '—'}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-4">
                  Sin registros por el momento.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default MedicoTratanteList;
