import React, { useContext } from 'react';
import { Modal, Table, Button } from 'react-bootstrap';
import { AppContext } from './Context';

const DetalleModal = () => {
  const { showDetail, setShowDetail, selectedTraslado } = useContext(AppContext);
  if (!showDetail || !selectedTraslado) return null;

  const items = selectedTraslado.items || [];

  return (
    <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Traslado #{selectedTraslado.id}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>Fecha envío:</strong> {selectedTraslado.fecha_envio ? new Date(selectedTraslado.fecha_envio).toLocaleString() : '-'}</p>
        <p><strong>Fecha recibido:</strong> {selectedTraslado.fecha_recibido ? new Date(selectedTraslado.fecha_recibido).toLocaleString() : '-'}</p>
        <p><strong>Origen:</strong> {selectedTraslado.bodega_origen}</p>
        <p><strong>Destino:</strong> {selectedTraslado.bodega_destino}</p>
        <p><strong>Estatus:</strong> {selectedTraslado.estatus}</p>
        <p><strong>Comentarios:</strong> {selectedTraslado.comentarios || '-'}</p>
        <p><strong>Enviado por:</strong> {selectedTraslado.enviado_por || '-'}</p>
        <p><strong>Departamento:</strong> {selectedTraslado.departamento || '-'}</p>
        <p><strong>Entregamos a:</strong> {selectedTraslado.entregamos_a || '-'}</p>
        <p><strong>Recibido por:</strong> {selectedTraslado.recibido_por || '-'}</p>

        <Table bordered size="sm" className="mt-3">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Descripción</th>
              <th className="text-end">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={`${it.sku ?? idx}`}>
                <td>{it.sku ?? '-'}</td>
                <td>{it.descripcion ?? '-'}</td>
                <td className="text-end">{it.cantidad ?? '-'}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center">Sin items</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowDetail(false)}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DetalleModal;
