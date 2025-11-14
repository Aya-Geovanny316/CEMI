import React, { useState } from 'react';
import { Table, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { usePreciosContext } from './Context';

const ListadoPrecios = () => {
  const {
    skus,
    skusFiltrados,
    buscandoSkus,
    buscarSkusPorCodigoOBarras,
    limpiarFiltroSkus,
    abrirModalEditarPrecios,
  } = usePreciosContext();

  const [term, setTerm] = useState('');

  const handleBuscar = async (e) => {
    e.preventDefault();
    await buscarSkusPorCodigoOBarras(term);
  };

  const handleLimpiar = () => {
    setTerm('');
    limpiarFiltroSkus();
  };

  const lista = skusFiltrados ?? skus;

  return (
    <div className="mt-4">
      <h5 className="mb-3">Listado de SKUs</h5>

      {/* 🔎 Filtro por nombre, código SKU o código de barras */}
      <Form onSubmit={handleBuscar} className="mb-3">
        <InputGroup>
          <Form.Control
            placeholder="Buscar por nombre, código SKU o código de barras..."
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleBuscar(e);
              }
            }}
          />
          <Button type="submit" variant="primary" disabled={buscandoSkus}>
            {buscandoSkus ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" /> Buscando...
              </>
            ) : (
              'Buscar'
            )}
          </Button>
          <Button
            type="button"
            variant="outline-secondary"
            onClick={handleLimpiar}
          >
            Limpiar
          </Button>
        </InputGroup>
      </Form>

      <div className="table-responsive">
        <Table bordered hover size="sm">
          <thead className="table-primary text-dark">
            <tr>
              <th>Nombre</th>
              <th>Código SKU</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(lista || []).map((sku, idx) => (
              <tr key={idx}>
                <td>{sku.nombre}</td>
                <td>{sku.codigo_sku}</td>
                <td className="text-center">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => abrirModalEditarPrecios(sku)}
                  >
                    Ver precios
                  </Button>
                </td>
              </tr>
            ))}

            {(!lista || lista.length === 0) && (
              <tr>
                <td colSpan={3} className="text-center py-4">
                  {buscandoSkus ? 'Buscando…' : 'Sin SKUs para mostrar.'}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default ListadoPrecios;
