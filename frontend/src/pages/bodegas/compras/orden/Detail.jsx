import React, { useEffect, useMemo, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { Card, Row, Col, Form, Button, Table, Modal, Alert } from 'react-bootstrap';
import { getData, patchData, postData, getBinary } from '../../../../apiService';

const diasCreditoOpts = [7, 15, 21, 30, 45, 60, 75, 90];

const ObservacionesModal = ({ show, onClose, onSubmit, title }) => {
  const [obs, setObs] = useState('');
  useEffect(() => { if (!show) setObs(''); }, [show]);
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton><Modal.Title>{title}</Modal.Title></Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label>Observaciones</Form.Label>
          <Form.Control as="textarea" rows={3} value={obs} onChange={(e) => setObs(e.target.value)} />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" onClick={() => obs.trim() && onSubmit(obs)}>Aceptar</Button>
      </Modal.Footer>
    </Modal>
  );
};

const OrdenCompraDetail = (props) => {
  const id = props?.match?.params?.id;
  const [oc, setOc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAnularModal, setShowAnularModal] = useState(false);
  // Catálogos
  const [skus, setSkus] = useState([]);
  const [loadingSkus, setLoadingSkus] = useState(false);

  const editable = useMemo(() => ['BORRADOR', 'EDICION'].includes(oc?.estatus), [oc]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getData(`compras/ordenes-compra/${id}/`);
      setOc(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  // Cargar SKUs para filtrar por proveedor de la OC
  useEffect(() => {
    const cargarSkus = async () => {
      try {
        setLoadingSkus(true);
        const res = await getData('inventario/skus/?page_size=200');
        const list = res?.data?.results ?? res?.data ?? [];
        setSkus(Array.isArray(list) ? list : []);
      } catch (_) {
        setSkus([]);
      } finally {
        setLoadingSkus(false);
      }
    };
    cargarSkus();
  }, []);

  const onChangeField = (k) => (e) => {
    const v = e?.target?.value ?? e;
    setOc((prev) => ({ ...prev, [k]: v }));
  };

  const recalcItem = (it) => {
    const cantidad = parseFloat(it.cantidad || 0);
    const precio = parseFloat(it.precio_sin_iva || 0);
    let iva = parseFloat(it.iva || 0);
    // Regla: servicios (codigo 'SERV') IVA 0, productos afectos 12% automáticamente si no se sobreescribe
    if (String(it.codigo_sku || '').toUpperCase() === 'SERV') {
      iva = 0;
    } else if (!Number.isFinite(it._iva_manual)) {
      // Si el usuario no ha tocado el campo IVA manualmente, autocalcular 12%
      iva = Math.round((precio * 0.12) * 100) / 100;
    }
    const total = (precio + iva) * cantidad;
    return { ...it, cantidad, precio_sin_iva: precio, iva, total: Math.round(total * 100) / 100 };
  };

  const addItem = () => {
    setOc((prev) => ({
      ...prev,
      items: [...(prev.items || []), { codigo_sku: '', descripcion: '', unidad_medida: '', cantidad: 1, precio_sin_iva: 0, iva: 0, total: 0 }],
    }));
  };
  const removeItem = (idx) => setOc((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  const changeItem = (idx, k, v) => setOc((prev) => {
    const items = [...(prev.items || [])];
    const next = { ...items[idx], [k]: v };
    if (k === 'iva') next._iva_manual = true; // marca override manual
    if (k === 'codigo_sku') {
      // Si el usuario elige un SKU del catálogo, precargar descripción/unidad
      const skuSel = (skus || []).find((s) => String(s.codigo_sku) === String(v));
      if (skuSel) {
        next.descripcion = skuSel.nombre || skuSel.descripcion || next.descripcion || '';
        next.unidad_medida = skuSel.unidad_despacho || skuSel.unidad_compra || next.unidad_medida || '';
      }
    }
    items[idx] = recalcItem(next);
    return { ...prev, items };
  });

  // SKUs filtrados por proveedor de la OC (solo activos si aplica)
  const skusProveedor = useMemo(() => {
    if (!oc) return [];
    const prov = String(oc.proveedor_nombre || oc.requisicion?.proveedor || '').toLowerCase();
    const base = Array.isArray(skus) ? skus : [];
    const filtered = base.filter((s) => {
      const sp = String(s.proveedor || '').toLowerCase();
      const estadoOk = !s.estado || String(s.estado).toLowerCase() === 'alta';
      return prov && sp === prov && estadoOk;
    });
    return filtered.sort((a, b) => String(a.codigo_sku || '').localeCompare(String(b.codigo_sku || '')));
  }, [skus, oc]);

  const doPatchEditar = async (observaciones) => {
    const payload = {
      observaciones,
      fecha_entrega: oc.fecha_entrega || null,
      condiciones_pago: oc.condiciones_pago || null,
      dias_credito: oc.condiciones_pago === 'CREDITO' ? (oc.dias_credito || null) : null,
      items: oc.items,
    };
    const res = await patchData(`compras/ordenes-compra/${id}/editar/`, payload);
    setOc(res.data);
    setShowEditModal(false);
  };

  const doAnular = async (observaciones) => {
    const res = await postData(`compras/ordenes-compra/${id}/anular/`, { observaciones });
    setOc(res.data);
    setShowAnularModal(false);
  };

  const doGenerar = async () => {
    // Validaciones rápidas en cliente
    if (!oc.condiciones_pago) {
      alert('Seleccione las condiciones de pago (Credito o Contado).');
      return;
    }
    if (oc.condiciones_pago === 'CREDITO' && !oc.dias_credito) {
      alert('Seleccione los días de crédito.');
      return;
    }
    try {
      const payload = {
        fecha_entrega: oc.fecha_entrega || null,
        condiciones_pago: oc.condiciones_pago || null,
        dias_credito: oc.condiciones_pago === 'CREDITO' ? (oc.dias_credito || null) : null,
      };
      const res = await postData(`compras/ordenes-compra/${id}/generar/`, payload);
      setOc(res.data);
    } catch (e) {
      const msg = e?.response?.data ? JSON.stringify(e.response.data) : e.message;
      alert(`No se pudo generar la OC: ${msg}`);
    }
  };

  const downloadPdf = async () => {
    try {
      const res = await getBinary(`compras/ordenes-compra/${id}/pdf/`);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orden_compra_${oc.numero || id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      const msg = e?.response?.status === 401 ? 'No autenticado. Inicie sesión.' : (e?.message || 'Error al descargar PDF');
      alert(msg);
    }
  };

  const printPdf = async () => {
    try {
      const res = await getBinary(`compras/ordenes-compra/${id}/pdf/`);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          document.body.removeChild(iframe);
          window.URL.revokeObjectURL(url);
        }, 100);
      };
      iframe.src = url;
    } catch (e) {
      const msg = e?.response?.status === 401 ? 'No autenticado. Inicie sesión.' : (e?.message || 'Error al imprimir PDF');
      alert(msg);
    }
  };

  if (loading || !oc) return <p className="m-3">Cargando...</p>;

  return (
    <div className="container mt-3">
      <h4 className="mb-1">Orden de Compra #{oc.numero || oc.id}</h4>
      <div className="text-muted mb-3">Proveedor: <strong>{oc.proveedor_nombre || oc.requisicion?.proveedor || '-'}</strong></div>
      {/* Bloque de visualización con campos de auditoría básicos */}
      <Card className="p-3 mb-3">
        <Row className="g-2">
          <Col md={3}>
            <small className="text-muted">Fecha y Hora</small>
            <div>
              {(oc.fecha || oc.fecha_creacion) &&
                new Date(oc.fecha || oc.fecha_creacion).toLocaleString('es-GT', {
                  timeZone: 'America/Guatemala',
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
            </div>
          </Col>
          <Col md={3}><small className="text-muted">Solicitante – Bodega</small><div>{oc.solicitante_bodega || '-'}</div></Col>
          <Col md={3}><small className="text-muted">Tipo de requisición</small><div>{oc.tipo_requisicion || oc.requisicion_info?.tipo_requisicion || '-'}</div></Col>
          <Col md={3}><small className="text-muted">Estatus</small><div>{oc.estatus}</div></Col>
        </Row>
        <Row className="g-2 mt-2">
          <Col md={3}><small className="text-muted">Alta por</small><div>{oc.requisicion_info?.alta_por || '-'}</div></Col>
          <Col md={3}><small className="text-muted">Observaciones de Alta</small><div>{oc.requisicion_info?.observaciones_alta || '-'}</div></Col>
          <Col md={3}><small className="text-muted">Generada por</small><div>{oc.generada_por || '-'}</div></Col>
          <Col md={3}><small className="text-muted">Total OC</small><div>{Number(oc.total || 0).toFixed(2)}</div></Col>
        </Row>
      </Card>
      {oc.estatus === 'GENERADA' && (
        <Alert variant="info">Esta orden está GENERADA y no permite edición. Puede imprimir el PDF.</Alert>
      )}

      <Card className="p-3 mb-3">
        <Row className="g-3">
          <Col md={3}>
            <Form.Label>Fecha de Entrega</Form.Label>
            <Form.Control type="date" value={oc.fecha_entrega || ''} onChange={onChangeField('fecha_entrega')} disabled={!editable} />
          </Col>
          <Col md={3}>
            <Form.Label>Condiciones de Pago</Form.Label>
            <Form.Control as="select" value={oc.condiciones_pago || ''} onChange={onChangeField('condiciones_pago')} disabled={!editable}>
              <option value="">Seleccione</option>
              <option value="CREDITO">Credito</option>
              <option value="CONTADO">Contado</option>
            </Form.Control>
          </Col>
          {oc.condiciones_pago === 'CREDITO' && (
            <Col md={3}>
              <Form.Label>Días Crédito</Form.Label>
              <Form.Control as="select" value={oc.dias_credito || ''} onChange={onChangeField('dias_credito')} disabled={!editable}>
                <option value="">Seleccione</option>
                {diasCreditoOpts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Form.Control>
            </Col>
          )}
        </Row>
      </Card>

      <Card className="p-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="m-0">Ítems</h6>
          {editable && <Button size="sm" onClick={addItem}>Agregar</Button>}
        </div>
        <Table bordered size="sm">
          <thead className="table-primary">
            <tr>
              <th>SKU</th>
              <th>Descripción</th>
              <th>UM</th>
              <th style={{ width: 90 }}>Cantidad</th>
              <th style={{ width: 110 }}>Precio s/IVA</th>
              <th style={{ width: 90 }}>IVA</th>
              <th style={{ width: 120 }}>Total</th>
              {editable && <th style={{ width: 70 }}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {(oc.items || []).length === 0 ? (
              <tr><td colSpan={editable ? 8 : 7} className="text-center text-muted">Sin ítems</td></tr>
            ) : (oc.items || []).map((it, idx) => (
              <tr key={idx}>
                <td>
                  {editable ? (
                    <Form.Control
                      as="select"
                      value={String(it.codigo_sku || '')}
                      onChange={(e) => changeItem(idx, 'codigo_sku', e.target.value)}
                    >
                      <option value="">Seleccione</option>
                      <option value="SERV">SERV - Servicio</option>
                      {skusProveedor.map((s) => (
                        <option key={s.id} value={s.codigo_sku}>{s.codigo_sku} - {(s.nombre || s.descripcion)}</option>
                      ))}
                    </Form.Control>
                  ) : it.codigo_sku}
                </td>
                <td>{editable ? (<Form.Control value={it.descripcion} onChange={(e) => changeItem(idx, 'descripcion', e.target.value)} />) : it.descripcion}</td>
                <td>{editable ? (<Form.Control value={it.unidad_medida} onChange={(e) => changeItem(idx, 'unidad_medida', e.target.value)} />) : it.unidad_medida}</td>
                <td>{editable ? (<Form.Control type="number" step="0.01" value={it.cantidad} onChange={(e) => changeItem(idx, 'cantidad', e.target.value)} />) : it.cantidad}</td>
                <td>{editable ? (<Form.Control type="number" step="0.01" value={it.precio_sin_iva} onChange={(e) => changeItem(idx, 'precio_sin_iva', e.target.value)} />) : Number(it.precio_sin_iva).toFixed(2)}</td>
                <td>{editable ? (<Form.Control type="number" step="0.01" value={it.iva} onChange={(e) => changeItem(idx, 'iva', e.target.value)} />) : Number(it.iva).toFixed(2)}</td>
                <td>{Number(it.total).toFixed(2)}</td>
                {editable && (
                  <td>
                    <Button variant="outline-danger" size="sm" onClick={() => removeItem(idx)}>Quitar</Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <div className="d-flex gap-2 mt-3 flex-wrap">
        <Button variant="secondary" onClick={() => props.history.push('/dashboard/bodegas/compras/orden')}>Regresar al listado</Button>
        {editable && <Button variant="primary" onClick={() => setShowEditModal(true)}>Editar</Button>}
        {oc.estatus !== 'ANULADA' && <Button variant="danger" onClick={() => setShowAnularModal(true)}>Anular</Button>}
        {editable && <Button variant="success" onClick={doGenerar}>Generar</Button>}
        {oc.estatus === 'GENERADA' && (
          <>
            <Button variant="outline-secondary" onClick={downloadPdf}>Descargar PDF</Button>
            <Button variant="secondary" className="ml-2" onClick={printPdf}>Imprimir</Button>
          </>
        )}
      </div>

      <ObservacionesModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={doPatchEditar}
        title="Editar Orden de Compra"
      />
      <ObservacionesModal
        show={showAnularModal}
        onClose={() => setShowAnularModal(false)}
        onSubmit={doAnular}
        title="Anular Orden de Compra"
      />
    </div>
  );
};

export default withRouter(OrdenCompraDetail);
