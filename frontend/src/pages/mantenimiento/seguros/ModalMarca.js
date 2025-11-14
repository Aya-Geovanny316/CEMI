import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useMyContext } from './Context';

const ModalCliente = () => {
  const {
    show, showModal, enviarDatos,
    proveedorSeleccionado, modoFormulario, actualizarProveedor
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
    <Modal show={show} onHide={showModal} centered size="lg" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          {modoFormulario === 'crear' && 'Nuevo Cliente / Empresa'}
          {modoFormulario === 'editar' && 'Editar Cliente / Empresa'}
          {modoFormulario === 'ver' && 'Ver Cliente / Empresa'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)}>

          {/* Sección: Datos de empresa */}
          <h6 className='mt-2 mb-3'>Información general</h6>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Nombre*</Form.Label>
              <Form.Control
                type="text"
                {...register("nombre")}
                disabled={readOnly}
                placeholder="Nombre del cliente o empresa"
              />
            </Col>
            <Col md={6}>
              <Form.Label>NIT*</Form.Label>
              <Form.Control
                type="text"
                {...register("nit")}
                disabled={readOnly}
                placeholder="NIT"
              />
            </Col>
          </Row>

          <Row className="mb-3">
          <Col md={12}>
              <Form.Label>Dirección*</Form.Label>
              <Form.Control
                type="text"
                {...register("direccion")}
                disabled={readOnly}
                placeholder="Dirección"
              />
            </Col>
          </Row>

          {/* Sección: Contacto */}
          <h6 className='mt-4 mb-3'>Información de contacto</h6>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Nombre del contacto*</Form.Label>
              <Form.Control
                type="text"
                {...register("contacto_nombre")}
                disabled={readOnly}
                placeholder="Nombre del contacto"
              />
            </Col>
            <Col md={3}>
              <Form.Label>Correo</Form.Label>
              <Form.Control
                type="email"
                {...register("contacto_correo")}
                disabled={readOnly}
                placeholder="correo@ejemplo.com"
              />
            </Col>
            <Col md={3}>
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="text"
                {...register("contacto_telefono")}
                disabled={readOnly}
                placeholder="Teléfono"
              />
            </Col>
          </Row>

          {/* Botones */}
          <div className="d-flex justify-content-end gap-2 mt-4">
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

export default ModalCliente;