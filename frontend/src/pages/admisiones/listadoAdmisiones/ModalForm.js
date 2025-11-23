import React, { useContext, useMemo } from 'react';
import { Modal, Button, Form, Row, Col, Container } from 'react-bootstrap';
import { AppContext } from './Context';

const ModalAdmision = () => {
  const {
    mostrarModal,
    setMostrarModal,
    modoFormulario,
    handleSubmit,
    onSubmit,
    loading,
    register,
    listarHabitaciones,
    seguros,
    areaHabitacion,
    setAreaSeleccionada,
    areaSeleccionada,
    doctor,
    watch,
  } = useContext(AppContext);

  const readOnly = modoFormulario === 'ver';
  const todayDate = new Date().toISOString().split('T')[0];
  const birthDate = watch('fechaNacimiento');

  const edadCalculada = useMemo(() => {
    if (!birthDate) return '';
    const nacimiento = new Date(birthDate);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return `${edad} año(s)`;
  }, [birthDate]);

  const habitacionesFiltradas = useMemo(() => {
    return listarHabitaciones.filter((hab) => hab.area === areaSeleccionada);
  }, [listarHabitaciones, areaSeleccionada]);

  if (!mostrarModal) return null;

  return (
    <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} size="xl" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold text-dark">Ficha del Paciente</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container className="bg-light rounded shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold text-dark mb-0">Ficha del Paciente</h5>
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted">Fecha: {todayDate}</span>
              {!readOnly && (
                <Button variant="primary" disabled={loading} onClick={handleSubmit(onSubmit)}>
                  {loading ? 'Guardando...' : 'Guardar'}
                </Button>
              )}
            </div>
          </div>

          <Form onSubmit={handleSubmit(onSubmit)}>
            {/* Perfil del paciente */}
            <div className="p-4 rounded border mb-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="text-primary mb-0">Perfil del paciente</h5>
                {edadCalculada && <span className="badge bg-secondary">Edad estimada: {edadCalculada}</span>}
              </div>

              <Row className="mb-3">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Primer nombre</Form.Label>
                    <Form.Control type="text" readOnly={readOnly} {...register('primerNombre')} />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Segundo nombre</Form.Label>
                    <Form.Control type="text" readOnly={readOnly} {...register('segundoNombre')} />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Primer apellido</Form.Label>
                    <Form.Control type="text" readOnly={readOnly} {...register('primerApellido')} />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Segundo apellido</Form.Label>
                    <Form.Control type="text" readOnly={readOnly} {...register('segundoApellido')} />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Apellido de casada</Form.Label>
                    <Form.Control type="text" readOnly={readOnly} {...register('apellidoCasada')} />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Género</Form.Label>
                    <Form.Control as="select" disabled={readOnly} {...register('genero')}>
                      <option>Seleccione</option>
                      <option>MASCULINO</option>
                      <option>FEMENINO</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Estado Civil</Form.Label>
                    <Form.Control as="select" disabled={readOnly} {...register('estadoCivil')}>
                      <option>Seleccione</option>
                      <option>SOLTERO</option>
                      <option>CASADO</option>
                      <option>DIVORCIADO</option>
                      <option>VIUDO</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Tipo de Sangre</Form.Label>
                    <Form.Control as="select" disabled={readOnly} {...register('tipoSangre')}>
                      <option>Seleccione</option>
                      <option>O+</option>
                      <option>O-</option>
                      <option>A+</option>
                      <option>A-</option>
                      <option>B+</option>
                      <option>B-</option>
                      <option>AB+</option>
                      <option>AB-</option>
                      <option>Pendiente</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Fecha de nacimiento</Form.Label>
                    <Form.Control type="date" readOnly={readOnly} {...register('fechaNacimiento')} />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Teléfono principal</Form.Label>
                    <Form.Control type="tel" readOnly={readOnly} {...register('telefono1')} />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Correo electrónico</Form.Label>
                    <Form.Control type="email" readOnly={readOnly} {...register('correo')} />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Teléfono secundario</Form.Label>
                    <Form.Control type="tel" readOnly={readOnly} {...register('telefono2')} />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Departamento</Form.Label>
                    <Form.Control type="text" readOnly={readOnly} {...register('departamento')} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Municipio</Form.Label>
                    <Form.Control type="text" readOnly={readOnly} {...register('municipio')} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Referencia</Form.Label>
                    <Form.Control type="text" readOnly={readOnly} {...register('referencia')} />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Dirección principal</Form.Label>
                    <Form.Control as="textarea" rows={2} readOnly={readOnly} {...register('direccion')} />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Tipo de Identificación</Form.Label>
                    <Form.Control as="select" disabled={readOnly} {...register('tipoIdentificacion')}>
                      <option>Seleccione</option>
                      <option value="DPI">DPI</option>
                      <option value="PASAPORTE">Pasaporte</option>
                      <option value="CERTIFICADO DE NACIMIENTO">Certificado de nacimiento</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>No. DPI / Documento</Form.Label>
                    <Form.Control type="text" readOnly={readOnly} {...register('numeroIdentificacion')} />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>NIT</Form.Label>
                    <Form.Control type="text" readOnly={readOnly} {...register('nit')} />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Contacto de emergencia</Form.Label>
                    <Form.Control type="text" readOnly={readOnly} {...register('contactoEmergencia')} />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Observación</Form.Label>
                    <Form.Control as="textarea" rows={2} readOnly={readOnly} {...register('observacion')} />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Religión</Form.Label>
                    <Form.Control as="select" disabled={readOnly} {...register('religion')}>
                      <option>Seleccione</option>
                      <option>No Definido</option>
                      <option>Católico/a</option>
                      <option>Evangélico/a</option>
                      <option>Judío/a</option>
                      <option>Mormón/a</option>
                      <option>Musulmán/a</option>
                      <option>Testigo de Jehová</option>
                      <option>Otro</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Detalles del ingreso */}
            <div className="p-4 rounded border mb-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="text-primary mb-0">Detalles del ingreso</h5>
                <span className="text-muted">Completa la información operativa</span>
              </div>
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Médico responsable</Form.Label>
                    <Form.Control as="select" disabled={readOnly} {...register('medicoTratante')}>
                      <option value="">Seleccione un médico</option>
                      <option value="Sin referencia medica">Sin referencia medica</option>
                      {Array.isArray(doctor) &&
                        doctor.map((medico) => (
                          <option key={medico.id} value={medico.id}>
                            {medico.perfil?.primer_nombre} {medico.perfil?.primer_apellido}
                          </option>
                        ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Área de atención</Form.Label>
                    <Form.Control
                      as="select"
                      disabled={readOnly}
                      {...register('area_admision')}
                      value={areaSeleccionada}
                      onChange={(event) => {
                        register('area_admision').onChange(event);
                        setAreaSeleccionada(event.target.value);
                      }}
                    >
                      <option value="">Selecciona un área</option>
                      {Array.isArray(areaHabitacion) && areaHabitacion.map((area) => (
                        <option key={area.area} value={area.area}>{area.area}</option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Habitación / cama</Form.Label>
                    <Form.Control as="select" disabled={readOnly} {...register('habitacion')}>
                      <option value="">Asignar después</option>
                      {habitacionesFiltradas.map((habitacion) => (
                        <option key={habitacion.id} value={habitacion.id}>
                          {habitacion.numero} - {habitacion.nombre}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Contacto de soporte */}
            <div className="p-4 rounded border mb-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="text-primary mb-0">Contacto de soporte</h5>
                <span className="text-muted">Persona de referencia</span>
              </div>
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Nombre completo</Form.Label>
                    <Form.Control type="text" readOnly={readOnly} {...register('resp_primerNombre')} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Relación</Form.Label>
                    <Form.Control type="text" readOnly={readOnly} {...register('resp_relacionPaciente')} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Teléfono</Form.Label>
                    <Form.Control type="tel" readOnly={readOnly} {...register('resp_telefono1')} />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Correo</Form.Label>
                    <Form.Control type="email" readOnly={readOnly} {...register('resp_email')} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Contacto</Form.Label>
                    <Form.Control type="text" readOnly={readOnly} {...register('resp_contacto')} />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Cobertura financiera */}
            <div className="p-4 rounded border mb-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="text-primary mb-0">Cobertura financiera</h5>
                <span className="text-muted">Define el esquema de pago</span>
              </div>
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Aseguradora</Form.Label>
                    <Form.Control as="select" disabled={readOnly} {...register('aseguradora')}>
                      <option value="">Selecciona aseguradora</option>
                      {seguros.map((seguro) => (
                        <option key={seguro.id} value={seguro.id}>{seguro.nombre}</option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Lista de precios</Form.Label>
                    <Form.Control type="text" readOnly={readOnly} {...register('listaPrecios')} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Plan / Código</Form.Label>
                    <Form.Control type="text" readOnly={readOnly} {...register('numero_poliza')} />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Carnet</Form.Label>
                    <Form.Control type="text" readOnly={readOnly} {...register('carnet')} />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Certificado</Form.Label>
                    <Form.Control type="text" readOnly={readOnly} {...register('certificado')} />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Nombre del titular</Form.Label>
                    <Form.Control type="text" readOnly={readOnly} {...register('nombreTitular')} />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Coaseguro</Form.Label>
                    <Form.Control type="text" readOnly={readOnly} {...register('coaseguro')} />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Valor de copago</Form.Label>
                    <Form.Control type="text" readOnly={readOnly} {...register('valorCopago')} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Valor deducible</Form.Label>
                    <Form.Control type="text" readOnly={readOnly} {...register('valorDeducible')} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Número de póliza</Form.Label>
                    <Form.Control type="text" readOnly={readOnly} {...register('numero_poliza')} />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {!readOnly && (
              <div className="d-flex justify-content-end gap-2">
                <Button variant="primary" type="submit">
                  Guardar
                </Button>
              </div>
            )}
          </Form>
        </Container>
      </Modal.Body>
    </Modal>
  );
};

export default ModalAdmision;
