import React, { useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { AppContext } from './Context';

const estiloInputUniforme = {
    height: '34px',
    fontSize: '14px',
    padding: '5px 10px',
};

const ModalForm = () => {
    const {
        mostrarModal,
        setMostrarModal,
        modoFormulario,
        handleSubmit,
        onSubmit,
        register,
        watch,
        errors
    } = useContext(AppContext);

    const readOnly = modoFormulario === 'ver';

    return (
        <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} size="lg" centered>
            <Modal.Header closeButton className="bg-light border-bottom">
                <Modal.Title className="text-uppercase" style={{ fontSize: '16px' }}>
                    {modoFormulario === 'ver'
                        ? 'VER HABITACIÓN'
                        : modoFormulario === 'editar'
                        ? 'EDITAR HABITACIÓN'
                        : 'CREAR HABITACIÓN'}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="px-4">
                <Form onSubmit={handleSubmit(onSubmit)}>
                    {/* Fila 1: Código, Área, Nivel */}
                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Label className="fw-bold">CÓDIGO *</Form.Label>
                            <Form.Control
                                type="text"
                                {...register('codigo', { required: true })}
                                defaultValue={watch('codigo')}
                                disabled={readOnly}
                                style={estiloInputUniforme}
                                isInvalid={!!errors.codigo}
                            />
                        </Col>
                        <Col md={4}>
                            <Form.Label className="fw-bold">Área</Form.Label>
                            <Form.Control
                                type="text"
                                {...register('area', { required: true })}
                                defaultValue={watch('area')}
                                disabled={readOnly}
                                style={estiloInputUniforme}
                                isInvalid={!!errors.area}
                            />
                        </Col>
                        <Col md={4}>
                            <Form.Label className="fw-bold">Nivel</Form.Label>
                            <Form.Control
                                type="text"
                                {...register('nivel', { required: true })}
                                defaultValue={watch('nivel')}
                                disabled={readOnly}
                                style={estiloInputUniforme}
                                isInvalid={!!errors.nivel}
                            />
                        </Col>
                    </Row>

                    {/* Fila 2: Estado, Admisión, Paciente */}
                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Label className="fw-bold">Estado</Form.Label>
                            <Form.Control
                                as="select"
                                {...register('nuevo_estado', { required: true })}
                                disabled={readOnly}
                                style={estiloInputUniforme}
                                defaultValue={watch('estado')}
                                isInvalid={!!errors.nuevo_estado}
                            >
                                <option value="">Seleccione...</option>
                                <option value="Reservada X Cirugía">Reservada X Cirugía</option>
                                <option value="Vacante Limpia">Vacante Limpia</option>
                                <option value="Paciente con Egreso">Paciente con Egreso</option>
                                <option value="Vacante Inspeccionada -DISPONIBLE-">Vacante Inspeccionada -DISPONIBLE-</option>
                                <option value="Ocupada Limpia">Ocupada Limpia</option>
                                <option value="Ocupada Sucia">Ocupada Sucia</option>
                                <option value="Ocupada Inspeccionada">Ocupada Inspeccionada</option>
                                <option value="Fuera de Servicio">Fuera de Servicio</option>
                                <option value="Fuera de Orden">Fuera de Orden</option>
                            </Form.Control>
                            {errors.nuevo_estado && (
                                <Form.Control.Feedback type="invalid">
                                    Campo obligatorio
                                </Form.Control.Feedback>
                            )}
                        </Col>

                        <Col md={4}>
                            <Form.Label className="fw-bold">Admisión</Form.Label>
                            <Form.Control
                                type="text"
                                {...register('admision')}
                                defaultValue={watch('admision')}
                                disabled={readOnly}
                                style={estiloInputUniforme}
                            />
                        </Col>

                        <Col md={4}>
                            <Form.Label className="fw-bold">Paciente</Form.Label>
                            <Form.Control
                                type="text"
                                {...register('paciente')}
                                defaultValue={watch('paciente')}
                                disabled={readOnly}
                                style={estiloInputUniforme}
                            />
                        </Col>
                    </Row>

                    {/* Fila 3: Observación */}
                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Label className="fw-bold">Observación</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                {...register('observacion')}
                                defaultValue={watch('observacion')}
                                disabled={readOnly}
                                style={{
                                    fontSize: '14px',
                                    padding: '6px 10px',
                                    resize: 'vertical',
                                    minHeight: '80px',
                                }}
                            />
                        </Col>
                    </Row>

                    {/* Botón guardar */}
                    {modoFormulario !== 'ver' && (
                        <div className="text-end mt-3">
                            <Button type="submit" variant="dark">
                                Guardar
                            </Button>
                        </div>
                    )}
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ModalForm;
