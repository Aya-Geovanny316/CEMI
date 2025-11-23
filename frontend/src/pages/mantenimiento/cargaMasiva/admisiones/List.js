import React from 'react';
import { Button, Card, Spinner, Table, Badge } from 'react-bootstrap';
import { useCargaMasivaAdmisiones } from './Context';

const List = () => {
  const {
    cargas,
    loading,
    count,
    page,
    totalPages,
    hasNext,
    hasPrev,
    goToNext,
    goToPrevious,
    goToFirst,
    goToLast,
    formatDateTime,
    openDetalle,
    openForm,
  } = useCargaMasivaAdmisiones();

  return (
    <Card className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="m-0">Carga Masiva de Admisiones</h5>
        <Button onClick={openForm}>Procesar archivo</Button>
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
              <th>Usuario</th>
              <th>Archivo</th>
              <th>Nuevos</th>
              <th>Omitidos</th>
              <th>Errores</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargas.map((carga) => (
              <tr key={carga.id}>
                <td>{carga.id}</td>
                <td>{formatDateTime(carga.created_at)}</td>
                <td>{carga.usuario || '—'}</td>
                <td>
                  <div className="fw-semibold">{carga.archivo_nombre || '—'}</div>
                  {carga.archivo_fuente && (
                    <small className="text-muted">{carga.archivo_fuente}</small>
                  )}
                </td>
                <td><Badge bg="success">{carga.total_creados || 0}</Badge></td>
                <td><Badge bg="warning" text="dark">{carga.total_omitidos || 0}</Badge></td>
                <td><Badge bg="danger">{carga.total_errores || 0}</Badge></td>
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
                <td colSpan={8} className="text-center">
                  Sin registros
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      <div className="d-flex justify-content-between align-items-center mt-2">
        <div>Total registros: {count} | Página {page} de {totalPages}</div>
        <div className="d-flex gap-2">
          <Button size="sm" variant="outline-secondary" disabled={page <= 1} onClick={goToFirst}>
            Primero
          </Button>
          <Button size="sm" disabled={!hasPrev || page <= 1} onClick={goToPrevious}>
            Anterior
          </Button>
          <Button size="sm" disabled={!hasNext} onClick={goToNext}>
            Siguiente
          </Button>
          <Button size="sm" variant="outline-secondary" disabled={page >= totalPages} onClick={goToLast}>
            Último
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default List;
