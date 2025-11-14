// List.js
import React, { useContext, useMemo, useState } from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FiEye, FiEdit, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { AppContext } from './Context';

const List = () => {
  const { abrirModal, requisiciones, bodegas } = useContext(AppContext);
  const [bodega, setBodega] = useState('');
  const [estatus, setEstatus] = useState('pendiente');

  // Roles desde localStorage para habilitar edición sólo a 1, 11, 14
  const roles = (JSON.parse(localStorage.getItem('user') || '{}')?.roles || []).map(r => r.id);
  const canEdit = roles.includes(1) || roles.includes(11) || roles.includes(14);

  const filteredData = useMemo(() => {
    const rows = Array.isArray(requisiciones) ? requisiciones : [];
    return rows.filter((r) => {
      const okB = !bodega || (String(r.bodega_nombre || r.bodega || '').toLowerCase() === String(bodega).toLowerCase());
      const okE = !estatus || String(r.estado || '').toLowerCase() === String(estatus).toLowerCase();
      return okB && okE;
    });
  }, [requisiciones, bodega, estatus]);

  return (
    <div className="mb-4">
      <h5 className="mb-3">Listado de Requisiciones</h5>

      <div className="mb-3">
        <div className="row g-2 align-items-end">
          <div className="col-md-5">
            <label>Bodega</label>
            <select className="form-control" value={bodega} onChange={(e)=>setBodega(e.target.value)}>
              <option value="">Todas</option>
              {(bodegas || []).map((b) => (
                <option key={b.id} value={b.nombre}>{b.nombre}</option>
              ))}
            </select>
          </div>
          <div className="col-md-5">
            <label>Estatus</label>
            <select className="form-control" value={estatus} onChange={(e)=>setEstatus(e.target.value)}>
              <option value="pendiente">Pendiente</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
              <option value="cerrada">Cerrada</option>
            </select>
          </div>
          <div className="col-md-2">
            <Button className="w-100" onClick={()=>{ setBodega(''); setEstatus('pendiente'); }}>Limpiar</Button>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-sm mt-2">
          <thead className="table-primary text-dark fw-semibold">
            <tr>
              <th className="text-center">No. Requisicion</th>
              <th className="text-center">Fecha</th>
              <th className="text-center">Usuario</th>
              <th className="text-center">Centro de Costo</th>
              <th className="text-center">Departamento</th>
              <th className="text-center">Bodega</th>
              <th className="text-center">Descripcion</th>
              <th className="text-center">Tipo de Requisicion</th>
              <th className="text-center">Proveedor</th>
              <th className="text-center">Prioridad</th>
              <th className="text-center">Estatus</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted">No se encontraron resultados</td>
              </tr>
            ) : (
              filteredData.map((req, idx) => (
                <tr key={idx}>
                  <td className="text-center">{req.id}</td>
                  <td className="text-center">{req.fecha}</td>
                  <td className="text-center">{req.usuario || '-'}</td>
                  <td className="text-center">{req.centro_costo || '-'}</td>
                  <td className="text-center">{req.area_solicitante || '-'}</td>
                  <td className="text-center">{req.bodega_nombre || req.bodega}</td>
                  <td className="text-center">{req.descripcion}</td>
                  <td className="text-center">{String(req.tipo_requisicion || '').replace(/^./, c=>c.toUpperCase())}</td>
                  <td className="text-center">{req.proveedor_nombre || req.proveedor || '-'}</td>
                  <td>{String(req.prioridad || '').replace(/^./, c=>c.toUpperCase())}</td>
                  <td className="text-center">{String(req.estado || '').replace(/^./, c=>c.toUpperCase())}</td>
                  <td className="text-center">
                    <OverlayTrigger overlay={<Tooltip>Ver Detalle</Tooltip>}>
                      <Button className="btn btn-outline-secondary btn-sm" onClick={() => abrirModal(req, 'ver')}>
                        <FiEye />
                      </Button>
                    </OverlayTrigger>
                    {canEdit && (
                      <OverlayTrigger overlay={<Tooltip>Editar</Tooltip>}>
                        <Button className="btn btn-outline-secondary btn-sm ms-1" onClick={() => abrirModal(req, 'editar')}>
                          <FiEdit />
                        </Button>
                      </OverlayTrigger>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-end mt-3">
        <Button className="me-2" disabled>
          <FiChevronLeft />
        </Button>
        <Button disabled>
          <FiChevronRight />
        </Button>
      </div>
    </div>
  );
};

export default List;
