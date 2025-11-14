// Listado de Requisiciones Autorizadas para Orden de Compra
import React, { useContext, useState } from 'react';
import { Table, Spinner } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { AppContext } from './Context';
import { getBinary } from '../../../../apiService';

const FormularioOrdenCompra = (props) => {
  const { soloAprobadas, loading, crearOCDesdeRequisicion, openPreview } = useContext(AppContext);
  const { history } = props;
  const [openingId, setOpeningId] = useState(null);

  const onRowClick = async (row) => {
    try {
      setOpeningId(row.id);
      const oc = await crearOCDesdeRequisicion(row.id);
      const ocId = oc?.id;
      if (ocId) history.push(`/dashboard/bodegas/compras/orden/${ocId}`);
    } catch (e) {
      console.error('No se pudo crear/recuperar la OC', e?.response?.data || e.message);
      alert('No se pudo abrir la Orden de Compra. Verifique su sesión o intente de nuevo.');
    } finally {
      setOpeningId(null);
    }
  };

  const onClickImprimir = async (ocId, ocNumero) => {
    try {
      const res = await getBinary(`compras/ordenes-compra/${ocId}/pdf/`);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orden_compra_${ocNumero || ocId}.pdf`;
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
    <div className="container mt-4">
      <h4 className="mb-3">Orden de compra</h4>

      {loading ? (
        <Spinner animation="border" variant="primary" />
      ) : soloAprobadas.length === 0 ? (
        <p className="text-muted">No hay requisiciones aprobadas.</p>
      ) : (
        <div className="table-responsive">
          <Table striped bordered hover size="sm">
            <thead className="table-primary">
              <tr>
                <th>No. orden de compra</th>
                <th>Fecha</th>
                <th>Proveedor</th>
                <th>Solicitante-Bodega</th>
                <th>Tipo de requisición</th>
                <th>Total</th>
                <th>Estatus</th>
                <th className="text-center" style={{width: 220}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {soloAprobadas.map((req) => (
                <tr key={req.id} style={{ cursor: 'pointer' }} onClick={() => onRowClick(req)}>
                  <td>{req.numero_orden_compra}</td>
                  <td>{req.fecha}</td>
                  <td>{req.proveedor_nombre || ''}</td>
                  <td>{req.solicitante_bodega}</td>
                  <td>{req.tipo_requisicion}</td>
                  <td>{req.total}</td>
                  <td>{req.estatus}</td>
                  <td className="text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-secondary" onClick={() => openPreview(req)}>Visualizar</button>
                      <button className="btn btn-primary" disabled={openingId === req.id} onClick={() => onRowClick(req)}>
                        {openingId === req.id ? 'Abriendo...' : 'Abrir'}
                      </button>
                      {req.oc_estatus === 'GENERADA' && req.oc_id && (
                        <button className="btn btn-outline-info" onClick={() => onClickImprimir(req.oc_id, req.oc_numero)}>Imprimir</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default withRouter(FormularioOrdenCompra);
