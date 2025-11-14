import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useMyContext } from './Context';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';

const ModalResetPassword = () => {
  const { showResetPassword, closeResetPasswordModal, username, data, resetUserPassword } = useMyContext();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isMismatch, setIsMismatch] = useState(false);

  const userData = username ? data.find((u) => u.username === username) : null;
  const userId = userData?.id;

  useEffect(() => {
    if (confirm.length > 0) {
      setIsMismatch(password !== confirm);
    } else {
      setIsMismatch(false);
    }
  }, [password, confirm]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isMismatch || !userId) return;

    try {
      await resetUserPassword(userId, password);
      alert('Contraseña restablecida correctamente');
      closeResetPasswordModal();
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      alert('Error al cambiar la contraseña');
    }
  };

  return (
    <Modal show={showResetPassword} onHide={closeResetPasswordModal} centered>
      <Modal.Header closeButton>
        <Modal.Title>Restablecer contraseña</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          {/* Nueva contraseña */}
          <Form.Group className="mb-3">
            <Form.Label>Nueva contraseña</Form.Label>
            <div className="d-flex align-items-center">
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la nueva contraseña"
                isInvalid={isMismatch}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{ marginLeft: '-30px', cursor: 'pointer' }}
              >
                {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
              </span>
            </div>
          </Form.Group>

          {/* Confirmar contraseña */}
          <Form.Group className="mb-3">
            <Form.Label>Confirmar contraseña</Form.Label>
            <div className="d-flex align-items-center">
              <Form.Control
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirma la contraseña"
                isInvalid={isMismatch}
              />
              <span
                onClick={() => setShowConfirm(!showConfirm)}
                style={{ marginLeft: '-30px', cursor: 'pointer' }}
              >
                {showConfirm ? <AiFillEyeInvisible /> : <AiFillEye />}
              </span>
            </div>
            {isMismatch && (
              <Form.Text className="text-danger">
                Las contraseñas no coinciden
              </Form.Text>
            )}
          </Form.Group>

          {/* Botones */}
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={closeResetPasswordModal}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={isMismatch}>Guardar</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalResetPassword;
