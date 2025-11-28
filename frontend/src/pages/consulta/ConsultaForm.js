import React, { useContext } from 'react';
import {
  Alert,
  Badge,
  Button,
  Col,
  Row,
} from 'react-bootstrap';
import { FiPrinter, FiSave } from 'react-icons/fi';

import { ConsultaContext } from './context';

const ConsultaForm = () => {
  const {
    handleSubmit,
    register,
    departamentos,
    selectedDepartamento,
    setSelectedDepartamento,
    onSubmit,
    saving,
    selectedPatient,
  } = useContext(ConsultaContext);

  return (
    <>
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h5 className="mb-1">Datos de la consulta</h5>
          <small className="text-muted">
            Completa los sintomas y hallazgos para generar el recibo.
          </small>
        </div>
        <Badge bg={selectedPatient ? 'primary' : 'secondary'}>
          {selectedPatient ? 'Paciente listo' : 'Selecciona un paciente'}
        </Badge>
      </div>

      {!selectedPatient && (
        <Alert variant="warning" className="py-2">
          Selecciona un paciente de la tabla para habilitar el formulario.
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Row className="mb-3">
          <Col sm={6}>
            <div className="mb-2">
              <label className="form-label">Fecha *</label>
              <input
                type="date"
                className="form-control"
                {...register('fecha', { required: true })}
                disabled={!selectedPatient}
              />
            </div>
          </Col>
          <Col sm={6}>
            <div className="mb-2">
              <label className="form-label">Departamento *</label>
              <select
                className="form-control"
                value={selectedDepartamento}
                onChange={(e) => setSelectedDepartamento(e.target.value)}
                disabled={!selectedPatient}
              >
                <option value="">Selecciona</option>
                {departamentos.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.nombre}</option>
                ))}
              </select>
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col sm={8}>
            <div className="mb-2">
              <label className="form-label">Nombre del paciente</label>
              <input
                type="text"
                className="form-control"
                value={selectedPatient?.nombre_completo || ''}
                readOnly
              />
            </div>
          </Col>
          <Col sm={4}>
            <div className="mb-2">
              <label className="form-label">Edad (años)</label>
              <input
                className="form-control"
                type="number"
                {...register('edad')}
                disabled={!selectedPatient}
              />
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col sm={8}>
            <div className="mb-2">
              <label className="form-label">Medico</label>
              <input
                className="form-control"
                type="text"
                placeholder="Nombre del medico"
                {...register('medico')}
                disabled={!selectedPatient}
              />
            </div>
          </Col>
          <Col sm={4}>
            <div className="mb-2">
              <label className="form-label">Total (Q)</label>
              <input
                className="form-control"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register('monto')}
                disabled={!selectedPatient}
              />
            </div>
          </Col>
        </Row>

        <div className="mb-3">
          <label className="form-label">Motivo de consulta (MC) *</label>
          <textarea
            className="form-control"
            rows={2}
            placeholder="Motivo principal"
            {...register('mc', { required: true })}
            disabled={!selectedPatient}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Historia de la enfermedad actual (HEA) *</label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Describe la evolución y síntomas"
            {...register('hea', { required: true })}
            disabled={!selectedPatient}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Signos vitales</label>
          <Row>
            <Col md={2}>
              <input
                className="form-control"
                placeholder="PA"
                {...register('sv_pa')}
                disabled={!selectedPatient}
              />
            </Col>
            <Col md={2}>
              <input
                className="form-control"
                placeholder="Fc"
                {...register('sv_fc')}
                disabled={!selectedPatient}
              />
            </Col>
            <Col md={2}>
              <input
                className="form-control"
                placeholder="Fr"
                {...register('sv_fr')}
                disabled={!selectedPatient}
              />
            </Col>
            <Col md={2}>
              <input
                className="form-control"
                placeholder="Sat"
                {...register('sv_sat')}
                disabled={!selectedPatient}
              />
            </Col>
            <Col md={2}>
              <input
                className="form-control"
                placeholder="Peso (Lbs)"
                {...register('sv_peso')}
                disabled={!selectedPatient}
              />
            </Col>
          </Row>
        </div>

        <div className="mb-3">
          <label className="form-label">Examen físico</label>
          <textarea
            className="form-control"
            rows={2}
            {...register('examen_fisico')}
            disabled={!selectedPatient}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Estudios</label>
          <textarea
            className="form-control"
            rows={2}
            {...register('estudios')}
            disabled={!selectedPatient}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Impresión clínica (una por línea)</label>
          <textarea
            className="form-control"
            rows={2}
            placeholder="1 diagnóstico por línea"
            {...register('impresion_clinica')}
            disabled={!selectedPatient}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Tratamiento (una indicación por línea)</label>
          <textarea
            className="form-control"
            rows={2}
            placeholder="Indicaciones y medicamentos"
            {...register('tratamiento')}
            disabled={!selectedPatient}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Plan (una acción por línea)</label>
          <textarea
            className="form-control"
            rows={2}
            placeholder="Acciones o seguimiento"
            {...register('plan')}
            disabled={!selectedPatient}
          />
        </div>

        <Row className="mb-3">
          <Col sm={7}>
            <div className="mb-2">
              <label className="form-label">Observaciones</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Notas u observaciones adicionales"
                {...register('observaciones')}
                disabled={!selectedPatient}
              />
            </div>
          </Col>
          <Col sm={5}>
            <div className="mb-2">
              <label className="form-label">Metodo de pago</label>
              <select
                className="form-control"
                {...register('metodoPago')}
                disabled={!selectedPatient}
              >
                <option value="">Selecciona</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Seguro">Seguro</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </Col>
        </Row>

        <div className="d-flex justify-content-end gap-2">
          <Button
            variant="primary"
            type="submit"
            disabled={!selectedPatient || saving}
            className="d-flex align-items-center gap-2"
          >
            {saving ? (
              'Guardando...'
            ) : (
              <>
                <FiSave /> Guardar y generar PDF <FiPrinter />
              </>
            )}
          </Button>
        </div>
      </form>
    </>
  );
};

export default ConsultaForm;
