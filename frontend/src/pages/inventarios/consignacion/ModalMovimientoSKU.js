import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useMyContext } from './Context';

const ModalMovimientoSKU = () => {
    const {
        showModalMovimiento,
        setShowModalMovimiento,
        skuActivo,
        bodega,
        moverProducto
    } = useMyContext();

    const { register, handleSubmit, reset } = useForm();
    const [origenSeleccionado, setOrigenSeleccionado] = useState('');
    const [destinoSeleccionado, setDestinoSeleccionado] = useState('');

    useEffect(() => {
        if (!showModalMovimiento) {
            reset();
            setOrigenSeleccionado('');
            setDestinoSeleccionado('');
        }
    }, [showModalMovimiento, reset]);

    if (!skuActivo) return null;

    return (
        <Modal show={showModalMovimiento} onHide={() => setShowModalMovimiento(false)} size="lg" centered>
            <Modal.Header closeButton className="bg-light border-bottom">
                <Modal.Title className="text-uppercase fs-6">
                    Movimiento de productos - {skuActivo?.nombre}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <h6 className="text-primary fw-bold mb-3">Stock por bodega</h6>
                <div className="table-responsive">
                    <Table bordered size="sm" className="text-center mb-0">
                        <thead className="table-primary">
                            <tr>
                                {bodega.map((b, i) => (
                                    <th key={i}>{b.nombre}</th>
                                ))}
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {bodega.map((b, i) => {
                                    const stock = skuActivo.bodegas?.find(x => x.nombre_bodega === b.nombre);
                                    return <td key={i}>{stock ? stock.cantidad : 0}</td>;
                                })}
                                <td className="fw-bold text-primary">
                                    {bodega.reduce((acc, b) => {
                                        const stock = skuActivo.bodegas?.find(x => x.nombre_bodega === b.nombre);
                                        return acc + (stock?.cantidad ?? 0);
                                    }, 0)}
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </div>

                <h6 className="text-primary fw-bold mt-4 mb-2">Mover producto</h6>
                <Form onSubmit={handleSubmit((data) => {
                    moverProducto({ ...data, sku: skuActivo.id });
                    reset();
                })}>
                    <Row>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Bodega origen</Form.Label>
                                <Form.Control
                                    as="select"
                                    {...register("bodega_origen")}
                                    value={origenSeleccionado}
                                    onChange={(e) => setOrigenSeleccionado(e.target.value)}
                                    required
                                >
                                    <option value="">Seleccione</option>
                                    {bodega
                                        .filter(b => b.nombre !== destinoSeleccionado)
                                        .map((b, i) => (
                                            <option key={i} value={b.nombre}>{b.nombre}</option>
                                        ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Bodega destino</Form.Label>
                                <Form.Control
                                    as="select"
                                    {...register("bodega_destino")}
                                    value={destinoSeleccionado}
                                    onChange={(e) => setDestinoSeleccionado(e.target.value)}
                                    required
                                >
                                    <option value="">Seleccione</option>
                                    {bodega
                                        .filter(b => b.nombre !== origenSeleccionado)
                                        .map((b, i) => (
                                            <option key={i} value={b.nombre}>{b.nombre}</option>
                                        ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Cantidad</Form.Label>
                                <Form.Control
                                    type="number"
                                    min={1}
                                    {...register("cantidad")}
                                    required
                                />
                            </Form.Group>
                        </Col>

                        <Col md={1} className="d-flex align-items-end">
                            <Button type="submit" variant="primary" className="w-100">➤</Button>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ModalMovimientoSKU;
