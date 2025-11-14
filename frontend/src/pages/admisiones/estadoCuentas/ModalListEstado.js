import React, { useContext } from 'react';
import { Modal, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { AppContext } from './Context';
import { FiPrinter } from 'react-icons/fi';

const ModalAdmision = () => {
    const {
        mostrarModal,
        setMostrarModal,
        modoFormulario,
        descargarPDF,
        admisionesMovimientos,
        totalPublico
    } = useContext(AppContext);

    const readOnly = modoFormulario === 'ver';

    return (
        <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} size="xl" centered scrollable>
            <Modal.Header closeButton>
                <Modal.Title>Ver estado de cuenta</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex justify-content-end flex-wrap gap-2 mb-3">
                    <OverlayTrigger overlay={<Tooltip>Imprimir estado de cuenta</Tooltip>}>
                        <Button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={descargarPDF}
                            disabled={admisionesMovimientos.length === 0}
                        >
                            <FiPrinter />
                        </Button>
                    </OverlayTrigger>
                </div>

                <div className="table-responsive">
                    <table className="table table-bordered table-sm">
                        <thead style={{ backgroundColor: '#cce5ff' }} className="text-dark fw-semibold">
                            <tr>
                                <th>Descripción</th>
                                <th>Facturar A</th>
                                <th>Cantidad</th>
                                <th>Precio Público</th>
                                <th>Total Público</th>
                                <th>Precio Aseguradora</th>
                                <th>Total Aseguradora</th>
                                <th>Precio Paciente</th>
                                <th>Total Paciente</th>
                                <th>Observación</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admisionesMovimientos.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.descripcion}</td>
                                    <td>{item.facturar_a}</td>
                                    <td>{item.cantidad}</td>
                                    <td>{item.precio_unitario}</td>
                                    <td>{totalPublico(item.precio_unitario, item.cantidad)}</td>
                                    <td>{item.precio_aseguradora}</td>
                                    <td>{item.total_aseguradora}</td>
                                    <td>{item.precio_paciente}</td>
                                    <td>{item.total_paciente}</td>
                                    <td>{item.observacion}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default ModalAdmision;