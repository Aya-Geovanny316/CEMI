// NursingPatientForm.jsx
import React, { useMemo, useState, useEffect } from 'react'
import { Container, Row, Col, Form, Tabs, Tab, Button, Card } from 'react-bootstrap'

/**
 * Props:
 *  patient: {
 *    admissionNumber: string|number,
 *    admissionDate: string|Date,     // ISO or Date
 *    name: string,
 *    age: number|string,
 *    areaType: 'Encamamiento' | 'Emergencia' | 'Otros',
 *    location: string,               // habitación / cubículo
 *    insurer: string,                // aseguradora o "Privado"
 *    bloodType: string,              // e.g. "O+"
 *    allergies: string,
 *    consultationReason: string,
 *    weightKg?: number|string        // optional, initial
 *  }
 *  onSave?: (payload) => void        // optional
 */
export default function NursingPatientForm({ patient, onSave }) {
  const formatDate = (d) => {
    if (!d) return ''
    const dt = d instanceof Date ? d : new Date(d)
    if (Number.isNaN(dt.getTime())) return ''
    // dd/mm/yyyy (LatAm common)
    const dd = String(dt.getDate()).padStart(2, '0')
    const mm = String(dt.getMonth() + 1).padStart(2, '0')
    const yyyy = dt.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  }

  // ----- Local form state (detail) -----
  const [activeKey, setActiveKey] = useState('vitals')
  const [vitals, setVitals] = useState({
    weightKg: patient?.weightKg ?? '',
    heightCm: '',
    temperatureC: '',
    heartRate: '',
    respiratoryRate: '',
    bpSys: '',
    bpDia: '',
    oxygenSat: ''
  })

  const [notes, setNotes] = useState('')
  const [procedures, setProcedures] = useState('')
  const [other, setOther] = useState('')

  // Keep weight reflected in header whenever it changes in the Vitals tab
  const headerWeight = useMemo(() => {
    if (vitals.weightKg === '' || vitals.weightKg === null || vitals.weightKg === undefined) return '—'
    return `${vitals.weightKg} kg`
  }, [vitals.weightKg])

  // ----- Handlers -----
  const handleVitalChange = (field) => (e) => {
    const val = e.target.value
    setVitals((prev) => ({ ...prev, [field]: val }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      patient: {
        admissionNumber: patient?.admissionNumber ?? '',
        admissionDate: patient?.admissionDate ?? '',
        name: patient?.name ?? '',
        age: patient?.age ?? '',
        areaType: patient?.areaType ?? '',
        location: patient?.location ?? '',
        insurer: patient?.insurer ?? '',
        bloodType: patient?.bloodType ?? '',
        allergies: patient?.allergies ?? '',
        consultationReason: patient?.consultationReason ?? '',
        // persist weight captured by nursing
        weightKg: vitals.weightKg
      },
      vitals,
      notes,
      procedures,
      other
    }
    onSave?.(payload)
  }

  // ----- UI -----
  return (
    <Container fluid className="py-3">
      {/* Header */}
      <Card className="mb-3 shadow-sm">
        <Card.Body>
          <Row className="align-items-center">
            <Col>
              <h3 className="mb-0" style={{ fontWeight: 700 }}>
                Enfermería: Ficha del Paciente
              </h3>
            </Col>
          </Row>
          <hr />
          <Row className="gy-2" style={{ fontSize: '1.05rem', lineHeight: 1.3 }}>
            <Col md={3}>
              <strong>Admisión:</strong>{' '}
              <span>{patient?.admissionNumber ?? '—'}</span>
            </Col>
            <Col md={3}>
              <strong>Fecha de Admisión:</strong>{' '}
              <span>{formatDate(patient?.admissionDate) || '—'}</span>
            </Col>
            <Col md={3}>
              <strong>Nombre:</strong>{' '}
              <span>{patient?.name ?? '—'}</span>
            </Col>
            <Col md={3}>
              <strong>Edad:</strong>{' '}
              <span>{patient?.age ?? '—'}</span>
            </Col>

            <Col md={4}>
              <strong>Área:</strong>{' '}
              <span>
                {patient?.areaType ?? '—'}
                {patient?.location ? ` — ${patient.location}` : ''}
              </span>
            </Col>
            <Col md={4}>
              <strong>Aseguradora:</strong>{' '}
              <span>{patient?.insurer ?? '—'}</span>
            </Col>
            <Col md={4}>
              <strong>Peso:</strong>{' '}
              <span>{headerWeight}</span>
            </Col>
          </Row>

          {/* Read-only medical fields (visible to nursing, edited by resident) */}
          <Row className="mt-3">
            <Col md={4}>
              <Form.Group controlId="readonly-consult-reason">
                <Form.Label className="mb-1"><strong>Motivo de la Consulta</strong></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  readOnly
                  plaintext={false}
                  value={patient?.consultationReason ?? ''}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="readonly-blood-type">
                <Form.Label className="mb-1"><strong>Tipo de Sangre</strong></Form.Label>
                <Form.Control
                  type="text"
                  readOnly
                  value={patient?.bloodType ?? ''}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="readonly-allergies">
                <Form.Label className="mb-1"><strong>Alergias</strong></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  readOnly
                  value={patient?.allergies ?? ''}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  )
}