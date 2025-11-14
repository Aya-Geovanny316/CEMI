import React from 'react';
import { Button, Card, Spinner, Table } from 'react-bootstrap';
import { useCargaMasivaExistencias } from './Context';

const List = () => {
  const {
    cargas,
    loading,
    count,
    page,
    hasNext,
    hasPrev,
    goToNext,
    goToPrevious,
    formatDate,
    openDetalle,
    openForm,
  } = useCargaMasivaExistencias();

  return (
    <Card className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="m-0">Carga Masiva de Existencias</h5>
        <Button onClick={openForm}>Nueva Carga</Button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table bordered hover responsive size="sm">
          <thead className="table-primary">
            <tr>
              <th>#</th>
              <th>Fecha y Hora</th>
              <th>Bodega</th>
              <th>Usuario</th>
              <th>Archivo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargas.map((carga) => (
              <tr key={carga.id}>
                <td>{carga.id}</td>
                <td>{formatDate(carga.created_at)}</td>
                <td>{carga.bodega}</td>
                <td>{carga.usuario || '—'}</td>
                <td>{carga.archivo_nombre || '—'}</td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => openDetalle(carga.id)}
                  >
                    Ver
                  </Button>
                </td>
              </tr>
            ))}
            {cargas.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center">Sin registros</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      <div className="d-flex justify-content-between align-items-center mt-2">
        <div>Total registros: {count}</div>
        <div className="d-flex gap-2">
          <Button size="sm" disabled={!hasPrev || page <= 1} onClick={goToPrevious}>
            Anterior
          </Button>
          <Button size="sm" disabled={!hasNext} onClick={goToNext}>
            Siguiente
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default List;
