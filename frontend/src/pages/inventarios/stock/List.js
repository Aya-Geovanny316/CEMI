import React, { useState } from 'react';
import { Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { useMyContext } from './Context';
import { FiChevronLeft, FiChevronRight, FiEye, FiPlus } from 'react-icons/fi';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const Marcas = () => {
  const {
    data,
    dataFiltrada,
    buscando,
    bodega,
    nextPage,
    prevPage,
    nullNextPage,
    nullPrevPage,
    buscarSkusStock,
    limpiarFiltroSkusStock,
    actualizarBodegaSKU,
    abrirModalVer
  } = useMyContext();

  const [inputs, setInputs] = useState({});
  const [term, setTerm] = useState('');
  const [mostrarColumnaAgregar, setMostrarColumnaAgregar] = useState(false);

  const handleInputChange = (skuId, value) => {
    setInputs(prev => ({ ...prev, [skuId]: value }));
  };

  const handleGuardar = async (sku) => {
    const cantidadAdicional = parseInt(inputs[sku.id]);
    if (isNaN(cantidadAdicional) || cantidadAdicional <= 0) return;

    // Clonar bodegas existentes
    const nuevasBodegas = sku.bodegas.map(b => {
      if (b.nombre_bodega === bodega[0]?.nombre) {
        return {
          ...b,
          cantidad: b.cantidad + cantidadAdicional
        };
      }
      return b;
    });

    // Si la bodega no existe todavía, agregarla
    if (!nuevasBodegas.find(b => b.nombre_bodega === bodega[0]?.nombre)) {
      nuevasBodegas.push({
        nombre_bodega: bodega[0]?.nombre,
        cantidad: cantidadAdicional
      });
    }

    const payload = {
      ...sku,
      bodegas: nuevasBodegas
    };

    await actualizarBodegaSKU(sku.id, payload);
    setInputs(prev => ({ ...prev, [sku.id]: '' }));
  };

  const handleBuscar = async (e) => {
    e.preventDefault();
    await buscarSkusStock(term);
  };

  const handleLimpiar = () => {
    setTerm('');
    limpiarFiltroSkusStock();
  };

  const lista = dataFiltrada ?? data;

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Existencias Actuales</h5>
        {/* <Button
          variant="outline-primary"
          size="sm"
          onClick={() => setMostrarColumnaAgregar(prev => !prev)}
        >
          <FiPlus className="me-1" />
          {mostrarColumnaAgregar ? 'Ocultar Agregar' : 'Agregar a Principal'}
        </Button> */}
      </div>

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
          <Button type="submit" variant="primary" disabled={buscando}>
            {buscando ? (
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
        <table className="table table-bordered table-sm mt-2 mb-0">
          <thead className="table-primary text-dark fw-semibold">
            <tr>
              <th className="text-center">ID</th>
              <th className="text-center">Nombre</th>
              <th className="text-center">Código SKU</th>
              {bodega.map((b, idx) => (
                <th key={idx} className="text-center">{b.nombre}</th>
              ))}
              {mostrarColumnaAgregar && (
                <th className="text-center">Agregar a Principal</th>
              )}
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(lista || []).map((sku, idx) => {
              const total = sku.bodegas?.reduce((sum, b) => sum + (b.cantidad || 0), 0);

              return (
                <tr key={idx}>
                  <td className="text-center">{sku.id}</td>
                  <td>{sku.nombre}</td>
                  <td>{sku.codigo_sku}</td>
                  {bodega.map((b, i) => {
                    const stock = sku.bodegas?.find(x => x.nombre_bodega === b.nombre);
                    const cantidad = stock ? stock.cantidad : 0;

                    let backgroundColor = '#d4edda'; // verde pastel
                    let textColor = '#155724';

                    if (cantidad <= 25) {
                      backgroundColor = '#f8d7da';
                      textColor = '#721c24';
                    } else if (cantidad <= 100) {
                      backgroundColor = '#fff3cd';
                      textColor = '#856404';
                    }

                    return (
                      <td
                        key={i}
                        className="text-center fw-bold"
                        style={{ backgroundColor, color: textColor }}
                      >
                        {cantidad}
                      </td>
                    );
                  })}

                  {mostrarColumnaAgregar && (
                    <td className="text-center align-middle">
                      <div
                        className="d-flex justify-content-center align-items-center gap-2"
                        style={{ flexWrap: 'wrap', minWidth: 180 }}
                      >
                        <Form.Control
                          type="number"
                          min="1"
                          style={{ width: '90px' }}
                          value={inputs[sku.id] || ''}
                          onChange={(e) => handleInputChange(sku.id, e.target.value)}
                        />
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleGuardar(sku)}
                        >
                          Guardar
                        </Button>
                      </div>
                    </td>
                  )}

                  <td className="text-center">
                    <OverlayTrigger overlay={<Tooltip>Ver SKU</Tooltip>}>
                      <Button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => abrirModalVer(sku)}
                      >
                        <FiEye />
                      </Button>
                    </OverlayTrigger>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-end mt-2">
        <Button onClick={prevPage} disabled={dataFiltrada !== null || nullPrevPage === null}><FiChevronLeft /></Button>
        <Button onClick={nextPage} disabled={dataFiltrada !== null || nullNextPage === null}><FiChevronRight /></Button>
      </div>
    </div>
  );
};

export default Marcas;
