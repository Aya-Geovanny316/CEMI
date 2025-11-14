import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form, Modal, Table } from 'react-bootstrap';
import { NotificationManager } from 'react-notifications';
import { useCargaMasivaPrecios } from './Context';

const NuevaCargaModal = () => {
  const { showForm, closeForm, seguros, procesarCarga, submitting } = useCargaMasivaPrecios();
  const [seguro, setSeguro] = useState('');
  const [archivo, setArchivo] = useState(null);

  useEffect(() => {
    if (showForm) {
      setSeguro('');
      setArchivo(null);
    }
  }, [showForm]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!seguro || !archivo) {
      NotificationManager.warning('Seleccione el seguro y el archivo de Excel', 'Campos requeridos', 3000);
      return;
    }
    procesarCarga({ seguro, archivo });
  };

  return (
    <Modal show={showForm} onHide={closeForm} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Nueva Carga de Precios</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Seguro</Form.Label>
            <Form.Control as="select" value={seguro} onChange={(e) => setSeguro(e.target.value)}>
              <option value="">Seleccione un seguro</option>
              {seguros.map((item) => {
                const nombre = item?.nombre ?? item?.label ?? item?.descripcion ?? '';
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
              Utilice el formato proporcionado (columna SKU y columna de precio para el seguro seleccionado).
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
  const { showDetalle, closeDetalle, detalle, detalleLoading, formatDateTime, formatCurrency } =
    useCargaMasivaPrecios();

  const items = detalle?.items || [];
  const carga = detalleLoading ? null : detalle;
  const totalSkus = items.length;
  const deltaPromedio = useMemo(() => {
    if (!items.length) return 0;
    const total = items.reduce(
      (acc, item) => acc + (Number(item?.precio_nuevo || 0) - Number(item?.precio_anterior || 0)),
      0
    );
    return total / items.length;
  }, [items]);

  return (
    <Modal show={showDetalle} onHide={closeDetalle} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Detalle de Carga de Precios</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {carga ? (
          <>
            <div className="mb-3">
              <div>
                <strong>Fecha y Hora:</strong> {formatDateTime(carga.created_at)}
              </div>
              <div>
                <strong>Seguro:</strong> {carga.seguro}
              </div>
              <div>
                <strong>Usuario:</strong> {carga.usuario || '—'}
              </div>
              <div>
                <strong>Archivo:</strong> {carga.archivo_nombre || '—'}
              </div>
              <div>
                <strong>SKUs procesados:</strong> {totalSkus}
              </div>
              <div>
                <strong>Variación promedio:</strong> {formatCurrency(deltaPromedio)}
              </div>
            </div>
            <Table bordered hover responsive size="sm">
              <thead className="table-primary">
                <tr>
                  <th>SKU</th>
                  <th>Descripción</th>
                  <th className="text-end">Precio anterior</th>
                  <th className="text-end">Precio nuevo</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.sku}</td>
                    <td>{item.descripcion || '—'}</td>
                    <td className="text-end">{formatCurrency(item.precio_anterior)}</td>
                    <td className="text-end">{formatCurrency(item.precio_nuevo)}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center">
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
