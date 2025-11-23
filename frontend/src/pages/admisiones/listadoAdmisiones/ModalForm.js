// Este archivo combina el layout visual del formulario "ficha del paciente"
// con la estructura funcional del modal existente para conservar su lógica, contexto y tabs

import React, { useMemo, useContext, useRef } from 'react';
import { Modal, Button, Form, Row, Col, Container, Tabs, Tab } from 'react-bootstrap';
import { AppContext } from './Context';

const ModalAdmision = () => {
    const {
        mostrarModal, setMostrarModal, modoFormulario, handleSubmit, onSubmit, loading,
        register, seccionActiva, setSeccionActiva,
        listarHabitaciones, seguros, areaHabitacion, setAreaSeleccionada, areaSeleccionada,
        doctor, setValue, watch
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

    const habitacionesFiltradas = useMemo(() => {
        return listarHabitaciones.filter(
            (hab) => hab.area === areaSeleccionada
        );
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
                                                    readOnly={readOnly}
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
                                                    readOnly={readOnly}
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
                                                    readOnly={readOnly}
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
                                                    readOnly={readOnly}
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
                                                    readOnly={readOnly}
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
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label>Edad</Form.Label>
                                        <Form.Control type="text" readOnly value={edadCalculada || ''} />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Tipo de Identificación</Form.Label>
                                        <Form.Control as="select" disabled={readOnly} {...register('tipoIdentificacion')}>
                                            <option>Seleccione</option>
                                            <option>DPI</option>
                                            <option>PASAPORTE</option>
                                            <option>CERTIFICADO DE NACIMIENTO</option>
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>No. DPI / Documento</Form.Label>
                                        <Form.Control type="text" readOnly={readOnly} {...register('numeroIdentificacion')} />
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
                                        <Form.Label>Dirección</Form.Label>
                                        <Form.Control type="text" readOnly={readOnly} {...register('direccion')} />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Teléfono 1</Form.Label>
                                        <Form.Control type="text" readOnly={readOnly} {...register('telefono1')} />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Teléfono 2</Form.Label>
                                        <Form.Control type="text" readOnly={readOnly} {...register('telefono2')} />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Correo electrónico</Form.Label>
                                        <Form.Control type="email" readOnly={readOnly} {...register('correo')} />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={4}>
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
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>NIT</Form.Label>
                                        <Form.Control type="text" readOnly={readOnly} {...register('nit')} />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Observación</Form.Label>
                                        <Form.Control as="textarea" readOnly={readOnly} rows={2} {...register('observacion')} />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Contacto de emergencia</Form.Label>
                                        <Form.Control type="text" readOnly={readOnly} {...register('contactoEmergencia')} />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Correo / Teléfono contacto</Form.Label>
                                        <Form.Control type="text" readOnly={readOnly} value="" placeholder="Use campos de teléfono/correo si aplica" />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group controlId="responsableCuenta" className="d-flex align-items-center">
                                <Form.Check disabled={readOnly} type="checkbox" {...register('responsableCuenta')} className="me-2" />
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
                                        <Form.Control type="text" readOnly={readOnly} {...register('empresa')} />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Ocupación</Form.Label>
                                        <Form.Control type="text" readOnly={readOnly} {...register('ocupacion')} />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label>Dirección</Form.Label>
                                        <Form.Control type="text" readOnly={readOnly} {...register('direccion')} />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Teléfono 1</Form.Label>
                                        <Form.Control type="text" readOnly={readOnly} {...register('telefono1')} />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Teléfono 2</Form.Label>
                                        <Form.Control type="text" readOnly={readOnly} {...register('telefono2')} />
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
                                            disabled={readOnly}
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
                                        <Form.Control as="select" disabled={readOnly} {...register('habitacion')}>
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
                                        <Form.Control as="select" disabled={readOnly} {...register('medicoTratante')}>
                                            <option value="">Seleccione</option>
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
                                                        <Form.Control type="text" readOnly={readOnly} {...register(`acompanantes.${n - 1}.nombre`)} />
                                                    </Form.Group>
                                                </Col>
                                                <Col xs={12} md={4}>
                                                    <Form.Group>
                                                        <Form.Label>Tipo de Identificación</Form.Label>
                                                        <Form.Control as="select" disabled={readOnly} {...register(`acompanantes.${n - 1}.tipoIdentificacion`)}>
                                                            <option value="">Seleccione</option>
                                                            <option value="DPI">DPI</option>
                                                            <option value="PASAPORTE">Pasaporte</option>
                                                        </Form.Control>
                                                    </Form.Group>
                                                </Col>
                                                <Col xs={12} md={4}>
                                                    <Form.Group>
                                                        <Form.Label>Número de Identificación</Form.Label>
                                                        <Form.Control type="text" readOnly={readOnly} {...register(`acompanantes.${n - 1}.numeroIdentificacion`)} />
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            <Row className="mb-3">
                                                <Col xs={12} md={4}>
                                                    <Form.Group>
                                                        <Form.Label>Fecha de Nacimiento</Form.Label>
                                                        <Form.Control type="date" readOnly={readOnly} {...register(`acompanantes.${n - 1}.fechaNacimiento`)} />
                                                    </Form.Group>
                                                </Col>
                                                <Col xs={12} md={2}>
                                                    <Form.Group>
                                                        <Form.Label>Edad</Form.Label>
                                                        <Form.Control type="text" readOnly={readOnly} disabled {...register(`acompanantes.${n - 1}.edad`)} />
                                                    </Form.Group>
                                                </Col>
                                                <Col xs={12} md={3}>
                                                    <Form.Group>
                                                        <Form.Label>Género</Form.Label>
                                                        <Form.Control as="select" disabled={readOnly} {...register(`acompanantes.${n - 1}.genero`)}>
                                                            <option value="">Seleccione</option>
                                                            <option value="MASCULINO">Masculino</option>
                                                            <option value="FEMENINO">Femenino</option>
                                                        </Form.Control>
                                                    </Form.Group>
                                                </Col>
                                                <Col xs={12} md={3}>
                                                    <Form.Group>
                                                        <Form.Label>Correo</Form.Label>
                                                        <Form.Control type="email" readOnly={readOnly} {...register(`acompanantes.${n - 1}.correo`)} />
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            <Row className="mb-3">
                                                <Col xs={12} md={4}>
                                                    <Form.Group>
                                                        <Form.Label>NIT</Form.Label>
                                                        <Form.Control type="text" readOnly={readOnly} {...register(`acompanantes.${n - 1}.nit`)} />
                                                    </Form.Group>
                                                </Col>
                                                <Col xs={12} md={4}>
                                                    <Form.Group>
                                                        <Form.Label>Tipo de Familiar</Form.Label>
                                                        <Form.Control as="select" disabled={readOnly} {...register(`acompanantes.${n - 1}.tipo`)}>
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
                                                        <Form.Check disabled={readOnly}
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
                                                        <Form.Control type="text" readOnly={readOnly} {...register(`acompanantes.${n - 1}.direccionLaboral`)} />
                                                    </Form.Group>
                                                </Col>
                                                <Col xs={12} md={4}>
                                                    <Form.Group>
                                                        <Form.Label>Teléfono Empresa</Form.Label>
                                                        <Form.Control type="text" readOnly={readOnly} {...register(`acompanantes.${n - 1}.telefonoEmpresa`)} />
                                                    </Form.Group>
                                                </Col>
                                                <Col xs={12} md={4}>
                                                    <Form.Group>
                                                        <Form.Label>Contacto</Form.Label>
                                                        <Form.Control type="text" readOnly={readOnly} {...register(`acompanantes.${n - 1}.contacto`)} />
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            <Row className="mb-3">
                                                <Col xs={12} md={6}>
                                                    <Form.Group>
                                                        <Form.Label>Correo Contacto</Form.Label>
                                                        <Form.Control type="email" readOnly={readOnly} {...register(`acompanantes.${n - 1}.correoContacto`)} />
                                                    </Form.Group>
                                                </Col>
                                                <Col xs={12} md={6}>
                                                    <Form.Group>
                                                        <Form.Label>Teléfono Contacto</Form.Label>
                                                        <Form.Control type="text" readOnly={readOnly} {...register(`acompanantes.${n - 1}.telefonoContacto`)} />
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
                                        <Form.Control as="select" disabled={readOnly} {...register('aseguradora')}>
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
                                        <Form.Control type="text" readOnly={readOnly} {...register('numero_poliza')} />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Listado de Precios</Form.Label>
                                        <Form.Control type="text" readOnly={readOnly} {...register('listaPrecios')} />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Carnet</Form.Label>
                                        <Form.Control type="text" readOnly={readOnly} {...register('carnet')} />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Certificado</Form.Label>
                                        <Form.Control type="text" readOnly={readOnly} {...register('certificado')} />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Nombre del Titular</Form.Label>
                                        <Form.Control type="text" readOnly={readOnly} {...register('nombreTitular')} />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>% de Coaseguro</Form.Label>
                                        <Form.Control type="number" readOnly={readOnly} step="0.01" {...register('coaseguro')} />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Copago</Form.Label>
                                        <Form.Control type="number" readOnly={readOnly} step="0.01" {...register('valorCopago')} />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Deducible</Form.Label>
                                        <Form.Control type="number" readOnly={readOnly} step="0.01" {...register('valorDeducible')} />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>
                    </Form>
                </Container>
            </Modal.Body>
        </Modal>
    );
};

export default ModalAdmision;
