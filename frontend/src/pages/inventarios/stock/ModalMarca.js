import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Table } from 'react-bootstrap';
import { useMyContext } from './Context';
import { useForm } from 'react-hook-form';

const ModalMarca = () => {
  const {
    show,
    showModal,
    enviarDatos,
    proveedorSeleccionado,
    modoFormulario,
    actualizarProveedor,
  } = useMyContext();

  const { register, handleSubmit, setValue, reset } = useForm();
  const readOnly = modoFormulario === 'ver';

  useEffect(() => {
    if (modoFormulario === 'crear') {
      reset();
    }

    if ((modoFormulario === 'editar' || modoFormulario === 'ver') && proveedorSeleccionado) {
      Object.entries(proveedorSeleccionado).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [modoFormulario, proveedorSeleccionado, reset, setValue]);

  const onSubmit = (data) => {
    if (modoFormulario === 'crear') {
      enviarDatos(data);
    } else if (modoFormulario === 'editar') {
      actualizarProveedor(data);
    }
  };

  return (
    <Modal show={show} onHide={showModal} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          {modoFormulario === 'crear' && 'Nuevo SKU'}
          {modoFormulario === 'editar' && 'Editar SKU'}
          {modoFormulario === 'ver' && 'Ver SKU'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Nombre *</Form.Label>
              <Form.Control type="text" {...register("nombre")} disabled={readOnly} />
            </Col>
            <Col md={6}>
              <Form.Label>Código SKU *</Form.Label>
              <Form.Control type="text" {...register("codigo_sku")} disabled={readOnly} />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Label>Estado</Form.Label>
              <Form.Control as="select" {...register("estado")} disabled={readOnly}>
                <option value="alta">Alta</option>
                <option value="baja">Baja</option>
              </Form.Control>
            </Col>
            <Col md={4}>
              <Form.Label>Categoría</Form.Label>
              <Form.Control type="text" {...register("categoria")} disabled={readOnly} />
            </Col>
            <Col md={4}>
              <Form.Label>Subcategoría</Form.Label>
              <Form.Control type="text" {...register("subcategoria")} disabled={readOnly} />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Marca</Form.Label>
              <Form.Control type="text" {...register("marca")} disabled={readOnly} />
            </Col>
            <Col md={6}>
              <Form.Label>Principio activo</Form.Label>
              <Form.Control type="text" {...register("principio_activo")} disabled={readOnly} />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Unidad de compra</Form.Label>
              <Form.Control type="text" {...register("unidad_compra")} disabled={readOnly} />
            </Col>
            <Col md={6}>
              <Form.Label>Unidad de despacho</Form.Label>
              <Form.Control type="text" {...register("unidad_despacho")} disabled={readOnly} />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Unidades por paquete</Form.Label>
              <Form.Control type="number" {...register("unidades_por_paquete")} disabled={readOnly} />
            </Col>
            <Col md={6}>
              <Form.Label>Activo</Form.Label>
              <Form.Control as="select" {...register("is_active")} disabled={readOnly}>
                <option value={true}>Sí</option>
                <option value={false}>No</option>
              </Form.Control>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Descripción en estado de cuenta</Form.Label>
            <Form.Control as="textarea" rows={2} {...register("descripcion_estado_cuenta")} disabled={readOnly} />
          </Form.Group>

          {modoFormulario === 'ver' && proveedorSeleccionado?.bodegas?.length > 0 && (
            <div className="mt-4">
              <h6 className="mb-2">Bodegas</h6>
              <Table size="sm" bordered responsive>
                <thead className="table-light">
                  <tr>
                    <th className="text-center">Nombre Bodega</th>
                    <th className="text-center">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {proveedorSeleccionado.bodegas.map((bodega, idx) => (
                    <tr key={idx}>
                      <td className="text-center">{bodega.nombre_bodega}</td>
                      <td className="text-center">{bodega.cantidad}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button variant="secondary" onClick={showModal}>Cerrar</Button>
            {modoFormulario !== 'ver' && (
              <Button variant="primary" type="submit">Guardar</Button>
            )}
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalMarca;
