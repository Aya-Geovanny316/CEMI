import React, { useContext, useMemo, useState, useEffect } from 'react';
import { Card, Form, Row, Col, Button, Table } from 'react-bootstrap';
import { AppContext } from './Context';

const EntradaForm = () => {
  const {
    setShowForm,
    selectedEntrada,
    bodegas,
    proveedores,
    centrosCosto,
    cuentasContables,
    categorias,
    subcategorias,
    skus,
    getSubcategoriasByCategoria,
    crearEntrada,
    actualizarEntrada,
  } = useContext(AppContext);

  const [form, setForm] = useState({
    id: selectedEntrada?.id || null,
    bodega: selectedEntrada?.bodega || '',
    tipo_entrada: selectedEntrada?.tipo_entrada || '',
    proveedor: selectedEntrada?.proveedor || '',
    numero_referencia: selectedEntrada?.numero_referencia || '',
    centro_costo: selectedEntrada?.centro_costo || '',
    cuenta_contable: selectedEntrada?.cuenta_contable || '',
  });

  const [categoriaId, setCategoriaId] = useState('');
  const [subcategoriaNombre, setSubcategoriaNombre] = useState('');
  const [draft, setDraft] = useState({ skuId: '', costo: '', cantidad: '', lote: '', fecha_vencimiento: '' });
  const [permitirSinLoteVencimiento, setPermitirSinLoteVencimiento] = useState(false);
  const [items, setItems] = useState(selectedEntrada?.items || []);

  const onChange = (k) => (e) => {
    const v = e?.target?.value ?? e;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const skuOptions = useMemo(() => {
    let base = skus || [];
    if (categoriaId) {
      const cat = categorias.find(c => String(c.id) === String(categoriaId));
      const nombreCat = cat?.nombre;
      if (nombreCat) base = base.filter(s => (s.categoria || '') === nombreCat);
    }
    if (subcategoriaNombre) {
      base = base.filter(s => (s.subcategoria || '') === subcategoriaNombre);
    }
    return base;
  }, [skus, categorias, categoriaId, subcategoriaNombre]);

  useEffect(() => {
    if (categoriaId) getSubcategoriasByCategoria(categoriaId);
    setSubcategoriaNombre('');
  }, [categoriaId, getSubcategoriasByCategoria]);

  const addItem = () => {
    const skuObj = skuOptions.find(s => String(s.id) === String(draft.skuId));
    if (!skuObj) return;

    if (!permitirSinLoteVencimiento && (!draft.lote || !draft.fecha_vencimiento)) {
      alert('Los campos "Lote" y "Vencimiento" son obligatorios. Marque "Agregar sin Lote y Fecha de Vencimiento" si aplica.');
      return;
    }

    const costo = parseFloat(draft.costo || 0);
    const cantidad = parseFloat(draft.cantidad || 0);
    const gravaIva = (skuObj.iva || '').toString().trim() !== '';

    const _round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;

    const total = _round2(costo * cantidad);
    const precio_sin_iva = _round2(gravaIva ? (total / 1.12) : total);
    const iva = _round2(gravaIva ? (total - precio_sin_iva) : 0);

    setItems(prev => [
      ...prev,
      {
        sku: skuObj.codigo_sku,
        descripcion: skuObj.nombre || skuObj.descripcion || '',
        costo,
        cantidad,
        precio_sin_iva,
        iva,
        total,
        lote: permitirSinLoteVencimiento ? null : (draft.lote || null),
        fecha_vencimiento: permitirSinLoteVencimiento ? null : (draft.fecha_vencimiento || null),
      },
    ]);

    setDraft({ skuId: '', costo: '', cantidad: '', lote: '', fecha_vencimiento: '' });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, items };
    const res = form.id ? await actualizarEntrada(form.id, payload) : await crearEntrada(payload);
    if (res?.status === 201 || res?.status === 200) setShowForm(false);
  };

  const eliminarItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalGeneral = useMemo(() => {
    return (items || []).reduce((sum, it) => sum + (parseFloat(it.total) || 0), 0);
  }, [items]);

  return (
    <Card className="p-3">
      <h5 className="mb-3">{form.id ? 'Editar Entrada' : 'Nueva Entrada'}</h5>

      <Form onSubmit={onSubmit}>
        <Row className="g-3">
          <Col md={4}>
            <Form.Label>Bodega</Form.Label>
            <Form.Control as="select" value={form.bodega} onChange={onChange('bodega')}>
              <option value="">Seleccione</option>
              {(bodegas || []).map((b) => (
                <option key={b.id} value={b.nombre}>{b.nombre}</option>
              ))}
            </Form.Control>
          </Col>
          <Col md={4}>
            <Form.Label>Tipo</Form.Label>
            <Form.Control as="select" value={form.tipo_entrada} onChange={onChange('tipo_entrada')}>
              <option value="">Seleccione</option>
              <option value="ajuste">Ajuste</option>
              <option value="compra">Compra</option>
              <option value="devolucion">Devolución</option>
              <option value="inventario_inicial">Inventario Inicial</option>
            </Form.Control>
          </Col>

          <Col md={4}>
            <Form.Label>Referencia</Form.Label>
            <Form.Control value={form.numero_referencia} onChange={onChange('numero_referencia')} />
          </Col>

          <Col md={6}>
            <Form.Label>Proveedor</Form.Label>
            <Form.Control as="select" value={form.proveedor} onChange={onChange('proveedor')}>
              <option value="">Seleccione</option>
              {(proveedores || []).map((p) => (
                <option key={p.id} value={p.nombre}>{p.nombre}</option>
              ))}
            </Form.Control>
          </Col>

          <Col md={6}>
            <Form.Label>Centro de Costo</Form.Label>
            <Form.Control as="select" value={form.centro_costo} onChange={onChange('centro_costo')}>
              <option value="">Seleccione</option>
              {(centrosCosto || []).map((cc) => (
                <option key={cc.id} value={cc.nombre}>{cc.nombre}</option>
              ))}
            </Form.Control>
          </Col>

          <Col md={6}>
            <Form.Label>Cuenta Contable</Form.Label>
            <Form.Control as="select" value={form.cuenta_contable} onChange={onChange('cuenta_contable')}>
              <option value="">Seleccione</option>
              {(cuentasContables || []).map((ct) => (
                <option key={ct.id} value={ct.nombre}>{ct.nombre}</option>
              ))}
            </Form.Control>
          </Col>
        </Row>

        <Card className="p-2 mb-2 mt-3" style={{ background: '#f7f9fc' }}>
          <Row className="g-2">
            <Col md={4}>
              <Form.Label>Categoría</Form.Label>
              <Form.Control as="select" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
                <option value="">Seleccione</option>
                {(categorias || []).map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </Form.Control>
            </Col>
            <Col md={4}>
              <Form.Label>Subcategoría</Form.Label>
              <Form.Control as="select" value={subcategoriaNombre} onChange={(e) => setSubcategoriaNombre(e.target.value)} disabled={!categoriaId}>
                <option value="">Seleccione</option>
                {(subcategorias || []).map(sc => <option key={sc.id} value={sc.nombre}>{sc.nombre}</option>)}
              </Form.Control>
            </Col>
          </Row>

          <Row className="g-2 mt-1 align-items-end">
            <Col md={3}>
              <Form.Label>SKU</Form.Label>
              <Form.Control as="select" value={draft.skuId} onChange={(e) => setDraft({ ...draft, skuId: e.target.value })}>
                <option value="">Seleccione</option>
                {skuOptions.map(s => <option key={s.id} value={s.id}>{s.codigo_sku} - {(s.nombre || s.descripcion)}</option>)}
              </Form.Control>
            </Col>
            <Col md={2}>
              <Form.Label>Costo</Form.Label>
              <Form.Control type="number" step="0.01" value={draft.costo} onChange={(e) => setDraft({ ...draft, costo: e.target.value })} />
            </Col>
            <Col md={2}>
              <Form.Label>Cantidad</Form.Label>
              <Form.Control type="number" step="1" value={draft.cantidad} onChange={(e) => setDraft({ ...draft, cantidad: e.target.value })} />
            </Col>
            <Col md={2}>
              <Form.Label>Lote</Form.Label>
              <Form.Control value={draft.lote} onChange={(e) => setDraft({ ...draft, lote: e.target.value })} disabled={permitirSinLoteVencimiento} placeholder={permitirSinLoteVencimiento ? 'N/A' : ''} />
            </Col>
            <Col md={2}>
              <Form.Label>Vencimiento</Form.Label>
              <Form.Control type="date" value={draft.fecha_vencimiento} onChange={(e) => setDraft({ ...draft, fecha_vencimiento: e.target.value })} disabled={permitirSinLoteVencimiento} />
            </Col>
            <Col md={1}>
              <Button variant="success" onClick={addItem}>Agregar</Button>
            </Col>
          </Row>

          <Row className="g-2 mt-2">
            <Col md={12}>
              <Form.Check
                type="checkbox"
                id="chk-sin-lote-venc"
                label="Agregar sin Lote y Fecha de Vencimiento"
                checked={permitirSinLoteVencimiento}
                onChange={(e) => setPermitirSinLoteVencimiento(e.target.checked)}
              />
            </Col>
          </Row>
        </Card>

        <Table bordered size="sm" className="mt-2">
          <thead className="table-primary">
            <tr>
              <th>SKU</th>
              <th>Descripción</th>
              <th>Costo</th>
              <th>Cantidad</th>
              <th>IVA</th>
              <th>Total</th>
              <th>Lote</th>
              <th>Vence</th>
              <th>Acciones</th> {/* ✅ Nueva columna */}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center text-muted">Sin ítems</td>
              </tr>
            ) : items.map((it, idx) => (
              <tr key={idx}>
                <td>{it.sku}</td>
                <td>{it.descripcion}</td>
                <td>{Number(it.costo).toFixed(2)}</td>
                <td>{it.cantidad}</td>
                <td>{Number(it.iva).toFixed(2)}</td>
                <td>{Number(it.total).toFixed(2)}</td>
                <td>{it.lote || ''}</td>
                <td>{it.fecha_vencimiento || ''}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => eliminarItem(idx)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="text-end fw-bold mt-2" style={{ fontSize: '1.1rem' }}>
          Total General: {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalGeneral)}
        </div>

        <div className="d-flex gap-2 mt-3">
          <Button type="submit">Guardar</Button>
          <Button variant="secondary" onClick={() => setShowForm(false)}>
            Regresar al listado
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default EntradaForm;
