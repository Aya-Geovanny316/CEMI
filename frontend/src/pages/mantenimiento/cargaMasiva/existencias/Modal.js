import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form, Modal, Table } from 'react-bootstrap';
import { NotificationManager } from 'react-notifications';
import { useCargaMasivaExistencias } from './Context';

const NuevaCargaModal = () => {
  const { showForm, closeForm, bodegas, procesarCarga, submitting } = useCargaMasivaExistencias();
  const [bodega, setBodega] = useState('');
  const [archivo, setArchivo] = useState(null);

  useEffect(() => {
    if (showForm) {
      setBodega('');
      setArchivo(null);
    }
  }, [showForm]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!bodega || !archivo) {
      NotificationManager.warning('Seleccione la bodega y el archivo de Excel', 'Campos requeridos', 3000);
      return;
    }
    procesarCarga({ bodega, archivo });
  };

  return (
    <Modal show={showForm} onHide={closeForm} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Nueva Carga de Existencias</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Bodega</Form.Label>
            <Form.Control as="select" value={bodega} onChange={(e) => setBodega(e.target.value)}>
              <option value="">Seleccione una bodega</option>
              {bodegas.map((b) => {
                const nombre = b?.nombre ?? b?.label ?? b?.descripcion ?? '';
                if (!nombre) return null;
                return (
                  <option key={nombre} value={nombre}>
                    {nombre}
                  </option>
                );
              })}
            </Form.Control>
          </Form.Group>

          <Form.Group>
            <Form.Label>Archivo (.xlsx)</Form.Label>
            <Form.Control
              type="file"
              accept=".xlsx"
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
            />
            <Form.Text className="text-muted">
              Utilice el formato compartido por el equipo. Debe contener columnas SKU y Cantidad.
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

const DetalleModal = () => {
  const { showDetalle, closeDetalle, detalle, detalleLoading, formatDate, formatNumber } =
    useCargaMasivaExistencias();

  const items = detalle?.items || [];
  const carga = detalleLoading ? null : detalle;
  const totalCantidad = useMemo(
    () => items.reduce((sum, item) => sum + Number(item?.cantidad_cargada || 0), 0),
    [items]
  );

  return (
    <Modal show={showDetalle} onHide={closeDetalle} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Detalle de Carga</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {carga ? (
          <>
            <div className="mb-3">
              <div>
                <strong>Fecha y Hora:</strong> {formatDate(carga.created_at)}
              </div>
              <div>
                <strong>Bodega:</strong> {carga.bodega}
              </div>
              <div>
                <strong>Usuario:</strong> {carga.usuario || '—'}
              </div>
              <div>
                <strong>Archivo:</strong> {carga.archivo_nombre || '—'}
              </div>
            </div>
            <Table bordered hover responsive size="sm">
              <thead className="table-primary">
                <tr>
                  <th>SKU</th>
                  <th>Descripción</th>
                  <th className="text-end">Cantidad</th>
                  <th className="text-end">Existencia previa</th>
                  <th className="text-end">Existencia final</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.sku}</td>
                    <td>{item.descripcion || '—'}</td>
                    <td className="text-end">{formatNumber(item.cantidad_cargada)}</td>
                    <td className="text-end">{formatNumber(item.cantidad_anterior)}</td>
                    <td className="text-end">{formatNumber(item.cantidad_resultante)}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center">
                      Sin registros
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
            <div className="text-end">
              <strong>Total cargado:</strong> {formatNumber(totalCantidad)}
            </div>
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
