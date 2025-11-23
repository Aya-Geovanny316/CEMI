import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Form, Modal, Table } from 'react-bootstrap';
import { NotificationManager } from 'react-notifications';
import { useCargaMasivaAdmisiones } from './Context';

const NuevaCargaModal = () => {
  const { showForm, closeForm, procesarCarga, submitting } = useCargaMasivaAdmisiones();
  const [archivo, setArchivo] = useState(null);

  useEffect(() => {
    if (showForm) {
      setArchivo(null);
    }
  }, [showForm]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!archivo) {
      NotificationManager.warning('Seleccione el archivo de Excel a procesar', 'Archivo requerido', 3000);
      return;
    }
    procesarCarga({ archivo });
  };

  return (
    <Modal show={showForm} onHide={closeForm} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Nueva Carga de Admisiones</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Archivo (.xlsx)</Form.Label>
            <Form.Control
              type="file"
              accept=".xlsx"
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
            />
            <Form.Text className="text-muted">
              El archivo debe incluir las columnas: No. de expediente, Nombre completo, Teléfonos, Departamento, Municipio y DPI.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeForm} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Procesando…' : 'Aplicar'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

const estadoVariant = (estado) => {
  switch (estado) {
    case 'creado':
      return 'success';
    case 'omitido':
      return 'warning';
    case 'error':
      return 'danger';
    default:
      return 'secondary';
  }
};

const DetalleModal = () => {
  const { showDetalle, closeDetalle, detalle, detalleLoading, formatDateTime } = useCargaMasivaAdmisiones();

  const resumen = useMemo(() => {
    if (!detalle) return { creados: 0, omitidos: 0, errores: 0 };
    return {
      creados: detalle.total_creados || 0,
      omitidos: detalle.total_omitidos || 0,
      errores: detalle.total_errores || 0,
    };
  }, [detalle]);

  const items = detalle?.items || [];
  const carga = detalleLoading ? null : detalle;

  return (
    <Modal show={showDetalle} onHide={closeDetalle} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Detalle de carga de admisiones</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {carga ? (
          <>
            <div className="mb-3">
              <div><strong>Fecha:</strong> {formatDateTime(carga.created_at)}</div>
              <div><strong>Usuario:</strong> {carga.usuario || '—'}</div>
              <div><strong>Archivo:</strong> {carga.archivo_nombre || '—'}</div>
              {carga.archivo_fuente && (
                <div><strong>Fuente:</strong> {carga.archivo_fuente}</div>
              )}
              <div className="d-flex gap-3 mt-2">
                <Badge bg="success">Nuevos: {resumen.creados}</Badge>
                <Badge bg="warning" text="dark">Omitidos: {resumen.omitidos}</Badge>
                <Badge bg="danger">Errores: {resumen.errores}</Badge>
              </div>
            </div>
            <Table bordered hover responsive size="sm">
              <thead className="table-primary">
                <tr>
                  <th>Expediente</th>
                  <th>Nombre</th>
                  <th>Teléfonos</th>
                  <th>Ubicación</th>
                  <th>DPI</th>
                  <th>Estado</th>
                  <th>Mensaje</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.expediente || '—'}</td>
                    <td>{item.nombre || '—'}</td>
                    <td>
                      {item.telefono || '—'}
                      {item.telefono_secundario ? ` / ${item.telefono_secundario}` : ''}
                    </td>
                    <td>
                      {[item.municipio, item.departamento].filter(Boolean).join(', ') || '—'}
                      {item.referencia ? <div className="text-muted small">{item.referencia}</div> : null}
                    </td>
                    <td>{item.dpi || '—'}</td>
                    <td>
                      <Badge bg={estadoVariant(item.estado)}>{item.estado}</Badge>
                    </td>
                    <td>{item.mensaje || '—'}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center">
                      Sin registros
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </>
        ) : (
          <div className="text-center">Cargando…</div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={closeDetalle}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const Modals = () => (
  <>
    <NuevaCargaModal />
    <DetalleModal />
  </>
);

export default Modals;
