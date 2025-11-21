import React, { useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useMyContext } from './Context';

const Movimientos = () => {
  const {
    data,
    prevPage,
    nextPage,
    nullPrevPage,
    nullNextPage,
    // filtros
    bodegas, categorias, subcategorias, skus,
    bodegaSel, setBodegaSel,
    categoriaSel, setCategoriaSel,
    subcategoriaSel, setSubcategoriaSel,
    skuFiltro, setSkuFiltro,
    fechaInicio, setFechaInicio,
    fechaFin, setFechaFin,
    // paginación
    setPage,
  } = useMyContext();

  const filteredSkus = useMemo(() => {
    const catNombre = categorias.find(c => String(c.id) === String(categoriaSel))?.nombre;
    const subNombre = subcategorias.find(s => String(s.id) === String(subcategoriaSel))?.nombre;
    return (skus || []).filter(s => {
      const okCat = !catNombre || s.categoria === catNombre;
      const okSub = !subNombre || (s.subcategoria || '') === subNombre;
      return okCat && okSub;
    });
  }, [skus, categorias, subcategorias, categoriaSel, subcategoriaSel]);

  return (
    <div className="mb-4">
      <h5 className="mb-3">Historial de Movimientos</h5>

      <div className="row g-2 align-items-end mb-3">
        <div className="col-md-3">
          <label>Bodega</label>
          <select className="form-control" value={bodegaSel} onChange={(e) => { setBodegaSel(e.target.value); setPage(1); }}>
            <option value="">Todas</option>
            {(bodegas || []).map(b => (
              <option key={b.id} value={b.nombre}>{b.nombre}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label>Categoría</label>
          <select className="form-control" value={categoriaSel} onChange={(e) => { setCategoriaSel(e.target.value); setPage(1); }}>
            <option value="">Todas</option>
            {(categorias || []).map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label>Subcategoría</label>
          <select className="form-control" value={subcategoriaSel} onChange={(e) => { setSubcategoriaSel(e.target.value); setPage(1); }} disabled={!categoriaSel}>
            <option value="">Todas</option>
            {(subcategorias || []).map(sc => (
              <option key={sc.id} value={sc.id}>{sc.nombre}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label>SKU</label>
          <select className="form-control" value={skuFiltro ?? '__none__'} onChange={(e) => { const val = e.target.value === '__none__' ? null : e.target.value; setSkuFiltro(val); setPage(1); }}>
            <option value="__none__" disabled>Seleccione un SKU…</option>
            <option value="">Todos</option>
            {filteredSkus.map(s => (
              <option key={s.id} value={s.codigo_sku}>{s.codigo_sku} - {s.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="row g-2 align-items-end mb-3">
        <div className="col-md-3">
          <label>Desde</label>
          <input type="date" className="form-control" value={fechaInicio} onChange={(e) => { setFechaInicio(e.target.value); setPage(1); }} />
        </div>
        <div className="col-md-3">
          <label>Hasta</label>
          <input type="date" className="form-control" value={fechaFin} onChange={(e) => { setFechaFin(e.target.value); setPage(1); }} />
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-sm mt-2 mb-0">
          <thead className="table-primary text-dark fw-semibold">
            <tr>
              <th>Fecha-Hora</th>
              <th>SKU</th>
              <th>Nombre</th>
              <th>Movimiento</th>
              <th className="text-end">Cantidad</th>
              <th className="text-end">Inventario</th>
            </tr>
          </thead>
          <tbody>
            {skuFiltro === null ? (
              <tr><td colSpan={6} className="text-center text-muted">Seleccione un SKU para visualizar movimientos</td></tr>
            ) : (!data || data.length === 0) ? (
              <tr><td colSpan={6} className="text-center text-muted">Sin resultados</td></tr>
            ) : data.map((m, idx) => (
              <tr key={idx}>
                <td>{m.fecha_hora}</td>
                <td>{m.sku}</td>
                <td>{m.nombre}</td>
                <td>{m.movimiento}</td>
                <td className="text-end">{parseInt(Number(m.cantidad))}</td>
                <td className="text-end">{parseInt(Number(m.inventario))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-end mt-2 gap-2">
        <Button onClick={prevPage} disabled={nullPrevPage === null}><FiChevronLeft /></Button>
        <Button onClick={nextPage} disabled={nullNextPage === null}><FiChevronRight /></Button>
      </div>
    </div>
  );
};

export default Movimientos;
