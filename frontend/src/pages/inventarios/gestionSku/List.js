import React, { useMemo, useState } from 'react';
import { OverlayTrigger, Tooltip, Button, InputGroup, Form, Spinner } from 'react-bootstrap';
import { FiEye, FiEdit, FiChevronLeft, FiChevronRight, FiTrash2, FiTruck } from 'react-icons/fi';
import { useMyContext } from './Context';

const Medidas = () => {
  const {
    data,
    skusFiltrados,
    buscando,
    searchNext,
    searchPrev,
    abrirModalCrear,
    abrirModalEditar,
    abrirModalVer,
    prevPage,
    nextPage,
    nullPrevPage,
    nullNextPage,
    eliminarProveedor,
    abrirModalMovimiento,
    role,
    buscarSkusGlobal,
    limpiarFiltroSkus,
    buscarSkusNextPage,
    buscarSkusPrevPage,
  } = useMyContext();

  const [term, setTerm] = useState('');

  const filtered = useMemo(() => {
    const toL = (s) => String(s || '').toLowerCase();
    const q = toL(term);
    const base = skusFiltrados ?? data;
    const rows = Array.isArray(base) ? base : [];
    const f = !q
      ? rows
      : rows.filter((r) => (
          toL(r.nombre).includes(q) ||
          toL(r.codigo_sku).includes(q) ||
          toL(r.codigo_barras).includes(q)
        ));
    return [...f].sort((a, b) => String(a.codigo_sku || '').localeCompare(String(b.codigo_sku || '')));
  }, [data, skusFiltrados, term]);

  const handleBuscar = async (e) => {
    e?.preventDefault?.();
    await buscarSkusGlobal(term);
  };

  const handleLimpiar = () => {
    setTerm('');
    limpiarFiltroSkus();
  };

  const handleVer = (prov) => abrirModalVer(prov);
  const handleEditar = (prov) => abrirModalEditar(prov);

  return (
    <div className="mb-4">
      <h5 className="mb-3">Gestión de SKU</h5>

      <div className="mb-3">
        <div className="row g-2">
          <div className="col-12 col-md-10">
            <Form onSubmit={handleBuscar}>
              <InputGroup>
                <Form.Control
                  placeholder="Buscar por nombre, código SKU o código de barras..."
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleBuscar(e);
                    if (e.key === 'Escape') handleLimpiar();
                  }}
                />
                <Button type="submit" variant="primary" disabled={buscando}>
                  {buscando ? (<><Spinner animation="border" size="sm" className="me-2"/>Buscando...</>) : 'Buscar'}
                </Button>
                <Button type="button" variant="outline-secondary" onClick={handleLimpiar}>Limpiar</Button>
              </InputGroup>
            </Form>
          </div>
          <div className="col-12 col-md-2">
            <Button className="w-100" onClick={abrirModalCrear}>
              Nuevo Producto
            </Button>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-sm mt-2">
          <thead className="table-primary text-dark fw-semibold text-center">
            <tr>
              <th>Interno</th>
              <th>Código</th>
              <th>Nombre</th>
              <th>Marca</th>
              <th>Medida</th>
              <th>Categoría</th>
              <th>Sub Categoría</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((sku, idx) => (
              <tr key={idx}>
                <td>{sku.id}</td>
                <td>{sku.codigo_sku}</td>
                <td>{sku.nombre}</td>
                <td>{sku.marca}</td>
                <td>{sku.unidad_despacho}</td>
                <td>{sku.categoria}</td>
                <td>{sku.subcategoria}</td>
                <td>{sku.estado === 'alta' ? 'Disponible' : 'No Disponible'}</td>
                <td className="text-center">
                  <OverlayTrigger overlay={<Tooltip>Ver</Tooltip>}>
                    <Button className="btn btn-outline-secondary btn-sm me-1" onClick={() => handleVer(sku)}>
                      <FiEye />
                    </Button>
                  </OverlayTrigger>
                  <OverlayTrigger overlay={<Tooltip>Editar</Tooltip>}>
                    <Button className="btn btn-outline-secondary btn-sm me-1" onClick={() => handleEditar(sku)}>
                      <FiEdit />
                    </Button>
                  </OverlayTrigger>
                  {/* <OverlayTrigger overlay={<Tooltip>Eliminar</Tooltip>}>
                    <Button className="btn btn-outline-secondary btn-sm me-1" onClick={() => eliminarProveedor(sku.id)}>
                      <FiTrash2 />
                    </Button>
                  </OverlayTrigger>
                  <OverlayTrigger overlay={<Tooltip>Movimiento</Tooltip>}>
                    <Button className="btn btn-outline-secondary btn-sm" onClick={() => abrirModalMovimiento(sku)}>
                      <FiTruck />
                    </Button>
                  </OverlayTrigger> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-end mt-3">
        <Button
          onClick={skusFiltrados !== null ? buscarSkusPrevPage : prevPage}
          disabled={skusFiltrados !== null ? (searchPrev === null) : (nullPrevPage === null)}
          className="me-2"
        >
          <FiChevronLeft />
        </Button>
        <Button
          onClick={skusFiltrados !== null ? buscarSkusNextPage : nextPage}
          disabled={skusFiltrados !== null ? (searchNext === null) : (nullNextPage === null)}
        >
          <FiChevronRight />
        </Button>
      </div>
    </div>
  );
};

export default Medidas;
