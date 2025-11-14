import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import { useMyContext } from './Context';
import { useForm } from 'react-hook-form';

const ModalMarca = () => {
  const {
    show, showModal, enviarDatos,
    proveedorSeleccionado, modoFormulario, actualizarProveedor
  } = useMyContext();

  const { register, handleSubmit, setValue, reset } = useForm();
  const [key, setKey] = useState('contables');
  const readOnly = modoFormulario === 'ver';

  useEffect(() => {
    if (modoFormulario === 'crear') {
      reset(); // limpia todos los campos
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
      console.log("Datos editados", data);
      actualizarProveedor(data)
    }
  };


  return (
    <Modal show={show} onHide={showModal} size="sm" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          {modoFormulario === 'crear' && 'Nuevo proveedor'}
          {modoFormulario === 'editar' && 'Editar proveedor'}
          {modoFormulario === 'ver' && 'Ver proveedor'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group>
            <Form.Label>Nombre *</Form.Label>
            <Form.Control as="textarea" rows={1} {...register("nombre")} disabled={readOnly} />
          </Form.Group>

          <Form.Group>
            <Form.Label>Estado</Form.Label>
            <Form.Control as="select" {...register("estado")} disabled={readOnly}>
              <option value="alta">Alta</option>
              <option value="baja">Baja</option>
            </Form.Control>
          </Form.Group>
          <div className='d-flex justify-content-end'>
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