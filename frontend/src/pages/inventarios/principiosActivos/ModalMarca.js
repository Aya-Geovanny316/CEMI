import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
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
    setResetForm // 👈 recibido del Context para registrar reset()
  } = useMyContext();

  const { register, handleSubmit, setValue, reset } = useForm({
    defaultValues: {
      nombre: '',
      estado: 'alta'
    }
  });

  const readOnly = modoFormulario === 'ver';

  // Registrar la función reset en el contexto para que "Nuevo" pueda limpiar antes de abrir
  useEffect(() => {
    if (typeof setResetForm === 'function') {
      setResetForm(() => reset);
    }
  }, [reset, setResetForm]);

  // Sincronizar datos según modo
  useEffect(() => {
    if (modoFormulario === 'crear') {
      reset({ nombre: '', estado: 'alta' });
    }

    if ((modoFormulario === 'editar' || modoFormulario === 'ver') && proveedorSeleccionado) {
      Object.entries(proveedorSeleccionado).forEach(([k, value]) => {
        setValue(k, value ?? '');
      });
    }
  }, [modoFormulario, proveedorSeleccionado, reset, setValue]);

  const onSubmit = (formData) => {
    if (modoFormulario === 'crear') {
      enviarDatos(formData);
    } else if (modoFormulario === 'editar') {
      actualizarProveedor(formData);
    }
  };

  return (
    <Modal show={show} onHide={showModal} size="sm" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          {modoFormulario === 'crear' && 'Nuevo principio activo'}
          {modoFormulario === 'editar' && 'Editar principio activo'}
          {modoFormulario === 'ver' && 'Ver principio activo'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group className="mb-3">
            <Form.Label>Nombre *</Form.Label>
            <Form.Control
              as="textarea"
              rows={1}
              {...register("nombre")}
              disabled={readOnly}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Estado</Form.Label>
            <Form.Control as="select" {...register("estado")} disabled={readOnly}>
              <option value="alta">Alta</option>
              <option value="baja">Baja</option>
            </Form.Control>
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
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