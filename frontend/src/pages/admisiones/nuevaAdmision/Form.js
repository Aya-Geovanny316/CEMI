import React, { useEffect, useState, useContext, useMemo, useRef } from 'react';
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Tabs,
  Tab
} from 'react-bootstrap';
import { AppContext } from './Context';

const FormularioAdmision = () => {

  const { guardarAdmision, loading, listarHabitaciones, seguros, areaHabitacion, setAreaSeleccionada, areaSeleccionada,
    doctor, register, handleSubmit, watch, setValue, reset
  } = useContext(AppContext);

  const [todayDate, setTodayDate] = useState('');

  const primerNombreRef = useRef(null);
  const segundoNombreRef = useRef(null);
  const primerApellidoRef = useRef(null);
  const segundoApellidoRef = useRef(null);
  const apellidoCasadaRef = useRef(null);

  const sanitizeSingleWord = (rawValue) => {
    if (!rawValue) return '';
    return rawValue.trim().split(/\s+/)[0];
  };

  const moveFocus = (nextRef) => {
    if (nextRef?.current) {
      nextRef.current.focus();
    }
  };

  const handleNameBlur = (event, fieldName) => {
    const sanitized = sanitizeSingleWord(event.target.value);
    if (sanitized !== event.target.value) {
      setValue(fieldName, sanitized, { shouldDirty: true, shouldValidate: false });
    }
  };

  const handleNamePaste = (event, fieldName, nextRef) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text');
    const sanitized = sanitizeSingleWord(pasted);
    setValue(fieldName, sanitized, { shouldDirty: true, shouldValidate: false });
    moveFocus(nextRef);
  };

  const handleNameKeyDown = (event, fieldName, nextRef) => {
    if (event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      const sanitized = sanitizeSingleWord(event.currentTarget.value);
      setValue(fieldName, sanitized, { shouldDirty: true, shouldValidate: false });
      moveFocus(nextRef);
    } else if (event.key === 'Tab' && !event.shiftKey) {
      const sanitized = sanitizeSingleWord(event.currentTarget.value);
      setValue(fieldName, sanitized, { shouldDirty: true, shouldValidate: false });
    }
  };

  const handleClearForm = () => {
    reset();
    setAreaSeleccionada('');
  };

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      // Verificamos si el campo modificado es la fecha de nacimiento de un acompañante
      const regex = /^acompanantes\.(\d+)\.fechaNacimiento$/;

      const match = name && name.match(regex);
      if (match) {
        const index = match[1]; // número del acompañante
        const fecha = value?.acompanantes?.[index]?.fechaNacimiento;
        if (fecha) {
          const edad = calcularEdad(fecha);
          setValue(`acompanantes.${index}.edad`, edad);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  useEffect(() => {
    const hoy = new Date();
    const fechaGT = hoy.toLocaleDateString('es-GT'); // o puedes usar 'es-419' para LATAM
    setTodayDate(fechaGT);
  }, []);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'fechaNacimiento' && value.fechaNacimiento) {
        const edad = calcularEdad(value.fechaNacimiento);
        setValue('edad', edad);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  const habitacionesFiltradas = useMemo(() => {
    return listarHabitaciones.filter(
      (hab) => hab.area === areaSeleccionada
    );
  }, [listarHabitaciones, areaSeleccionada]);

  const calcularEdad = (fecha) => {
    const nacimiento = new Date(fecha);
    const hoy = new Date();

    const diffTiempo = hoy.getTime() - nacimiento.getTime();
    const diffDias = Math.floor(diffTiempo / (1000 * 60 * 60 * 24));

    if (diffDias < 30) {
      return `${diffDias} día(s)`;
    }

    const diffMeses = (hoy.getFullYear() - nacimiento.getFullYear()) * 12 + hoy.getMonth() - nacimiento.getMonth();
    if (diffMeses < 12) {
      return `${diffMeses} mes(es)`;
    }

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    const dia = hoy.getDate() - nacimiento.getDate();

    if (mes < 0 || (mes === 0 && dia < 0)) {
      edad--;
    }

    return `${edad} año(s)`;
  };


  const transformarCampos = (data) => {
    const output = {
      ...data,

      // 📌 PACIENTE
      p_primer_nombre: data.primerNombre,
      p_segundo_nombre: data.segundoNombre,
      p_primer_apellido: data.primerApellido,
      p_segundo_apellido: data.segundoApellido,
      p_apellido_casada: data.apellidoCasada,
      p_genero: data.genero,
      p_estado_civil: data.estadoCivil,
      p_fecha_nacimiento: data.fechaNacimiento,
      p_tipo_identificacion: data.tipoIdentificacion,
      p_numero_identificacion: data.numeroIdentificacion,
      p_telefono: data.telefono1,
      edad: data.edad,
      direccion: data.direccion,
      telefono1: data.telefono1,
      telefono2: data.telefono2,
      correo: data.correo,
      observacion: data.observacion,
      religion: data.religion,
      nit: data.nit,
      tipo_sangre: data.tipoSangre,

      // 📌 ACOMPAÑANTE
      acompananteNombre: data.acompananteNombre,
      acompananteTelefono: data.acompananteTelefono,

      // 📌 RESPONSABLE
      responsablePrimerNombre: data.resp_primerNombre,
      responsableSegundoNombre: data.resp_segundoNombre,
      responsablePrimerApellido: data.resp_primerApellido,
      responsableSegundoApellido: data.resp_segundoApellido,
      responsableTipoIdentificacion: data.resp_tipoIdentificacion,
      responsableNumeroIdentificacion: data.resp_numeroIdentificacion,
      responsableFechaNacimiento: data.resp_fechaNacimiento,
      responsableEdad: data.resp_edad,
      responsableGenero: data.resp_genero,
      responsableRelacionPaciente: data.resp_relacion,
      responsableOcupacion: data.resp_ocupacion,
      responsableDomicilio: data.resp_domicilio,
      responsableEmpresa: data.resp_empresa,
      responsableDireccion: data.resp_direccionEmpresa,
      responsableTelefono1: data.resp_telefono1,
      responsableTelefono2: data.resp_telefono2,
      responsableContacto: data.resp_contacto,
      responsableEmail: data.resp_email,

      // 📌 ESPOSO(A)
      esposoNombre: data.esposoNombre,
      esposoGenero: data.esposoGenero,
      esposoTipoIdentificacion: data.esposoTipoIdentificacion,
      esposoNumeroIdentificacion: data.esposoNumeroIdentificacion,
      esposoFechaNacimiento: data.esposoFechaNacimiento,
      esposoEdad: data.esposoEdad,
      esposoTelefono1: data.esposoTelefono1,
      esposoTelefono2: data.esposoTelefono2,
      esposoDomicilio: data.esposoDomicilio,
      esposoOcupacion: data.esposoOcupacion,
      esposoEmpresa: data.esposoEmpresa,
      esposoDireccion: data.esposoDireccion,
      esposoEmail: data.esposoEmail,

      // 📌 DATOS LABORALES DEL PACIENTE
      empresa: data.empresa,
      direccionEmpresa: data.direccionEmpresa,
      telefonoEmpresa1: data.telefonoEmpresa1,
      telefonoEmpresa2: data.telefonoEmpresa2,
      ocupacion: data.ocupacion,

      // 📌 DATOS DEL SEGURO
      aseguradora: data.aseguradora,
      listaPrecios: data.listaPrecios,
      carnet: data.carnet,
      certificado: data.certificado,
      nombreTitular: data.nombreTitular,
      coaseguro: data.coaseguro,
      valorCopago: data.valorCopago,
      valorDeducible: data.valorDeducible,
      numero_poliza: data.numero_poliza,

      // 📌 GARANTÍA DE PAGO
      tipoGarantia: data.tipoGarantia,
      numeroTcCheque: data.numeroTcCheque,
      nombreFactura: data.nombreFactura,
      direccionFactura: data.direccionFactura,
      correoFactura: data.correoFactura,
    };

    // Familiares (acompañantes múltiples)
    if (data.acompanantes) {
      output.acompanantes = data.acompanantes.filter((acompanante) => {
        if (!acompanante) return false;

        return Object.values(acompanante).some((valor) => {
          if (typeof valor === 'boolean') {
            return valor === true;
          }

          if (valor === null || valor === undefined) {
            return false;
          }

          if (typeof valor === 'string') {
            return valor.trim() !== '';
          }

          if (typeof valor === 'number') {
            return !Number.isNaN(valor);
          }

          return true;
        });
      });
    }

    delete output.tipoSangre;

    // Opcional: eliminá campos que ya fueron reubicados
    delete output.primerNombre;
    delete output.segundoNombre;
    delete output.primerApellido;
    delete output.segundoApellido;
    delete output.apellidoCasada;
    delete output.fechaNacimiento;
    delete output.genero;
    delete output.estadoCivil;
    delete output.tipoIdentificacion;
    delete output.numeroIdentificacion;

    return output;
  };

  const onSubmit = async (data) => {
    console.log('Formulario enviado:', data);
    try {
      const datosTransformados = transformarCampos(data);
      await guardarAdmision(datosTransformados);
      //alert('Guardado con éxito');
    } catch (err) {
      alert('Error al guardar');
    }
  };

  return (
    <Container className="p-4 bg-light rounded shadow-sm">
      {/* Encabezado */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
        <h4 className="fw-bold text-dark m-0">Ficha del Paciente</h4>

        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-2">
          <span className="fw-bold mr-3">Fecha: {todayDate}</span>

          <div className="d-flex gap-2">
            {/* <Button variant="primary">
              <FiAlignJustify /> <span>Listado</span>
            </Button> */}
            <Button
              variant="outline-secondary"
              disabled={loading}
              onClick={handleClearForm}
            >
              Limpiar
            </Button>
            <Button
              variant="primary"
              disabled={loading}
              onClick={handleSubmit(onSubmit)}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </div>

      <Form onSubmit={handleSubmit(onSubmit)}>
        {/* Información del Paciente */}
        <div className="p-4 rounded border mb-4" style={{ backgroundColor: '#ededed' }} >
          <h5 className="text-primary mb-4">Ficha del Paciente</h5>

          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Primer nombre</Form.Label>
                {(() => {
                  const field = register('primerNombre', {
                    onBlur: (event) => handleNameBlur(event, 'primerNombre'),
                  });
                  return (
                    <Form.Control
                      type="text"
                      {...field}
                      ref={(el) => {
                        primerNombreRef.current = el;
                        field.ref(el);
                      }}
                      onKeyDown={(event) => handleNameKeyDown(event, 'primerNombre', segundoNombreRef)}
                      onPaste={(event) => handleNamePaste(event, 'primerNombre', segundoNombreRef)}
                    />
                  );
                })()}
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Segundo nombre</Form.Label>
                {(() => {
                  const field = register('segundoNombre', {
                    onBlur: (event) => handleNameBlur(event, 'segundoNombre'),
                  });
                  return (
                    <Form.Control
                      type="text"
                      {...field}
                      ref={(el) => {
                        segundoNombreRef.current = el;
                        field.ref(el);
                      }}
                      onKeyDown={(event) => handleNameKeyDown(event, 'segundoNombre', primerApellidoRef)}
                      onPaste={(event) => handleNamePaste(event, 'segundoNombre', primerApellidoRef)}
                    />
                  );
                })()}
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Primer Apellido</Form.Label>
                {(() => {
                  const field = register('primerApellido', {
                    onBlur: (event) => handleNameBlur(event, 'primerApellido'),
                  });
                  return (
                    <Form.Control
                      type="text"
                      {...field}
                      ref={(el) => {
                        primerApellidoRef.current = el;
                        field.ref(el);
                      }}
                      onKeyDown={(event) => handleNameKeyDown(event, 'primerApellido', segundoApellidoRef)}
                      onPaste={(event) => handleNamePaste(event, 'primerApellido', segundoApellidoRef)}
                    />
                  );
                })()}
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Segundo Apellido</Form.Label>
                {(() => {
                  const field = register('segundoApellido', {
                    onBlur: (event) => handleNameBlur(event, 'segundoApellido'),
                  });
                  return (
                    <Form.Control
                      type="text"
                      {...field}
                      ref={(el) => {
                        segundoApellidoRef.current = el;
                        field.ref(el);
                      }}
                      onKeyDown={(event) => handleNameKeyDown(event, 'segundoApellido', apellidoCasadaRef)}
                      onPaste={(event) => handleNamePaste(event, 'segundoApellido', apellidoCasadaRef)}
                    />
                  );
                })()}
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Apellido de casada</Form.Label>
                {(() => {
                  const field = register('apellidoCasada');
                  return (
                    <Form.Control
                      type="text"
                      {...field}
                      ref={(el) => {
                        apellidoCasadaRef.current = el;
                        field.ref(el);
                      }}
                    />
                  );
                })()}
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Género</Form.Label>
                <Form.Control as="select" {...register('genero')}>
                  <option>Seleccione</option>
                  <option>MASCULINO</option>
                  <option>FEMENINO</option>
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Estado Civil</Form.Label>
                <Form.Control as="select" {...register('estadoCivil')}>
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
                {/* <Form.Control type="text" {...register('tipoSangre')} /> */}
                <Form.Control as="select" {...register('tipoSangre')}>
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
                <Form.Control type="date" {...register('fechaNacimiento')} />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Edad</Form.Label>
                <Form.Control type="text" {...register('edad')} disabled />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Tipo de Identificación</Form.Label>
                <Form.Control as="select" {...register('tipoIdentificacion')}>
                  <option>Seleccione</option>
                  <option>DPI</option>
                  <option>PASAPORTE</option>
                  <option>CERTIFICADO DE NACIMIENTO</option>
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Número de Identificación</Form.Label>
                <Form.Control type="number" {...register('numeroIdentificacion')} />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Dirección</Form.Label>
                <Form.Control type="text" {...register('direccion')} />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Teléfono 1</Form.Label>
                <Form.Control type="text" {...register('telefono1')} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Teléfono 2</Form.Label>
                <Form.Control type="text" {...register('telefono2')} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control type="email" {...register('correo')} />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Religión</Form.Label>
                <Form.Control as="select" {...register('religion')}>
                  <option>Seleccione</option>
                  <option>No Difinido</option>
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
            <Col md={4}>
              <Form.Group>
                <Form.Label>NIT</Form.Label>
                <Form.Control type="text" {...register('nit')} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Observación</Form.Label>
                <Form.Control as="textarea" rows={2} {...register('observacion')} />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="responsableCuenta" className="d-flex align-items-center">
            <Form.Check type="checkbox" {...register('responsableCuenta')} className="me-2" />
            <Form.Label className="mb-0">Responsable de Cuenta</Form.Label>
          </Form.Group>
        </div>

        {/* Datos Laborales del Paciente */}
        <div className="p-3 rounded border mb-3" style={{ backgroundColor: '#ededed' }}>
          <h5 className="text-primary mt-4">Datos Laborales del Paciente</h5>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Empresa</Form.Label>
                <Form.Control type="text" {...register('empresa')} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Ocupación</Form.Label>
                <Form.Control type="text" {...register('ocupacion')} />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Dirección</Form.Label>
                <Form.Control type="text" {...register('direccion')} />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Teléfono 1</Form.Label>
                <Form.Control type="text" {...register('telefono1')} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Teléfono 2</Form.Label>
                <Form.Control type="text" {...register('telefono2')} />
              </Form.Group>
            </Col>
          </Row>
        </div>

        {/* Información de la Admisión */}
        <div className="p-3 rounded border mb-3" style={{ backgroundColor: '#ededed' }}>
          <h5 className="text-primary mt-4">Información de la Admisión</h5>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Área</Form.Label>
                <Form.Control
                  as="select"
                  {...register('area_admision')}
                  onChange={(e) => {
                    setAreaSeleccionada(e.target.value);
                    setValue('area_admision', e.target.value); // opcional, si querés sincronizarlo con react-hook-form
                  }}
                >
                  <option value="">Seleccione</option>
                  {Array.isArray(areaHabitacion) &&
                    areaHabitacion.map((item, idx) => (
                      <option key={idx} value={item.area}>
                        {item.area}
                      </option>
                    ))}
                </Form.Control>
              </Form.Group>

            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Habitación</Form.Label>
                <Form.Control as="select" {...register('habitacion')}>
                  <option>Seleccione</option>
                  {habitacionesFiltradas.map((data, index) => (
                    <option key={index} value={data.id}>
                      {`${data.codigo} - nivel: ${data.nivel}`}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Médico Tratante</Form.Label>
                <Form.Control as="select" {...register('medicoTratante')}>
                  <option value="">Seleccione</option>
                  <option value="Sin referencia medica">Sin referencia medica</option>
                  {doctor.map((medico) => (
                    <option key={medico.id} value={medico.id}>
                      {medico.perfil.primer_nombre} {medico.perfil.primer_apellido}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
        </div>

        {/* Acompañantes */}
        <div className="p-4 rounded border mb-3" style={{ backgroundColor: '#ededed' }}>
          <h5 className="text-primary mt-2">Acompañantes</h5>

          <Tabs defaultActiveKey="acompanante1" id="tabs-acompanantes" className="mb-3">
            {[1, 2, 3, 4].map((n) => (
              <Tab key={n} eventKey={`acompanante${n}`} title={`Acompañante ${n}`}>
                <div className="pt-2">
                  <h6 className="text-primary">{`Datos del Acompañante ${n}`}</h6>
                  <Row className="mb-3">
                    <Col xs={12} md={4}>
                      <Form.Group>
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control type="text" {...register(`acompanantes.${n - 1}.nombre`)} />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={4}>
                      <Form.Group>
                        <Form.Label>Tipo de Identificación</Form.Label>
                        <Form.Control as="select" {...register(`acompanantes.${n - 1}.tipoIdentificacion`)}>
                          <option value="">Seleccione</option>
                          <option value="DPI">DPI</option>
                          <option value="PASAPORTE">Pasaporte</option>
                        </Form.Control>
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={4}>
                      <Form.Group>
                        <Form.Label>Número de Identificación</Form.Label>
                        <Form.Control type="number" {...register(`acompanantes.${n - 1}.numeroIdentificacion`)} />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col xs={12} md={4}>
                      <Form.Group>
                        <Form.Label>Fecha de Nacimiento</Form.Label>
                        <Form.Control type="date" {...register(`acompanantes.${n - 1}.fechaNacimiento`)} />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={2}>
                      <Form.Group>
                        <Form.Label>Edad</Form.Label>
                        <Form.Control type="text" disabled {...register(`acompanantes.${n - 1}.edad`)} />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={3}>
                      <Form.Group>
                        <Form.Label>Género</Form.Label>
                        <Form.Control as="select" {...register(`acompanantes.${n - 1}.genero`)}>
                          <option value="">Seleccione</option>
                          <option value="MASCULINO">Masculino</option>
                          <option value="FEMENINO">Femenino</option>
                        </Form.Control>
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={3}>
                      <Form.Group>
                        <Form.Label>Correo</Form.Label>
                        <Form.Control type="email" {...register(`acompanantes.${n - 1}.correo`)} />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col xs={12} md={4}>
                      <Form.Group>
                        <Form.Label>NIT</Form.Label>
                        <Form.Control type="text" {...register(`acompanantes.${n - 1}.nit`)} />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={4}>
                      <Form.Group>
                        <Form.Label>Tipo de Familiar</Form.Label>
                        <Form.Control as="select" {...register(`acompanantes.${n - 1}.tipo`)}>
                          <option value="">Seleccione</option>
                          <option value="padre">Padre</option>
                          <option value="madre">Madre</option>
                          <option value="hijo">Hijo/a</option>
                          <option value="hermano">Hermano/a</option>
                          <option value="abuelo">Abuelo/a</option>
                          <option value="tio">Tío/a</option>
                          <option value="amigo">Amigo/a</option>
                          <option value="esposo">Esposa/o</option>
                          <option value="otro">Otro</option>
                        </Form.Control>
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={4}>
                      <Form.Group className="d-flex align-items-center gap-2 mt-4">
                        <Form.Check
                          type="checkbox"
                          {...register(`acompanantes.${n - 1}.responsableCuenta`)}
                          id={`responsableCuenta${n}`}
                        />
                        <Form.Label htmlFor={`responsableCuenta${n}`} className="mb-0">
                          Responsable de Cuenta
                        </Form.Label>
                      </Form.Group>
                    </Col>
                  </Row>

                  <h6 className="text-primary">Datos Laborales del Acompañante</h6>
                  <Row className="mb-3">
                    <Col xs={12} md={4}>
                      <Form.Group>
                        <Form.Label>Dirección</Form.Label>
                        <Form.Control type="text" {...register(`acompanantes.${n - 1}.direccionLaboral`)} />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={4}>
                      <Form.Group>
                        <Form.Label>Teléfono Empresa</Form.Label>
                        <Form.Control type="text" {...register(`acompanantes.${n - 1}.telefonoEmpresa`)} />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={4}>
                      <Form.Group>
                        <Form.Label>Contacto</Form.Label>
                        <Form.Control type="text" {...register(`acompanantes.${n - 1}.contacto`)} />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col xs={12} md={6}>
                      <Form.Group>
                        <Form.Label>Correo Contacto</Form.Label>
                        <Form.Control type="email" {...register(`acompanantes.${n - 1}.correoContacto`)} />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group>
                        <Form.Label>Teléfono Contacto</Form.Label>
                        <Form.Control type="text" {...register(`acompanantes.${n - 1}.telefonoContacto`)} />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
              </Tab>
            ))}
          </Tabs>
        </div>

        {/* Datos del Seguro */}
        <div className="p-3 rounded border mb-3" style={{ backgroundColor: '#ededed' }}>
          <h5 className="text-primary mt-4">Datos del Seguro</h5>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Aseguradora</Form.Label>
                <Form.Control as="select" {...register('aseguradora')}>
                  <option value="">Seleccione</option>
                  {Array.isArray(seguros) &&
                    seguros.map((seguro) => (
                      <option key={seguro.id} value={seguro.id}>
                        {seguro.nombre}
                      </option>
                    ))
                  }
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Número de póliza</Form.Label>
                <Form.Control type="text" {...register('numero_poliza')} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Listado de Precios</Form.Label>
                <Form.Control type="text" {...register('listaPrecios')} />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Carnet</Form.Label>
                <Form.Control type="text" {...register('carnet')} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Certificado</Form.Label>
                <Form.Control type="text" {...register('certificado')} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Nombre del Titular</Form.Label>
                <Form.Control type="text" {...register('nombreTitular')} />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>% de Coaseguro</Form.Label>
                <Form.Control type="number" step="0.01" {...register('coaseguro')} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Copago</Form.Label>
                <Form.Control type="number" step="0.01" {...register('valorCopago')} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Deducible</Form.Label>
                <Form.Control type="number" step="0.01" {...register('valorDeducible')} />
              </Form.Group>
            </Col>
          </Row>
        </div>
      </Form>

    </Container >
  );
};

export default FormularioAdmision;
