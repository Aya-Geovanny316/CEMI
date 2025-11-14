import React, { useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useForm } from 'react-hook-form';
import { useMyContext } from './Context';

const ModalMedidas = () => {
  const {
    show, showModal, enviarDatos, actualizarProveedor,
    proveedorSeleccionado, modoFormulario,
    categorias, marcas, unidadMedida, bodega
  } = useMyContext();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm();

  const readOnly = modoFormulario === 'ver';

  useEffect(() => {
    if (modoFormulario === 'crear') {
      reset({
        codigo_sku: '',
        nombre: '',
        estado: 'alta',
        categoria: '',
        marca: '',
        subcategoria: '',
        principio_activo: '',
        cantidad: 0,
        unidad_compra: '',
        unidad_despacho: '',
        unidades_por_paquete: 1,
        descripcion_estado_cuenta: ''
      });
    }

    if ((modoFormulario === 'editar' || modoFormulario === 'ver') && proveedorSeleccionado) {
      Object.entries(proveedorSeleccionado).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [modoFormulario, proveedorSeleccionado, reset, setValue]);

  const onSubmit = (data) => {
    console.log("SUBMIT DATA", data);
    const cantidadAdicional = parseInt(data.cantidad_adicional || 0);
    let nuevasBodegas = [];

    if (modoFormulario === 'crear') {
      nuevasBodegas = [{
        nombre_bodega: bodega[0]?.nombre,
        cantidad: parseInt(data.cantidad) || 0,
      }];

      const jsonData = {
        ...data,
        bodegas: nuevasBodegas,
        is_active: true
      };

      enviarDatos(jsonData);
    } else {
      if (proveedorSeleccionado?.bodegas && proveedorSeleccionado.bodegas.length > 0) {
        nuevasBodegas = proveedorSeleccionado.bodegas.map(b => {
          if (b.nombre_bodega === bodega[0]?.nombre) {
            return {
              ...b,
              cantidad: b.cantidad + cantidadAdicional
            };
          }
          return b;
        });

        if (!nuevasBodegas.find(b => b.nombre_bodega === bodega[0]?.nombre)) {
          nuevasBodegas.push({
            nombre_bodega: bodega[0]?.nombre,
            cantidad: cantidadAdicional
          });
        }
      } else {
        nuevasBodegas = [{
          nombre_bodega: bodega[0]?.nombre,
          cantidad: cantidadAdicional
        }];
      }

      const jsonData = {
        ...proveedorSeleccionado,
        ...data,
        bodegas: nuevasBodegas
      };

      actualizarProveedor(jsonData);
    }
  };

  return (
    <Modal show={show} onHide={showModal} size="lg" centered scrollable>
      <Modal.Header closeButton className="bg-light border-bottom">
        <Modal.Title className="text-uppercase" style={{ fontSize: '16px' }}>
          {modoFormulario === 'crear' && 'Nuevo SKU'}
          {modoFormulario === 'editar' && 'Editar SKU'}
          {modoFormulario === 'ver' && 'Ver SKU'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Estado *</Form.Label>
                <Form.Control as="select" {...register('estado', { required: true })} readOnly={readOnly}>
                  <option value="alta">Alta</option>
                  <option value="baja">Baja</option>
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Categoría *</Form.Label>
                <Form.Control as="select" {...register('categoria', { required: true })} readOnly={readOnly}>
                  <option value="">Seleccionar</option>
                  {categorias?.map((data, i) => (
                    <option key={i} value={data.nombre}>{data.nombre}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Marca *</Form.Label>
                <Form.Control as="select" {...register('marca', { required: true })} readOnly={readOnly}>
                  <option value="">Seleccionar</option>
                  {marcas?.map((data, i) => (
                    <option key={i} value={data.nombre}>{data.nombre}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Principio activo</Form.Label>
                <Form.Control {...register('principio_activo')} readOnly={readOnly} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Sub Categoría *</Form.Label>
                <Form.Control {...register('subcategoria', { required: true })} readOnly={readOnly} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Clasificación del producto *</Form.Label>
                <Form.Control
                  as="select"
                  {...register('clasificacion_producto', { required: true })}
                  readOnly={readOnly}
                  disabled={readOnly} // por compatibilidad visual
                >
                  <option value="">Seleccionar</option>
                  <option value="consignacion">Consignación</option>
                  <option value="controlado">Controlado</option>
                </Form.Control>
              </Form.Group>
            </Col>

          </Row>

          <Row className="mt-2">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Código SKU *</Form.Label>
                <Form.Control {...register('codigo_sku', { required: true })} readOnly={readOnly} />
                {errors.codigo_sku && <small className="text-danger">Código SKU es obligatorio</small>}
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Nombre *</Form.Label>
                <Form.Control {...register('nombre', { required: true })} readOnly={readOnly} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Cantidad (stock inicial)</Form.Label>
                <Form.Control type="number" {...register('cantidad')} readOnly={readOnly} />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mt-2">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Unidad de Compra *</Form.Label>
                <Form.Control {...register('unidad_compra', { required: true })} readOnly={readOnly} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Unidad de despacho *</Form.Label>
                <Form.Control as="select" {...register('unidad_despacho', { required: true })} readOnly={readOnly}>
                  <option value="">Seleccionar</option>
                  {unidadMedida?.map((data, i) => (
                    <option key={i} value={data.nombre}>{data.nombre}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Unidades x paquete *</Form.Label>
                <Form.Control type="number" min={1} {...register('unidades_por_paquete', { required: true })} readOnly={readOnly} />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mt-2">
            <Col>
              <Form.Group>
                <Form.Label>Descripción en el Estado de Cuenta *</Form.Label>
                <Form.Control as="textarea" rows={2} {...register('descripcion_estado_cuenta')} readOnly={readOnly} />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" onClick={showModal} className="me-2">
              Cancelar
            </Button>
            {modoFormulario !== 'ver' && (
              <Button type="submit" variant="primary">Guardar</Button>
            )}
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalMedidas;
