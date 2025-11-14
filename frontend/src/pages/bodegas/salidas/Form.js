import React, { useContext, useMemo, useState, useEffect } from 'react';
import { Card, Form, Row, Col, Button, Table } from 'react-bootstrap';
import { AppContext } from './Context';

const SalidaForm = () => {
  const {
    setShowForm,
    selectedSalida,
    bodegas, centrosCosto, cuentasContables, categorias, subcategorias, skus,
    getSubcategoriasByCategoria,
    crearSalida,
    areas,
    admisionesPorArea,
  } = useContext(AppContext);

  const [form, setForm] = useState({
    bodega: '',
    tipo_salida: '',
    observaciones: '',
    centro_costo: '',
    cuenta_contable: '',
  });
  const [categoriaId, setCategoriaId] = useState('');
  const [subcategoriaNombre, setSubcategoriaNombre] = useState('');
  const [draft, setDraft] = useState({ skuId: '', cantidad: '' });
  const [items, setItems] = useState([]);
  // Paciente
  const [areaSel, setAreaSel] = useState('');
  const [admisionSel, setAdmisionSel] = useState('');

  useEffect(() => {
    if (selectedSalida) {
      setForm({
        bodega: selectedSalida.bodega || '',
        tipo_salida: selectedSalida.tipo_salida || '',
        observaciones: selectedSalida.observaciones || '',
        centro_costo: selectedSalida.centro_costo || '',
        cuenta_contable: selectedSalida.cuenta_contable || '',
      });
      setItems(selectedSalida.items || []);
    }
  }, [selectedSalida]);

  const onChange = (k) => (e) => {
    const val = e && e.target ? e.target.value : e;
    setForm((f) => ({ ...f, [k]: val != null ? String(val) : '' }));
  };

  const skuOptions = useMemo(() => {
    let base = skus || [];
    if (categoriaId) {
      const cat = categorias.find(c => String(c.id) === String(categoriaId));
      const nombreCat = cat?.nombre;
      if (nombreCat) base = base.filter(s => (s.categoria || '') === nombreCat);
    }
    if (subcategoriaNombre) base = base.filter(s => (s.subcategoria || '') === subcategoriaNombre);
    return base;
  }, [skus, categorias, categoriaId, subcategoriaNombre]);

  useEffect(() => {
    if (categoriaId) getSubcategoriasByCategoria(categoriaId);
    setSubcategoriaNombre('');
  }, [categoriaId, getSubcategoriasByCategoria]);

  const addItem = () => {
    const skuObj = skuOptions.find(s => String(s.id) === String(draft.skuId));
    if (!skuObj) return;
    const costo = Number(skuObj?.costo || 0);
    const cantidad = Number(draft.cantidad || 0);
    const gravaIva = (skuObj.iva || '').toString().trim() !== '';
    const _round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;
    const precio_sin_iva = _round2(gravaIva ? (costo / 1.12) : costo);
    const iva = _round2(gravaIva ? (costo - precio_sin_iva) : 0);
    const total = _round2(costo * cantidad);
    setItems(prev => [...prev, {
      sku: skuObj.codigo_sku,
      descripcion: skuObj.nombre || skuObj.descripcion || '',
      costo, cantidad, precio_sin_iva, iva, total,
    }]);
    setDraft({ skuId: '', cantidad: '' });
  };

  const removeItem = (index) => setItems(prev => prev.filter((_, i) => i !== index));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!items.length) {
      window?.NotificationManager?.warning?.('Debe agregar al menos un SKU a la salida.', 'Validación', 4000);
      return;
    }
    const hasMissingSku = items.some(it => !String(it?.sku || '').trim());
    if (hasMissingSku) {
      window?.NotificationManager?.warning?.('Todos los ítems de la salida deben tener un SKU válido.', 'Validación', 4000);
      return;
    }
    try {
      // El backend de salidas no acepta "lote" ni "fecha_vencimiento" en items.
      // Enviar solo las llaves soportadas para evitar 400 (campos desconocidos).
      const cleanItems = items.map(({ sku, descripcion, costo, cantidad, precio_sin_iva, iva, total }) => ({
        sku,
        descripcion,
        costo,
        cantidad,
        precio_sin_iva,
        iva,
        total,
      }));
      // Preparar payload incluyendo área/admision para tipo 'paciente'
      const extra = (form.tipo_salida === 'paciente') ? { area: areaSel || null, admision: admisionSel ? Number(admisionSel) : null } : {};
      const payload = { ...form, ...extra, items: cleanItems };
      const res = await crearSalida(payload);
      if (res?.status === 201) setShowForm(false);
    } catch (err) {
      // Mostrar mensaje claro cuando el backend devuelva 400
      const msg = err?.response?.data?.error || err?.response?.data || 'No se pudo crear la salida';
      window?.NotificationManager?.error?.(typeof msg === 'string' ? msg : JSON.stringify(msg), 'Error', 5000);
    }
  };

  return (
    <Card className="p-3">
      <h5 className="mb-3">{selectedSalida ? 'Editar Salida' : 'Nueva Salida'}</h5>
      <Form onSubmit={onSubmit}>
        <Row className="g-3">
          <Col md={4}>
            <Form.Label>Bodega</Form.Label>
            <Form.Control as="select" value={form.bodega} onChange={onChange('bodega')}>
              <option value="">Seleccione</option>
              {bodegas.map(b => <option key={b.id} value={b.nombre}>{b.nombre}</option>)}
            </Form.Control>
          </Col>
          <Col md={4}>
            <Form.Label>Tipo de Salida</Form.Label>
            <Form.Control as="select" value={form.tipo_salida} onChange={onChange('tipo_salida')}>
              <option value="">Seleccione</option>
              <option value="ajuste">Ajuste</option>
              <option value="devolucion">Devolución</option>
              <option value="perdida">Pérdida</option>
              <option value="destruccion">Destrucción</option>
              <option value="venta">Venta</option>
              <option value="paciente">Paciente</option>
            </Form.Control>
          </Col>
          <Col md={4}>
            <Form.Label>Centro de Costo</Form.Label>
            <Form.Control as="select" value={form.centro_costo} onChange={onChange('centro_costo')}>
              <option value="">Seleccione</option>
              {centrosCosto.map(cc => <option key={cc.id} value={cc.nombre}>{cc.nombre}</option>)}
            </Form.Control>
          </Col>
          <Col md={4}>
            <Form.Label>Cuenta Contable</Form.Label>
            <Form.Control as="select" value={form.cuenta_contable} onChange={onChange('cuenta_contable')}>
              <option value="">Seleccione</option>
              {cuentasContables.map(ct => <option key={ct.id} value={ct.nombre}>{ct.nombre}</option>)}
            </Form.Control>
          </Col>
          <Col md={12}>
            <Form.Label>Observaciones</Form.Label>
            <Form.Control as="textarea" rows={2} value={form.observaciones || ''} onChange={onChange('observaciones')} />
          </Col>
        </Row>

        {form.tipo_salida === 'paciente' && (
          <Card className="p-2 mb-2 mt-2" style={{ background: '#fff7ed' }}>
            <Row className="g-2">
              <Col md={4}>
                <Form.Label>Área</Form.Label>
                <Form.Control as="select" value={areaSel} onChange={(e) => { setAreaSel(e.target.value); setAdmisionSel(''); }}>
                  <option value="">Seleccione área</option>
                  {(areas || []).map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </Form.Control>
              </Col>
              <Col md={8}>
                <Form.Label>Admisión</Form.Label>
                <Form.Control as="select" value={admisionSel} onChange={(e) => setAdmisionSel(e.target.value)} disabled={!areaSel}>
                  <option value="">Seleccione admisión</option>
                  {(admisionesPorArea?.[areaSel] || []).map((ad) => {
                    const p = ad.paciente || {};
                    const nombre = [p.primer_nombre, p.segundo_nombre, p.primer_apellido, p.segundo_apellido, p.apellido_casada].filter(Boolean).join(' ');
                    return (
                      <option key={ad.id} value={ad.id}>{ad.id} - {nombre}</option>
                    );
                  })}
                </Form.Control>
              </Col>
            </Row>
          </Card>
        )}

        <Card className="p-2 mb-2 mt-3" style={{ background: '#f7f9fc' }}>
          <Row className="g-2">
            <Col md={4}>
              <Form.Label>Categoría</Form.Label>
              <Form.Control as="select" value={categoriaId} onChange={(e) => setCategoriaId(String(e.target.value))}>
                <option value="">Seleccione</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </Form.Control>
            </Col>
            <Col md={4}>
              <Form.Label>Subcategoría</Form.Label>
              <Form.Control as="select" value={subcategoriaNombre} onChange={(e) => setSubcategoriaNombre(String(e.target.value))} disabled={!categoriaId}>
                <option value="">Seleccione</option>
                {subcategorias.map(sc => <option key={sc.id} value={sc.nombre}>{sc.nombre}</option>)}
              </Form.Control>
            </Col>
          </Row>
          <Row className="g-2 mt-1 align-items-end">
            <Col md={3}>
              <Form.Label>SKU</Form.Label>
              <Form.Control as="select" value={draft.skuId} onChange={(e) => setDraft({ ...draft, skuId: String(e.target.value) })}>
                <option value="">Seleccione</option>
                {skuOptions.map(s => <option key={s.id} value={s.id}>{s.codigo_sku} - {(s.nombre || s.descripcion)}</option>)}
              </Form.Control>
            </Col>
            <Col md={2}>
              <Form.Label>Cantidad</Form.Label>
              <Form.Control type="number" step="1" value={draft.cantidad} onChange={(e) => setDraft({ ...draft, cantidad: String(e.target.value) })} />
            </Col>
            <Col md={1}>
              <Button variant="success" onClick={addItem}>Agregar</Button>
            </Col>
          </Row>
        </Card>

        <Table bordered size="sm" className="mt-2">
          <thead className="table-primary">
            <tr>
              <th>SKU</th>
              <th>Descripción</th>
              <th>Cantidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={4} className="text-center text-muted">Sin ítems</td></tr>
            ) : items.map((it, idx) => (
              <tr key={idx}>
                <td>{it.sku}</td>
                <td>{it.descripcion}</td>
                <td>{it.cantidad}</td>
                <td>
                  <Button variant="outline-danger" size="sm" onClick={() => removeItem(idx)}>Eliminar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="d-flex gap-2 mt-3">
          <Button type="submit">Aplicar</Button>
          <Button variant="secondary" onClick={() => setShowForm(false)}>
            Regresar al listado
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default SalidaForm;
