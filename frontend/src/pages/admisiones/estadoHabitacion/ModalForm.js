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

const estiloTextarea = {
    ...estiloInputUniforme,
    resize: 'none',
};

const ModalForm = () => {
    const {
        mostrarModal,
        setMostrarModal,
        modoFormulario,
        handleSubmit,
        onSubmit,
        register,
        errors,
        mostrarSelectArea
    } = useContext(AppContext);

    const readOnly = modoFormulario === 'ver';

    return (
        <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} size="lg" centered>
            <Modal.Header closeButton className="bg-light border-bottom">
                <Modal.Title className="text-uppercase" style={{ fontSize: '16px' }}>
                    VER ESTADO HABITACION
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="px-4">
                <Form onSubmit={handleSubmit(onSubmit)}>
                    {/* Fila 1: Código, Área, Estado */}
                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Label className="fw-bold">CÓDIGO *</Form.Label>
                            <Form.Control
                                type="text"
                                value="E01-1"
                                disabled
                                style={estiloInputUniforme}
                            />
                        </Col>
                        <Col md={4}>
                            <Form.Label className="fw-bold">Área</Form.Label>
                            <Form.Control
                                type="text"
                                value="EMERGENCIA"
                                disabled
                                style={estiloInputUniforme}
                            />

                            {/* {mostrarSelectArea.some(rol => [1].includes(rol.id)) ? (
                                <Form.Control
                                    type="text"
                                    value="EMERGENCIA"
                                    disabled
                                    style={estiloInputUniforme}
                                />
                            ) : (
                                <Form.Control
                                    as="select"
                                    ref={register('area')}
                                    style={estiloInputUniforme}
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
                            )} */}
                        </Col>

                        <Col md={4}>
                            <Form.Label className="fw-bold">Estado</Form.Label>
                            <Form.Control
                                type="text"
                                value="Paciente con Egreso"
                                disabled
                                style={estiloInputUniforme}
                            />
                        </Col>
                    </Row>

                    {/* Fila 2: Admisión, Cambiar a, Observación */}
                    <Row className="mb-3">
                        <Col md={2}>
                            <Form.Label className="fw-bold">Admisión</Form.Label>
                            <Form.Control
                                type="text"
                                value="0"
                                disabled
                                style={estiloInputUniforme}
                            />
                        </Col>

                        {/* <Col md={5}>
                            <Form.Group>
                                <Form.Label className="fw-bold">Cambiar a *</Form.Label>
                                <Form.Control
                                    as="select"
                                    ref={register('nuevo_estado', { required: true })}
                                    disabled={readOnly}
                                    style={estiloInputUniforme}
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
                                <Form.Text className="text-muted fst-italic">
                                    Vacante inspeccionada = Disponible
                                </Form.Text>
                                {errors.nuevo_estado && (
                                    <Form.Control.Feedback type="invalid">
                                        Campo obligatorio
                                    </Form.Control.Feedback>
                                )}
                            </Form.Group>
                        </Col> */}

                        {/* <Col md={5}>
                            <Form.Group>
                                <Form.Label className="fw-bold">Observación</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3} // <- altura razonable
                                    ref={register('observacion')}
                                    disabled={readOnly}
                                    style={{
                                        fontSize: '14px',
                                        padding: '6px 10px',
                                        resize: 'vertical', // permite agrandar si el usuario quiere
                                        minHeight: '80px',  // altura inicial más cómoda
                                    }}
                                />
                            </Form.Group>
                        </Col> */}
                    </Row>

                    {/* Botón guardar */}
                    <div className="text-end mt-3">
                        <Button variant="dark" onClick={() => setMostrarModal(!mostrarModal)}>
                            Ok
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ModalForm;