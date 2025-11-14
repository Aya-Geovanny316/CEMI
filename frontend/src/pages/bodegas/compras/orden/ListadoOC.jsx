import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Form, Table } from 'react-bootstrap';
import { getData } from '../../../../apiService';
import { withRouter } from 'react-router-dom';

const estatusOpts = [
  { value: 'AUTORIZADA', label: 'Nuevo' }, // GENERADA
  { value: 'EDICION', label: 'Edición' },
  { value: 'ANULADA', label: 'Anulada' },
];

const ListadoOC = ({ history }) => {
  const [rows, setRows] = useState([]);
  const [estatus, setEstatus] = useState('AUTORIZADA');
  const [page, setPage] = useState(1);
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);

  const load = useCallback(async () => {
    const qs = new URLSearchParams({ page: String(page), page_size: '20', estatus });
    const res = await getData(`compras/ordenes-compra/?${qs.toString()}`);
    const data = res?.data || {};
    setRows(data.results || []);
    setNextUrl(data.next || null);
    setPrevUrl(data.previous || null);
  }, [estatus, page]);

  useEffect(() => { load(); }, [load]);

  const goDetail = (id) => {
    if (history && history.push) history.push(`/dashboard/bodegas/compras/orden/${id}`);
    else window.location.hash = `#/dashboard/bodegas/compras/orden/${id}`;
  };

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="m-0">Órdenes de Compra</h5>
        <div className="d-flex align-items-end gap-2">
          <Form.Group className="m-0">
            <Form.Label className="m-0 me-2">Estatus</Form.Label>
            <Form.Control as="select" value={estatus} onChange={(e)=>{ setEstatus(e.target.value); setPage(1); }}>
              {estatusOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Form.Control>
          </Form.Group>
        </div>
      </div>

      <div className="table-responsive">
        <Table bordered hover size="sm">
          <thead className="table-primary">
            <tr>
              <th style={{width: 90}}>No. OC</th>
              <th style={{width: 160}}>Fecha y Hora</th>
              <th>Proveedor</th>
              <th>Solicitante – Bodega</th>
              <th style={{width: 110}} className="text-end">Total</th>
              <th style={{width: 110}}>Estatus</th>
              <th style={{width: 110}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(rows || []).length === 0 ? (
              <tr><td colSpan={7} className="text-center text-muted">Sin órdenes</td></tr>
            ) : (rows || []).map(r => (
              <tr key={r.id}>
                <td title={r.numero}>{r.numero}</td>
                <td>{r.fecha}</td>
                <td>{r.proveedor || '-'}</td>
                <td>{r.solicitante_bodega || '-'}</td>
                <td className="text-end">{Number(r.total || 0).toFixed(2)}</td>
                <td>{r.estatus === 'Autorizada' ? 'Nuevo' : r.estatus}</td>
                <td><Button size="sm" variant="outline-primary" onClick={()=>goDetail(r.id)}>Ver</Button></td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <div className="d-flex justify-content-end mt-2 gap-2">
        <Button size="sm" disabled={!prevUrl || page <= 1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</Button>
        <Button size="sm" disabled={!nextUrl} onClick={()=>setPage(p=>p+1)}>Next</Button>
      </div>
    </div>
  );
};

export default withRouter(ListadoOC);
