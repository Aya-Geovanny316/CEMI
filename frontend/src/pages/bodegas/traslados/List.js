import React, { useContext } from 'react';
import { Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import { AppContext } from './Context';

const ListTraslados = () => {
  const {
    traslados = [],
    filters = { fecha_envio: '', fecha_recibido: '', bodega_origen: '', estatus: '' },
    setFilters,
    page = 1,
    setPage,
    nextUrl,
    prevUrl,
    bodegas,
    setShowForm,
    setSelectedTraslado,
    setShowDetail,
    recibirTraslado,
    anularTraslado,
  } = useContext(AppContext);

  // Roles: 10 solo ver; 12 puede agregar y acciones (recibir/anular)
  const roles = (JSON.parse(localStorage.getItem('user') || '{}')?.roles || []).map(r => r.id);
  const isAdmin = roles.includes(1);
  const canManage = isAdmin || roles.includes(12);
  const canAdd = canManage;

  const bodegasList = Array.isArray(bodegas) ? bodegas : [];

  const onChangeFilter = (key) => (e) => {
    const v = e?.target?.value ?? e;
    setFilters((f) => ({ ...f, [key]: v }));
  };

  return (
    <Card className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="m-0">Traslados</h5>
        <Button disabled={!canAdd} onClick={() => { if (!canAdd) return; setSelectedTraslado(null); setShowForm(true); }}>Nuevo Traslado</Button>
      </div>

      <Row className="mb-2 g-2">
        <Col md={3}>
          <Form.Control type="date" value={filters.fecha_envio || ''} onChange={onChangeFilter('fecha_envio')} />
        </Col>
        <Col md={3}>
          <Form.Control type="date" value={filters.fecha_recibido || ''} onChange={onChangeFilter('fecha_recibido')} />
        </Col>
        <Col md={3}>
          <Form.Control as="select" value={filters.bodega_origen || ''} onChange={onChangeFilter('bodega_origen')}>
            <option value="">Bodega origen</option>
            {bodegasList.map((b) => (
              <option key={b.id} value={b.nombre}>{b.nombre}</option>
            ))}
          </Form.Control>
        </Col>
        <Col md={3}>
          <Form.Control as="select" value={filters.estatus || ''} onChange={onChangeFilter('estatus')}>
            <option value="">Estatus</option>
            <option value="ENVIADO">Enviado</option>
            <option value="RECIBIDO">Recibido</option>
            <option value="ANULADO">Anulado</option>
          </Form.Control>
        </Col>
      </Row>

      <Table bordered hover size="sm" responsive>
        <thead className="table-primary">
          <tr>
            <th>#</th>
            <th>Fecha envío</th>
            <th>Fecha recibido</th>
            <th>Origen</th>
            <th>Destino</th>
            <th>Departamento</th>
            <th>Entregamos a</th>
            <th>Estatus</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {traslados.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t?.fecha_envio ? new Date(t.fecha_envio).toLocaleString() : '-'}</td>
              <td>{t?.fecha_recibido ? new Date(t.fecha_recibido).toLocaleString() : '-'}</td>
              <td>{t?.bodega_origen}</td>
              <td>{t?.bodega_destino}</td>
              <td>{t?.departamento || ''}</td>
              <td>{t?.entregamos_a || ''}</td>
              <td>{t?.estatus}</td>
              <td className="d-flex gap-2">
                <Button size="sm" variant="outline-primary" onClick={() => { setSelectedTraslado(t); setShowDetail(true); }}>Ver</Button>
                {canManage && t?.estatus === 'ENVIADO' && (
                  <>
                    <Button size="sm" variant="success" onClick={() => recibirTraslado(t.id)}>Marcar Recibido</Button>
                    <Button size="sm" variant="outline-danger" onClick={() => anularTraslado(t.id)}>Anular</Button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {traslados.length === 0 && (
            <tr><td colSpan={9} className="text-center">Sin resultados</td></tr>
          )}
        </tbody>
      </Table>

      <div className="d-flex justify-content-end mt-2 gap-2">
        <Button size="sm" disabled={!prevUrl || page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
        <Button size="sm" disabled={!nextUrl} onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>
    </Card>
  );
};

export default ListTraslados;
