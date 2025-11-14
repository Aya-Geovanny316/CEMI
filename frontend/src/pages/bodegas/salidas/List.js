import React, { useContext } from 'react';
import { Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import { AppContext } from './Context';

const ListSalidas = () => {
  const { salidas, filters, setFilters, page, setPage, nextUrl, prevUrl, setShowForm, setSelectedSalida, setShowDetail, bodegas } = useContext(AppContext);

  // Roles: 10 solo ver; 12 puede agregar
  const roles = (JSON.parse(localStorage.getItem('user') || '{}')?.roles || []).map(r => r.id);
  const isAdmin = roles.includes(1);
  const canAdd = isAdmin || roles.includes(12);

  return (
    <Card className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="m-0">Salidas</h5>
        <Button
          disabled={!canAdd}
          onClick={() => { if (!canAdd) return; setSelectedSalida(null); setShowForm(true); }}
        >
          Nueva Salida
        </Button>
      </div>

      <Row className="mb-2">
        <Col md={3}><Form.Control type="date" value={filters.fecha} onChange={e => setFilters(f => ({ ...f, fecha: e.target.value }))}/></Col>
        <Col md={3}>
          <Form.Control as="select" value={filters.bodega} onChange={e => setFilters(f => ({ ...f, bodega: e.target.value }))}>
            <option value="">Bodega</option>
            {bodegas.map(b => <option key={b.id} value={b.nombre}>{b.nombre}</option>)}
          </Form.Control>
        </Col>
        <Col md={3}>
          <Form.Control as="select" value={filters.tipo} onChange={e => setFilters(f => ({ ...f, tipo: e.target.value }))}>
            <option value="">Tipo</option>
            <option value="ajuste">Ajuste</option>
            <option value="devolucion">Devolución</option>
            <option value="perdida">Pérdida</option>
            <option value="destruccion">Destrucción</option>
            <option value="venta">Venta</option>
            <option value="paciente">Paciente</option>
          </Form.Control>
        </Col>
      </Row>

      <Table bordered size="sm">
        <thead className="table-primary">
          <tr>
            <th>ID</th><th>Fecha</th><th>Bodega</th><th>Tipo</th><th>Área</th><th>Admisión</th><th>Observaciones</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {salidas.length === 0 ? (
            <tr><td colSpan={8} className="text-center text-muted">Sin salidas</td></tr>
          ) : salidas.map(e => (
            <tr key={e.id}>
              <td>{e.id}</td>
              <td>{new Date(e.created_at).toLocaleString()}</td>
              <td>{e.bodega}</td>
              <td>{e.tipo_salida}</td>
              <td>{e.area || ''}</td>
              <td>{e.admision || ''}</td>
              <td>{e.observaciones || ''}</td>
              <td>
                <Button size="sm" variant="outline-primary" onClick={() => { setSelectedSalida(e); setShowDetail(true); }}>Ver</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-end mt-2 gap-2">
        <Button size="sm" disabled={!prevUrl} onClick={() => setPage(p => Math.max(1, p-1))}>Prev</Button>
        <Button size="sm" disabled={!nextUrl} onClick={() => setPage(p => p+1)}>Next</Button>
      </div>
    </Card>
  );
};

export default ListSalidas;
