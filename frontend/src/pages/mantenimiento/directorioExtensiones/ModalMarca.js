import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useMyContext } from './Context';
import { useForm } from 'react-hook-form';

const ModalDirectorio = () => {
  const {
    show,
    showModal,
    enviarDatos,
    proveedorSeleccionado,
    modoFormulario,
    actualizarProveedor
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
    <Modal show={show} onHide={showModal} size="sm" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          {modoFormulario === 'crear' && 'Nuevo Registro de Directorio'}
          {modoFormulario === 'editar' && 'Editar Registro'}
          {modoFormulario === 'ver' && 'Ver Registro'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group controlId="formNivel">
            <Form.Label>Nivel*</Form.Label>
            <Form.Control type="text" {...register("nivel")} disabled={readOnly} />
          </Form.Group>

          <Form.Group controlId="formArea">
            <Form.Label>ÁREA*</Form.Label>
            <Form.Control as="select" {...register("area")} disabled={readOnly}>
              <option value="">SELECCIONE UN ÁREA</option>
              <option value="SIN AREA">SIN AREA</option>
              <option value="EMERGENCIA">EMERGENCIA</option>
              <option value="ENCAMAMIENTO">ENCAMAMIENTO</option>
              <option value="INTENSIVO">INTENSIVO</option>
              <option value="SALA OPERACIONES">SALA OPERACIONES</option>
              <option value="NEONATOS">NEONATOS</option>
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="formNombre">
            <Form.Label>Nombre*</Form.Label>
            <Form.Control type="text" {...register("nombre")} disabled={readOnly} />
          </Form.Group>

          <Form.Group controlId="formExtension">
            <Form.Label>Extensión*</Form.Label>
            <Form.Control type="text" {...register("extension")} disabled={readOnly} />
          </Form.Group>

          <div className="d-flex justify-content-end mt-3">
            <Button variant="secondary" onClick={showModal}>
              Cerrar
            </Button>
            {modoFormulario !== 'ver' && (
              <Button type="submit" variant="primary" className="ml-2">
                Guardar
              </Button>
            )}
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalDirectorio;