import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Table } from 'react-bootstrap';
import { usePreciosContext } from './Context';

const ModalPrecios = () => {
  const {
    showModalPrecios,
    setShowModalPrecios,
    skuActivo,
    seguros,
    cargarSeguros,
    sku,
    descripcionSku,
  } = usePreciosContext();

  const [valores, setValores] = useState({});

  useEffect(() => {
    if (skuActivo) {
      const map = {};
      skuActivo.precios?.forEach((p) => {
        map[p.seguro_id] = parseFloat(p.precio);
      });
      setValores(map);
    }
  }, [skuActivo]);

  useEffect(() => {
    cargarSeguros();
  }, [cargarSeguros]);

  const handleClose = () => setShowModalPrecios(false);

  return (
    <Modal show={showModalPrecios} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <div className="d-flex flex-column">
          <Modal.Title>Editar precios de {sku}</Modal.Title>
          <p className="text-muted mb-0">{descripcionSku}</p>
        </div>
      </Modal.Header>
      <Modal.Body>
        <Table bordered responsive size="sm">
          <thead className="table-primary">
            <tr>
              <th>Seguro</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            {seguros.map((seguro) => (
              <tr key={seguro.id}>
                <td>{seguro.nombre}</td>
                <td>
                  <Form.Control
                    type="number"
                    min="0"
                    value={valores[seguro.id] || ''}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalPrecios;
