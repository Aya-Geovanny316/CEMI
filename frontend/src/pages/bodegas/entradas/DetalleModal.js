import React, { useContext } from 'react';
import { Modal, Table, Button } from 'react-bootstrap';
import { AppContext } from './Context';

const DetalleModal = () => {
  const { showDetail, setShowDetail, selectedEntrada } = useContext(AppContext);
  if (!showDetail || !selectedEntrada) return null;

  const items = selectedEntrada.items || [];

  return (
    <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Entrada #{selectedEntrada.id}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <strong>Fecha:</strong>{' '}
          {selectedEntrada.created_at ? new Date(selectedEntrada.created_at).toLocaleString() : '-'}
        </p>
        <p><strong>Creado por:</strong> {selectedEntrada.usuario || '-'}</p>
        <p><strong>Aplicado por:</strong> {selectedEntrada.aplicado_por || '-'}</p>
        <p><strong>Estado:</strong> {selectedEntrada.estado === 'aplicada' ? 'Aplicada' : 'No Aplicada'}</p>
        <p><strong>Bodega:</strong> {selectedEntrada.bodega ?? '-'}</p>
        <p><strong>Tipo:</strong> {selectedEntrada.tipo_entrada ?? '-'}</p>
        <p><strong>Proveedor:</strong> {selectedEntrada.proveedor ?? '-'}</p>

        <Table bordered size="sm" className="mt-3">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Descripción</th>
              <th className="text-end">Cantidad</th>
              <th className="text-end">Costo</th>
              <th className="text-end">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => {
              const nf = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              return (
                <tr key={`${it.sku ?? idx}`}>
                  <td>{it.sku ?? '-'}</td>
                  <td>{it.descripcion ?? '-'}</td>
                  <td className="text-end">{it.cantidad ?? '-'}</td>
                  <td className="text-end">{nf.format(Number(it.costo ?? 0))}</td>
                  <td className="text-end">{nf.format(Number(it.total ?? 0))}</td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center">Sin items</td>
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
