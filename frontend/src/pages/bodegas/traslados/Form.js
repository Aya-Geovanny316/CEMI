import React, { useContext, useMemo, useState, useEffect } from 'react';
import { Card, Form, Row, Col, Button, Table } from 'react-bootstrap';
import { AppContext } from './Context';
import { getData } from '../../../apiService';

const TrasladoForm = () => {
  const {
    setShowForm,
    bodegas, categorias, subcategorias, skus,
    getSubcategoriasByCategoria,
    crearTraslado,
    departamentos,
    usuarios,
  } = useContext(AppContext);

  const [form, setForm] = useState({
    bodega_origen: '',
    bodega_destino: '',
    comentarios: '',
    departamento: '',
    entregamos_a: '',
  });
  const [categoriaId, setCategoriaId] = useState('');
  const [subcategoriaNombre, setSubcategoriaNombre] = useState('');
  const [draft, setDraft] = useState({ skuId: '', cantidad: '' });
  const [items, setItems] = useState([]);

  const [deptoSel, setDeptoSel] = useState('');

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

  const filteredUsuarios = useMemo(() => {
    let list = Array.isArray(usuarios) ? usuarios : [];
    // Solo activos
    list = list.filter(u => u.is_active !== false);
    if (!deptoSel) return list;
    const sel = String(deptoSel).toLowerCase().trim();
    return list.filter(u => (u.perfil?.departamento_laboral || '').toLowerCase().trim() === sel);
  }, [usuarios, deptoSel]);

  const addItem = () => {
    const skuObj = skuOptions.find(s => String(s.id) === String(draft.skuId));
    if (!skuObj) return;
    const cantidad = Number(draft.cantidad || 0);
    if (cantidad <= 0) return;
    setItems(prev => [...prev, {
      sku: skuObj.codigo_sku,
      descripcion: skuObj.nombre || skuObj.descripcion || '',
      cantidad,
    }]);
    setDraft({ skuId: '', cantidad: '' });
  };

  const eliminarItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.entregamos_a) {
      alert('Seleccione la persona a quien se entrega (obligatorio).');
      return;
    }
    const payload = { ...form, items };
    const res = await crearTraslado(payload);
    if (res?.status === 201) setShowForm(false);
  };

  return (
    <Card className="p-3">
      <h5 className="mb-3">Nuevo Traslado</h5>
      <Form onSubmit={onSubmit}>
        <Row className="g-3">
          <Col md={6}>
            <Form.Label>Bodega Origen</Form.Label>
            <Form.Control as="select" value={form.bodega_origen} onChange={onChange('bodega_origen')}>
              <option value="">Seleccione</option>
              {bodegas.map(b => <option key={b.id} value={b.nombre}>{b.nombre}</option>)}
            </Form.Control>
          </Col>
          <Col md={6}>
            <Form.Label>Bodega Destino</Form.Label>
            <Form.Control as="select" value={form.bodega_destino} onChange={onChange('bodega_destino')}>
              <option value="">Seleccione</option>
              {bodegas.map(b => <option key={b.id} value={b.nombre}>{b.nombre}</option>)}
            </Form.Control>
          </Col>
          <Col md={12}>
            <Form.Label>Comentarios</Form.Label>
            <Form.Control as="textarea" rows={2} value={form.comentarios} onChange={onChange('comentarios')} />
          </Col>
          <Col md={6}>
            <Form.Label>Departamento</Form.Label>
            <Form.Control as="select" value={deptoSel} onChange={(e) => { const v = e.target.value; setDeptoSel(v); setForm(f => ({ ...f, departamento: v, entregamos_a: '' })); }}>
              <option value="">Seleccione</option>
              {(departamentos || []).map(d => (
                <option key={d.id} value={d.nombre}>{d.nombre}</option>
              ))}
            </Form.Control>
            <Form.Label className="mt-2">Entregamos a</Form.Label>
            <Form.Control as="select" value={form.entregamos_a} onChange={onChange('entregamos_a')} required>
              <option value="">Seleccione usuario</option>
              {filteredUsuarios.map(u => (
                <option key={u.id} value={u.username}>{u.username} - {u.first_name} {u.last_name}</option>
              ))}
            </Form.Control>
          </Col>
        </Row>

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
            <Col md={6}>
              <Form.Label>SKU</Form.Label>
              <Form.Control as="select" value={draft.skuId} onChange={(e) => setDraft({ ...draft, skuId: String(e.target.value) })}>
                <option value="">Seleccione</option>
                {skuOptions.map(s => <option key={s.id} value={s.id}>{s.codigo_sku} - {(s.nombre || s.descripcion)}</option>)}
              </Form.Control>
            </Col>
            <Col md={3}>
              <Form.Label>Cantidad</Form.Label>
              <Form.Control type="number" step="1" value={draft.cantidad} onChange={(e) => setDraft({ ...draft, cantidad: String(e.target.value) })} />
            </Col>
            <Col md={2}>
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
                  <Button variant="danger" size="sm" onClick={() => eliminarItem(idx)}>Eliminar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="d-flex gap-2 mt-3">
          <Button type="submit">Enviar</Button>
          <Button variant="secondary" onClick={() => setShowForm(false)}>Regresar al listado</Button>
        </div>
      </Form>
    </Card>
  );
};

export default TrasladoForm;
