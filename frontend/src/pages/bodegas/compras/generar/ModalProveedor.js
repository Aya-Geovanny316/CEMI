// ModalProveedor.js
import React, { useContext } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { AppContext } from './Context';

const ModalProveedor = () => {
  const { showModalProveedor, setShowModalProveedor } = useContext(AppContext);

  return (
    <Modal show={showModalProveedor} onHide={() => setShowModalProveedor(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Seleccionar Proveedor</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>Este es un modal de proveedores</p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowModalProveedor(false)}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalProveedor;
