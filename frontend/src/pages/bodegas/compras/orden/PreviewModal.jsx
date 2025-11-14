import React, { useContext, useEffect, useState } from 'react';
import { Modal, Button, Table, Spinner, Alert } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { AppContext } from './Context';
import { getBinary } from '../../../../apiService';

const PreviewModal = (props) => {
  const { showPreview, closePreview, selectedReq, crearOCDesdeRequisicion } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [totales, setTotales] = useState({ subtotal: 0, iva: 0, total: 0 });

  const loadItems = async () => {
    if (!selectedReq?.id) return;
    try {
      setLoading(true);
      const { getData } = await import('../../../../apiService');
      const res = await getData('requisisiones/?estado=aprobada');
      const req = (res.data || []).find(r => String(r.id) === String(selectedReq.id));
      const productos = req?.productos || [];
      const servicios = req?.servicios || [];
      const mapped = [
        ...productos.map(p => ({ sku: p.sku, descripcion: p.descripcion, unidad: p.unidad, cantidad: p.cantidad, precio: p.precio, total: p.total })),
        ...servicios.map(s => ({ sku: 'SERV', descripcion: s.descripcion, unidad: 'SERV', cantidad: s.cantidad, precio: s.precio, total: s.total })),
      ];
      setItems(mapped);
      const subtotal = mapped.reduce((acc, it) => acc + Number(it.total || 0), 0);
      const iva = 0;
      const total = subtotal + iva;
      setTotales({ subtotal, iva, total });
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (showPreview && selectedReq) loadItems(); }, [showPreview, selectedReq]);

  const abrirDetalle = async () => {
    try {
      if (!selectedReq?.id) return;
      const oc = await crearOCDesdeRequisicion(selectedReq.id);
      const ocId = oc?.id;
      closePreview();
      if (ocId) props.history.push(`/dashboard/bodegas/compras/orden/${ocId}`);
    } catch (e) { /* noop */ }
  };

  const onClickImprimir = async () => {
    try {
      if (!selectedReq?.oc_id) return;
      const res = await getBinary(`compras/ordenes-compra/${selectedReq.oc_id}/pdf/`);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orden_compra_${selectedReq.oc_numero || selectedReq.oc_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      const msg = e?.response?.status === 401 ? 'No autenticado. Inicie sesión.' : (e?.message || 'Error al descargar PDF');
      alert(msg);
    }
  };

  return (
    <Modal
      show={!!showPreview}
      onHide={closePreview}
      centered
      size="xl"     // más ancho
      scrollable    // scroll interno si el contenido crece
    >
      <Modal.Header closeButton>
        <Modal.Title>Requisición Autorizada #{selectedReq?.id || '-'}</Modal.Title>
      </Modal.Header>

      {/* Altura limitada y scroll solo con inline style (sin CSS externo) */}
      <Modal.Body style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
        <div className="mb-2"><strong>No. orden de compra:</strong> {selectedReq?.numero_orden_compra || '-'}</div>
        <div className="mb-2"><strong>Fecha:</strong> {selectedReq?.fecha || '-'}</div>
        <div className="mb-2"><strong>Proveedor:</strong> {selectedReq?.proveedor_nombre || '-'}</div>
        <div className="mb-2"><strong>Solicitante-Bodega:</strong> {selectedReq?.solicitante_bodega || '-'}</div>
        <div className="mb-2"><strong>Tipo de requisición:</strong> {selectedReq?.tipo_requisicion || '-'}</div>
        <div className="mb-2"><strong>Total:</strong> {selectedReq?.total || '0.00'}</div>
        <div className="mb-2"><strong>Estatus:</strong> {selectedReq?.estatus}</div>

        <hr />
        <h6>Ítems</h6>

        {loading ? (
          <Spinner animation="border" size="sm" />
        ) : (
          // Contenedor responsivo: agrega scroll horizontal si la tabla es muy ancha
          <div className="table-responsive">
            <Table bordered size="sm" className="mb-0" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th style={{ width: '110px' }}>SKU</th>
                  <th>Descripción</th>
                  <th style={{ width: '90px' }}>UM</th>
                  <th className="text-right" style={{ width: '120px' }}>Cantidad</th>
                  <th className="text-right" style={{ width: '120px' }}>Precio</th>
                  <th className="text-right" style={{ width: '140px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="text-break">{it.sku}</td>
                    <td className="text-break">{it.descripcion}</td>
                    <td className="text-break">{it.unidad || ''}</td>
                    <td className="text-right">{it.cantidad}</td>
                    <td className="text-right">{Number(it.precio).toFixed(2)}</td>
                    <td className="text-right">{Number(it.total).toFixed(2)}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted">Sin items</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4}></td>
                  <th className="text-right">Subtotal</th>
                  <td className="text-right">{totales.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={4}></td>
                  <th className="text-right">IVA</th>
                  <td className="text-right">{totales.iva.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={4}></td>
                  <th className="text-right">Total</th>
                  <td className="text-right">{totales.total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </Table>
          </div>
        )}

        {selectedReq?.oc_estatus === 'GENERADA' && selectedReq?.oc_id && (
          <Alert variant="info" className="mt-2 p-2">
            Nota: Las órdenes en estado GENERADA no permiten edición.
          </Alert>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={closePreview}>Cerrar</Button>
        {selectedReq?.oc_estatus === 'GENERADA' && selectedReq?.oc_id && (
          <Button variant="outline-info" onClick={onClickImprimir}>Imprimir</Button>
        )}
        <Button variant="primary" onClick={abrirDetalle}>Ir al detalle</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default withRouter(PreviewModal);
