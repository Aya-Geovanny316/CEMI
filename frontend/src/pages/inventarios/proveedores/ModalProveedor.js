import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import { useMyContext } from './Context';
import { useForm } from 'react-hook-form';

const ModalProveedor = () => {
  const {
    show, showModal, enviarDatos,
    proveedorSeleccionado, modoFormulario, actualizarProveedor
  } = useMyContext();

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();
  const [key, setKey] = useState('contables');
  const readOnly = modoFormulario === 'ver';

  const [cuentas, setCuentas] = useState([
    { banco: '', tipo: '', numero: '' },
  ]);

  const agregarCuenta = () => {
    setCuentas([...cuentas, { banco: '', tipo: '', numero: '' }]);
  };

  const eliminarCuenta = (index) => {
    if (cuentas.length > 1) {
      const nuevas = cuentas.filter((_, i) => i !== index);
      setCuentas(nuevas);
    }
  };

  const handleChangeCuenta = (index, campo, valor) => {
    const nuevas = [...cuentas];
    nuevas[index][campo] = valor;
    setCuentas(nuevas);
  };

  useEffect(() => {
    if (modoFormulario === 'crear') {
      reset();
      setCuentas([{ banco: '', tipo: '', numero: '' }]);
    }

    if ((modoFormulario === 'editar' || modoFormulario === 'ver') && proveedorSeleccionado) {
      Object.entries(proveedorSeleccionado).forEach(([key, value]) => {
        if (key !== 'cuentas_bancarias') {
          setValue(key, value);
        }
      });

      if (proveedorSeleccionado.cuentas_bancarias) {
        setCuentas(proveedorSeleccionado.cuentas_bancarias);
      }
    }
  }, [modoFormulario, proveedorSeleccionado, reset, setValue]);

  const onSubmit = (data) => {
    const dataFinal = {
      ...data,
      cuentas_bancarias: cuentas,
    };

    if (modoFormulario === 'crear') {
      enviarDatos(dataFinal);
    } else if (modoFormulario === 'editar') {
      actualizarProveedor(dataFinal);
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

          <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
            <Tab eventKey="contables" title="Datos Contables">
              <div className="row">
                <Form.Group className="col-md-3 mb-3">
                  <Form.Label>Tipo *</Form.Label>
                  <Form.Control as="select" {...register("tipo")} disabled={readOnly}>
                    <option value="TIPO 1">TIPO 1</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group className="col-md-3 mb-3">
                  <Form.Label>Moneda *</Form.Label>
                  <Form.Control as="select" {...register("moneda")} disabled={readOnly}>
                    <option value="GTQ - QUETZALES">GTQ - QUETZALES</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group className="col-md-2 mb-3">
                  <Form.Label>Días Crédito</Form.Label>
                  <Form.Control
                    type="number"
                    {...register("dias_credito", {
                      setValueAs: v => v === '' ? null : parseInt(v)
                    })}
                    disabled={readOnly}
                  />
                  <Form.Text muted>Podés dejarlo vacío si no aplica</Form.Text>
                </Form.Group>

                <Form.Group className="col-md-2 mb-3">
                  <Form.Label>Local/Extranjero *</Form.Label>
                  <Form.Control as="select" {...register("local_extranjero")} disabled={readOnly}>
                    <option value="local">Local</option>
                    <option value="extranjero">Extranjero</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group className="col-md-2 mb-3">
                  <Form.Label>País</Form.Label>
                  <Form.Control as="select" {...register("pais")} disabled={readOnly}>
                    <option value="Guatemala">GUATEMALA</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group className="col-md-3 mb-3">
                  <Form.Label>Retener ISR *</Form.Label>
                  <Form.Control as="select" {...register("retener_isr")} disabled={readOnly}>
                    <option value="no">No</option>
                    <option value="si">Sí</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group className="col-md-4 mb-3">
                  <Form.Label>Régimen Contable *</Form.Label>
                  <Form.Control as="select" {...register("regimen_contable")} disabled={readOnly}>
                    <option value="SUJETO A PAGOS TRIMESTRALE">SUJETO A PAGOS TRIMESTRALE</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group className="col-md-5 mb-3">
                  <Form.Label>Cuenta Contable *</Form.Label>
                  <Form.Control as="select" {...register("cuenta_contable")} disabled={readOnly}>
                    <option value="21010101 - PROVEEDORES LOCALES">21010101 - PROVEEDORES LOCALES</option>
                  </Form.Control>
                </Form.Group>
              </div>
            </Tab>

            {/* <Tab eventKey="contactos" title="Contactos">
              <p>Contenido de contactos (puedes agregarlo luego).</p>
            </Tab> */}

            <Tab eventKey="cuentas" title="Cuentas Bancarias">
              {cuentas.map((cuenta, index) => (
                <div key={index} className="row mb-3 align-items-center">
                  <Form.Group className="col-md-4">
                    <Form.Label>Banco</Form.Label>
                    <Form.Control
                      type="text"
                      value={cuenta.banco}
                      disabled={readOnly}
                      onChange={(e) => handleChangeCuenta(index, 'banco', e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="col-md-3">
                    <Form.Label>Tipo de Cuenta</Form.Label>
                    <Form.Control
                      as="select"
                      value={cuenta.tipo}
                      disabled={readOnly}
                      onChange={(e) => handleChangeCuenta(index, 'tipo', e.target.value)}
                    >
                      <option value="">Seleccione</option>
                      <option value="Monetaria">Monetaria</option>
                      <option value="Ahorro">Ahorro</option>
                    </Form.Control>
                  </Form.Group>
                  <Form.Group className="col-md-4">
                    <Form.Label>Número de Cuenta</Form.Label>
                    <Form.Control
                      type="text"
                      value={cuenta.numero}
                      disabled={readOnly}
                      onChange={(e) => handleChangeCuenta(index, 'numero', e.target.value)}
                    />
                  </Form.Group>
                  <div className="col-md-1 text-right">
                    {!readOnly && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="rounded-circle p-0 d-flex align-items-center justify-content-center"
                        style={{ width: '32px', height: '32px' }}
                        onClick={() => eliminarCuenta(index)}
                        disabled={cuentas.length === 1}
                        title={cuentas.length === 1 ? "Debe haber al menos una cuenta" : "Eliminar cuenta"}
                      >
                        <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>×</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {!readOnly && (
                <Button variant="secondary" onClick={agregarCuenta}>
                  Agregar otra cuenta
                </Button>
              )}
            </Tab>
          </Tabs>

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
