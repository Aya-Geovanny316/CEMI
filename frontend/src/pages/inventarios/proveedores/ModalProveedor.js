import React, { useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useMyContext } from './Context';
import { useForm } from 'react-hook-form';

const ModalProveedor = () => {
  const {
    show, showModal, enviarDatos,
    proveedorSeleccionado, modoFormulario, actualizarProveedor
  } = useMyContext();

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();
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
    <Modal show={show} onHide={showModal} size="xl" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          {modoFormulario === 'crear' && 'Nuevo proveedor'}
          {modoFormulario === 'editar' && 'Editar proveedor'}
          {modoFormulario === 'ver' && 'Ver proveedor'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div className="row mb-3">
            <Form.Group className="col-md-2">
              <Form.Label>NIT *</Form.Label>
              <Form.Control {...register("nit")} disabled={readOnly} />
            </Form.Group>

            <Form.Group className="col-md-4">
              <Form.Label>Nombre *</Form.Label>
              <Form.Control as="textarea" rows={1} {...register("nombre")} disabled={readOnly} />
            </Form.Group>

            <Form.Group className="col-md-4">
              <Form.Label>Dirección</Form.Label>
              <Form.Control {...register("direccion")} disabled={readOnly} />
            </Form.Group>
          </div>

          <div className="row mb-3">
            <Form.Group className="col-md-2">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control {...register("telefono")} disabled={readOnly} />
            </Form.Group>

            <Form.Group className="col-md-3">
              <Form.Label>Correo</Form.Label>
              <Form.Control type="email" {...register("correo")} disabled={readOnly} />
            </Form.Group>

            <Form.Group className="col-md-3">
              <Form.Label>Página Web</Form.Label>
              <Form.Control
                type="text"
                {...register("pagina_web", {
                  setValueAs: value => {
                    if (!value) return '';
                    if (/^https?:\/\//.test(value)) return value; // ya tiene http o https
                    return 'https://' + value;
                  },
                  pattern: {
                    value: /^(https?:\/\/)(www\.)?[a-zA-Z0-9.-]+\.[a-z]{2,}$/,
                    message: 'Formato de URL inválido. Ej: www.ejemplo.com',
                  }
                })}
                disabled={readOnly}
              />
              {errors.pagina_web && (
                <Form.Text className="text-danger">{errors.pagina_web.message}</Form.Text>
              )}
            </Form.Group>

            <Form.Group className="col-md-2">
              <Form.Label>Estado</Form.Label>
              <Form.Control as="select" {...register("estado")} disabled={readOnly}>
                <option value="alta">Alta</option>
                <option value="baja">Baja</option>
              </Form.Control>
            </Form.Group>

            <Form.Group className="col-md-2">
              <Form.Label>Observaciones</Form.Label>
              <Form.Control as="textarea" rows={1} {...register("observaciones")} disabled={readOnly} />
            </Form.Group>
          </div>

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

export default ModalProveedor;
