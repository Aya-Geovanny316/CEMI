// Form.js
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AppContext } from './Context';
import { Form, Button, Row, Col, Card, Table } from 'react-bootstrap';

const FormularioRequisicion = () => {
  const {
    crearRequisicion,
    bodegas,
    proveedores,
    categorias,
    skus,
    centrosCosto,
    departamentos,
    // NUEVO:
    subcategorias,
    loadingSubcats,
    getSubcategoriasByCategoria,
    setSubcategorias
  } = useContext(AppContext);

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    reset,
  } = useForm();

  const tipoRequisicion = watch('tipo_requisicion');
  const categoriaSeleccionada = watch('categoria'); // id de categoría
  const subcategoriaSeleccionada = watch('subcategoria'); // id de subcategoría

  const [productos, setProductos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [descripcionServicio, setDescripcionServicio] = useState('');
  const [cantidadServicio, setCantidadServicio] = useState('');
  const [precioServicio, setPrecioServicio] = useState('');

  // NUEVO: cuando cambia la categoría, traer subcategorías
  useEffect(() => {
    if (categoriaSeleccionada) {
      getSubcategoriasByCategoria(categoriaSeleccionada);
    } else {
      setSubcategorias([]);
    }
  }, [categoriaSeleccionada, getSubcategoriasByCategoria, setSubcategorias]);

  const filteredSkus = useMemo(() => {
    const catNombre = categorias.find((c) => String(c.id) === String(categoriaSeleccionada))?.nombre;
    const subcatNombre = subcategorias.find((s) => String(s.id) === String(subcategoriaSeleccionada))?.nombre;
    return skus.filter((sku) => {
      const matchCat = !catNombre || sku.categoria === catNombre;
      const matchSub = !subcatNombre || (sku.subcategoria || '') === subcatNombre;
      return matchCat && matchSub;
    });
  }, [skus, categorias, subcategorias, categoriaSeleccionada, subcategoriaSeleccionada]);

  const totalGeneral = useMemo(() => {
    const arr = tipoRequisicion === 'servicio' ? servicios : productos;
    return arr.reduce((sum, it) => sum + (parseFloat(it.total) || 0), 0);
  }, [tipoRequisicion, productos, servicios]);

  const handleEliminarProducto = (id) => setProductos((prev) => prev.filter((p) => p.id !== id));
  const handleEliminarServicio = (id) => setServicios((prev) => prev.filter((s) => s.id !== id));

  const handleAgregarProducto = () => {
    const values = getValues();

    const skuId = values.SKU;
    const cantidad = values.cantidadSku;
    const precio = values.precioSku;
    const skuObj = skus.find((s) => String(s.id) === String(skuId));
    const skuCodigo = skuObj?.codigo_sku || '';
    const descripcion = skuObj?.nombre || skuObj?.descripcion || '';
    const unidad = skuObj?.unidad_despacho || skuObj?.unidad_compra || '';

    if (!skuId || !cantidad || !precio) {
      alert('Todos los campos del producto son obligatorios');
      return;
    }

    const nuevo = {
      id: Date.now(),
      sku: skuCodigo,
      descripcion,
      unidad,
      cantidad: parseFloat(cantidad),
      precio: parseFloat(precio),
      total: parseFloat(cantidad) * parseFloat(precio),
    };

    setProductos((prev) => [...prev, nuevo]);
  };

  const handleAgregarServicio = () => {
    if (!descripcionServicio || !cantidadServicio || !precioServicio) {
      alert('Todos los campos del servicio son obligatorios');
      return;
    }

    const nuevo = {
      id: Date.now(),
      descripcion: descripcionServicio,
      cantidad: parseFloat(cantidadServicio),
      precio: parseFloat(precioServicio),
      total: parseFloat(cantidadServicio) * parseFloat(precioServicio),
    };

    setServicios([...servicios, nuevo]);
    setDescripcionServicio('');
    setCantidadServicio('');
    setPrecioServicio('');
  };

  const onSubmit = (data) => {
    crearRequisicion(data, productos, servicios);
    reset();
    setProductos([]);
    setServicios([]);
  };

  return (
    <Card className="p-4 my-3">
      <h4 className="mb-4">Generar Requisición</h4>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Bodega</Form.Label>
              <Form.Control as="select" {...register('bodega')}>
                <option value="">Seleccione</option>
                {bodegas.map((bodega) => (
                  <option key={bodega.id} value={bodega.nombre}>
                    {bodega.nombre}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Prioridad</Form.Label>
              <Form.Control as="select" {...register('prioridad')}>
                <option value="">Seleccione</option>
                <option value="urgente">Urgente</option>
                <option value="alta">Alta</option>
                <option value="normal">Normal</option>
                <option value="baja">Baja</option>
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Centro de Costo</Form.Label>
              <Form.Control as="select" {...register('centro_costo')}>
                <option value="">Seleccione</option>
                {centrosCosto.map((cc) => (
                  <option key={cc.id} value={cc.nombre}>
                    {cc.nombre}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Departamento</Form.Label>
              <Form.Control as="select" {...register('area_solicitante')}>
                <option value="">Seleccione</option>
                {departamentos.map((d) => (
                  <option key={d.id} value={d.nombre}>
                    {d.nombre}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Motivo de la solicitud"
            {...register('descripcion')}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Tipo de Requisición</Form.Label>
          <Form.Control as="select" {...register('tipo_requisicion')}>
            <option value="">Seleccione</option>
            <option value="bien">Bien</option>
            <option value="servicio">Servicio</option>
          </Form.Control>
        </Form.Group>

        {/* Proveedor (requerido para ambos tipos) */}
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Proveedor</Form.Label>
              <Form.Control as="select" size="sm" {...register('proveedor')}>
                <option value="">Selecciona un proveedor</option>
                {proveedores.map((prov) => (
                  <option key={prov.id} value={prov.nombre}>
                    {prov.nombre}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>

        {tipoRequisicion === 'bien' && (
          <>
            <Card className="p-3 mb-3" style={{ backgroundColor: '#f7f9fc' }}>
              <Row className="align-items-end">
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label><strong>Categoría</strong></Form.Label>
                    <Form.Control as="select" size="sm" {...register('categoria')}>
                      <option value="">Selecciona una categoría</option>
                      {categorias.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>

                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label><strong>Subcategoría</strong></Form.Label>
                    <Form.Control
                      as="select"
                      size="sm"
                      {...register('subcategoria')}
                      disabled={!categoriaSeleccionada || loadingSubcats}
                    >
                      <option value="">
                        {loadingSubcats ? 'Cargando subcategorías…' : 'Selecciona una subcategoría'}
                      </option>
                      {subcategorias.map((sc) => (
                        <option key={sc.id} value={sc.id}>
                          {sc.nombre}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>

                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label><strong>Seleccionar SKU</strong></Form.Label>
                    <Form.Control as="select" size="sm" style={{ minWidth: '220px' }} {...register('SKU')}>
                      <option value="">Selecciona un SKU</option>
                      {filteredSkus.map((sku) => (
                        <option key={sku.id} value={sku.id}>
                          {sku.codigo_sku} - {sku.descripcion ?? sku.nombre}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>

                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label><strong>Cantidad</strong></Form.Label>
                    <Form.Control
                      type="number"
                      size="sm"
                      min="1"
                      style={{ minWidth: '220px' }}
                      {...register('cantidadSku')}
                    />
                  </Form.Group>
                </Col>

                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label><strong>Precio</strong></Form.Label>
                    <Form.Control
                      type="number"
                      size="sm"
                      step="0.01"
                      min="0"
                      style={{ minWidth: '220px' }}
                      {...register('precioSku')}
                    />
                  </Form.Group>
                </Col>

                <Col md={1} className="mb-3 d-flex align-items-end">
                  <Button type="button" variant="success" onClick={handleAgregarProducto}>
                    Agregar
                  </Button>
                </Col>
              </Row>
            </Card>

            <h6 className="mt-4">Productos agregados:</h6>

            <Table bordered size="sm" className="mt-2">
              <thead style={{ backgroundColor: '#d2e8ff' }}>
                <tr>
                  <th>Código / SKU</th>
                  <th>Descripción</th>
                  <th>Unidad de Medida</th>
                  <th>Cantidad Solicitada</th>
                  <th>Precio</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {productos.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted">
                      No hay productos agregados
                    </td>
                  </tr>
                ) : (
                  productos.map((item) => (
                    <tr key={item.id}>
                      <td>{item.sku}</td>
                      <td>{item.descripcion}</td>
                      <td>{item.unidad}</td>
                      <td>{item.cantidad}</td>
                      <td>{item.precio.toFixed(2)}</td>
                      <td>{item.total.toFixed(2)}</td>
                      <td>
                        <Button variant="outline-danger" size="sm" onClick={() => handleEliminarProducto(item.id)}>
                          Quitar
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>

            <div className="text-end fw-bold" style={{ fontSize: '1.1rem' }}>Total General: {totalGeneral.toFixed(2)}</div>
          </>
        )}

        {tipoRequisicion === 'servicio' && (
          <>
            <Card className="p-3 mt-3" style={{ backgroundColor: '#f7f9fc' }}>
              <Row>
                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label><strong>Descripción</strong></Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ej: Reparación de aire"
                      value={descripcionServicio}
                      onChange={(e) => setDescripcionServicio(e.target.value)}
                    />
                  </Form.Group>
                </Col>

                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label><strong>Cantidad</strong></Form.Label>
                    <Form.Control
                      type="number"
                      step="1"
                      min="1"
                      value={cantidadServicio}
                      onChange={(e) => setCantidadServicio(e.target.value)}
                    />
                  </Form.Group>
                </Col>

                <Col md={2} className="mb-3">
                  <Form.Group>
                    <Form.Label><strong>Precio</strong></Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      value={precioServicio}
                      onChange={(e) => setPrecioServicio(e.target.value)}
                    />
                  </Form.Group>
                </Col>

                <Col md={2} className="mb-3 d-flex align-items-end">
                  <Button variant="success" onClick={handleAgregarServicio}>
                    Agregar Servicio
                  </Button>
                </Col>
              </Row>
            </Card>

            <h6 className="mt-4">Servicios agregados:</h6>

            <Table bordered size="sm" className="mt-2">
              <thead style={{ backgroundColor: '#d2e8ff' }}>
                <tr>
                  <th>Descripción</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {servicios.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      No hay servicios agregados
                    </td>
                  </tr>
                ) : (
                  servicios.map((item) => (
                    <tr key={item.id}>
                      <td>{item.descripcion}</td>
                      <td>{item.cantidad}</td>
                      <td>{item.precio.toFixed(2)}</td>
                      <td>{item.total.toFixed(2)}</td>
                      <td>
                        <Button variant="outline-danger" size="sm" onClick={() => handleEliminarServicio(item.id)}>
                          Quitar
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>

            <div className="text-end fw-bold" style={{ fontSize: '1.1rem' }}>Total General: {totalGeneral.toFixed(2)}</div>
          </>
        )}

        <div className="mt-4">
          <Button variant="primary" type="submit">
            Guardar Requisición
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default FormularioRequisicion;
