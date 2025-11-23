import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { AppContext } from './Context';

const DOCUMENT_TYPES = [
  { value: 'dpi', label: 'Documento Personal' },
  { value: 'pasaporte', label: 'Pasaporte' },
  { value: 'otro', label: 'Otro' }
];

const ADMISSION_TYPES = [
  { value: 'hospitalizacion', label: 'Hospitalización' },
  { value: 'ambulatorio', label: 'Ambulatorio' },
  { value: 'emergencia', label: 'Emergencia' }
];

const PRIORITIES = [
  { value: 'programado', label: 'Programado' },
  { value: 'urgente', label: 'Urgente' },
  { value: 'critico', label: 'Crítico' }
];

const COVERAGE_TYPES = [
  { value: 'particular', label: 'Particular' },
  { value: 'seguro', label: 'Seguro' },
  { value: 'convenio', label: 'Convenio Empresarial' }
];

const FormularioAdmision = () => {
  const {
    guardarAdmision,
    loading,
    listarHabitaciones,
    seguros,
    areaHabitacion,
    setAreaSeleccionada,
    areaSeleccionada,
    doctor,
    register,
    handleSubmit,
    watch,
    setValue,
    reset
  } = useContext(AppContext);

  const [todayDate, setTodayDate] = useState('');
  const coverageType = watch('coverageType');
  const birthDate = watch('birthDate');

  const doctors = Array.isArray(doctor) ? doctor : [];
  const insurers = Array.isArray(seguros) ? seguros : [];
  const areas = Array.isArray(areaHabitacion) ? areaHabitacion : [];
  const rooms = Array.isArray(listarHabitaciones) ? listarHabitaciones : [];

  const careAreaField = register('careArea');

  useEffect(() => {
    const hoy = new Date();
    const fechaGT = hoy.toLocaleDateString('es-GT');
    setTodayDate(fechaGT);
  }, []);

  useEffect(() => {
    reset({
      admissionDate: new Date().toISOString().slice(0, 16),
      coverageType: 'particular'
    });
  }, [reset]);

  const calcularEdad = (fecha) => {
    if (!fecha) return '';
    const nacimiento = new Date(fecha);
    const hoy = new Date();

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    if (edad <= 0) {
      const diffMeses = (hoy.getFullYear() - nacimiento.getFullYear()) * 12 + hoy.getMonth() - nacimiento.getMonth();
      if (diffMeses <= 0) {
        const diffDias = Math.floor((hoy - nacimiento) / (1000 * 60 * 60 * 24));
        return `${diffDias} día(s)`;
      }
      return `${diffMeses} mes(es)`;
    }

    return `${edad} año(s)`;
  };

  const edadCalculada = useMemo(() => calcularEdad(birthDate), [birthDate]);
  const edadEnAnios = useMemo(() => {
    if (!birthDate) return '';
    const nacimiento = new Date(birthDate);
    const hoy = new Date();
    const edad = hoy.getFullYear() - nacimiento.getFullYear() - ((hoy.getMonth() < nacimiento.getMonth()) || (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate()) ? 1 : 0);
    return Number.isNaN(edad) ? '' : edad;
  }, [birthDate]);

  const habitacionesFiltradas = useMemo(() => {
    if (!areaSeleccionada) return [];
    return rooms.filter(hab => hab.area === areaSeleccionada);
  }, [rooms, areaSeleccionada]);

  const handleClearForm = () => {
    reset({
      admissionDate: new Date().toISOString().slice(0, 16),
      coverageType: 'particular'
    });
    setAreaSeleccionada('');
    setValue('careArea', '');
    setValue('roomId', '');
  };

  const handleAreaChange = (event) => {
    const value = event.target.value;
    setAreaSeleccionada(value);
    setValue('roomId', '');
  };

  const transformarCampos = (data) => {
    return {
      intake_reference: `ING-${Date.now()}`,
      patient_profile: {
        full_name: data.fullName?.trim(),
        document: {
          type: data.documentType,
          number: data.documentNumber
        },
        birth_date: data.birthDate,
        age_years: edadEnAnios,
        age_label: edadCalculada,
        phone: data.contactPhone,
        email: data.contactEmail,
        address: data.livingAddress,
        department: data.department,
        municipality: data.municipality,
        reference: data.reference,
        emergency_contact: data.emergencyName
      },
      admission_details: {
        reason: data.admissionReason,
        admission_type: data.admissionType,
        priority: data.priorityLevel,
        doctor_id: data.doctorId,
        doctor_label: doctors.find(doc => String(doc.id) === String(data.doctorId))?.full_name,
        care_area: data.careArea,
        room_id: data.roomId,
        admission_at: data.admissionDate,
        estimated_stay_days: data.estimatedStay,
        additional_notes: data.additionalNotes
      },
      emergency_contact: {
        name: data.emergencyName,
        relationship: data.emergencyRelationship,
        phone: data.emergencyPhone,
        notes: data.emergencyNotes
      },
      financial_snapshot: {
        coverage_type: data.coverageType,
        insurer_id: data.coverageType === 'seguro' ? data.insurerId : undefined,
        plan_code: data.planCode,
        notes: data.coverageNotes,
        billing_name: data.billingName,
        billing_tax_id: data.billingTaxId,
        billing_email: data.billingEmail
      }
    };
  };

  const onSubmit = async (formValues) => {
    const payload = transformarCampos(formValues);
    await guardarAdmision(payload);
  };

  return (
    <Container className="p-4 bg-light rounded shadow-sm">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
        <div>
          <p className="text-muted mb-0">Gestión de Admisiones</p>
          <h4 className="fw-bold text-dark m-0">Registrar Ingreso</h4>
        </div>
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-2">
          <span className="fw-bold">Fecha: {todayDate}</span>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" disabled={loading} onClick={handleClearForm}>
              Reiniciar
            </Button>
            <Button variant="primary" disabled={loading} onClick={handleSubmit(onSubmit)}>
              {loading ? 'Procesando...' : 'Registrar ingreso'}
            </Button>
          </div>
        </div>
      </div>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <section className="p-4 rounded border mb-4 bg-white">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="text-primary mb-0">Perfil del paciente</h5>
            {edadCalculada && <span className="badge bg-secondary">Edad estimada: {edadCalculada}</span>}
          </div>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Nombre completo</Form.Label>
                <Form.Control type="text" placeholder="Ej. María López" {...register('fullName')} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Tipo de documento</Form.Label>
                <Form.Control as="select" {...register('documentType')}>
                  <option value="">Selecciona uno</option>
                  {DOCUMENT_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>No. DPI / Documento</Form.Label>
                <Form.Control type="text" {...register('documentNumber')} />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Fecha de nacimiento</Form.Label>
                <Form.Control type="date" {...register('birthDate')} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Años de edad</Form.Label>
                <Form.Control type="number" value={edadEnAnios} readOnly placeholder="Calculado" />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Teléfono principal</Form.Label>
                <Form.Control type="tel" {...register('contactPhone')} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control type="email" {...register('contactEmail')} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Tipo de atención</Form.Label>
                <Form.Control as="select" {...register('admissionType')}>
                  <option value="">Selecciona una opción</option>
                  {ADMISSION_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Departamento</Form.Label>
                <Form.Control type="text" {...register('department')} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Municipio</Form.Label>
                <Form.Control type="text" {...register('municipality')} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Referencia / Direcciones</Form.Label>
                <Form.Control type="text" {...register('reference')} />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Group>
                <Form.Label>Dirección principal</Form.Label>
                <Form.Control as="textarea" rows={2} {...register('livingAddress')} />
              </Form.Group>
            </Col>
          </Row>
        </section>

        <section className="p-4 rounded border mb-4 bg-white">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="text-primary mb-0">Detalles del ingreso</h5>
            <span className="text-muted">Completa la información operativa</span>
          </div>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Médico responsable</Form.Label>
                <Form.Control as="select" {...register('doctorId')}>
                  <option value="">Seleccione un médico</option>
                  {doctors.map((medico) => (
                    <option key={medico.id} value={medico.id}>
                      {medico.full_name || `${medico.first_name ?? ''} ${medico.last_name ?? ''}`.trim()}
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
                  {...careAreaField}
                  value={areaSeleccionada}
                  onChange={(event) => {
                    careAreaField.onChange(event);
                    handleAreaChange(event);
                  }}
                >
                  <option value="">Selecciona una área</option>
                  {areas.map((area) => (
                    <option key={area.area} value={area.area}>{area.area}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Habitación / cama</Form.Label>
                <Form.Control as="select" {...register('roomId')}>
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

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Motivo de ingreso</Form.Label>
                <Form.Control as="textarea" rows={2} {...register('admissionReason')} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Prioridad</Form.Label>
                <Form.Control as="select" {...register('priorityLevel')}>
                  <option value="">Selecciona prioridad</option>
                  {PRIORITIES.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Ingreso programado</Form.Label>
                <Form.Control type="datetime-local" {...register('admissionDate')} />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Estancia estimada (días)</Form.Label>
                <Form.Control type="number" min="0" {...register('estimatedStay')} />
              </Form.Group>
            </Col>
            <Col md={8}>
              <Form.Group>
                <Form.Label>Notas adicionales</Form.Label>
                <Form.Control as="textarea" rows={2} {...register('additionalNotes')} />
              </Form.Group>
            </Col>
          </Row>
        </section>

        <section className="p-4 rounded border mb-4 bg-white">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="text-primary mb-0">Contacto de soporte</h5>
            <span className="text-muted">Persona de referencia</span>
          </div>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Nombre completo</Form.Label>
                <Form.Control type="text" {...register('emergencyName')} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Relación</Form.Label>
                <Form.Control type="text" {...register('emergencyRelationship')} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Teléfono</Form.Label>
                <Form.Control type="tel" {...register('emergencyPhone')} />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group>
                <Form.Label>Notas de respaldo</Form.Label>
                <Form.Control as="textarea" rows={2} {...register('emergencyNotes')} />
              </Form.Group>
            </Col>
          </Row>
        </section>

        <section className="p-4 rounded border mb-4 bg-white">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="text-primary mb-0">Cobertura financiera</h5>
            <span className="text-muted">Define el esquema de pago</span>
          </div>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Tipo de cobertura</Form.Label>
                <Form.Control as="select" {...register('coverageType')}>
                  {COVERAGE_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            {coverageType === 'seguro' && (
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Aseguradora</Form.Label>
                  <Form.Control as="select" {...register('insurerId')}>
                    <option value="">Selecciona aseguradora</option>
                    {insurers.map((seguro) => (
                      <option key={seguro.id} value={seguro.id}>{seguro.nombre}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
            )}
            <Col md={4}>
              <Form.Group>
                <Form.Label>Código / plan</Form.Label>
                <Form.Control type="text" {...register('planCode')} />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col>
              <Form.Group>
                <Form.Label>Observaciones de cobertura</Form.Label>
                <Form.Control as="textarea" rows={2} {...register('coverageNotes')} />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Nombre para facturación</Form.Label>
                <Form.Control type="text" {...register('billingName')} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>NIT / Tax ID</Form.Label>
                <Form.Control type="text" {...register('billingTaxId')} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Correo de envío</Form.Label>
                <Form.Control type="email" {...register('billingEmail')} />
              </Form.Group>
            </Col>
          </Row>
        </section>

        <div className="d-flex justify-content-end gap-3">
          <Button variant="outline-secondary" disabled={loading} onClick={handleClearForm}>
            Limpiar datos
          </Button>
          <Button variant="primary" disabled={loading} type="submit">
            {loading ? 'Guardando...' : 'Guardar registro'}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default FormularioAdmision;
