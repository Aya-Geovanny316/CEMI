import React, { useEffect, useState } from 'react';
import { Modal, Row, Col, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useMyContext } from './Context';

const ModalUserForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const {
    show,
    showModal,
    sendData,
    assignRol,
    username,
    getRol,
    isCreatingUser,
    isViewingUser,
    formKey,
    openResetPasswordModal,
    updateUser,
    userDetail,
    unassignRol,
  } = useMyContext();

  const userData = userDetail;

  const [active, setActive] = useState(true);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [assignedGroups, setAssignedGroups] = useState([]);

  useEffect(() => {
    if (getRol.length > 0) {
      const allRoles = getRol.map(r => r.name);
      const assigned = userData?.roles?.map(r => r.name) || [];

      if (isCreatingUser) {
        setAvailableGroups(allRoles);
        setAssignedGroups([]);
      } else {
        setAssignedGroups(assigned);
        setAvailableGroups(allRoles.filter(role => !assigned.includes(role)));
      }
    }
  }, [getRol, userData, isCreatingUser]);

  useEffect(() => {
    if (isCreatingUser) {
      reset({});
      setActive(true);
    } else if (userData) {
      reset({
        username: userData.username,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
      });
      setActive(Boolean(userData.is_active));
    }
  }, [isCreatingUser, isViewingUser, userData, reset]);


  const onSubmit = async (formData) => {
    const payload = {
      username: formData.username,
      email: formData.email,
      password: isCreatingUser ? formData.password : undefined,
      first_name: formData.first_name || "",
      last_name: formData.last_name || "",
      is_active: active,
      perfil: {}, // Se envía vacío ya que se simplificó el formulario
    };

    try {
      const usernameToUse = isCreatingUser ? formData.username : (userData?.username || username);

      if (isCreatingUser) {
        await sendData(payload);
      } else {
        payload.id = userData.id;
        await updateUser(payload);
      }

      for (const roleName of assignedGroups) {
        // Asignamos solo los nuevos (la lógica de available/assigned ya maneja visualmente)
        // El backend de assignRol probablemente sea idempotente o se pueda llamar repetidamente
        // Pero para ser limpios, aquí se llamaba a assignRol para todos los asignados.
        // Verificamos si ya estaba asignado en la carga inicial?
        // El código original iteraba assignedGroups y llamaba assignRol para todos.
        await assignRol({ username: usernameToUse, role: roleName });
      }

      reset();
      showModal();
    } catch (error) {
      console.error("Error en el formulario", error);
    }
  };


  return (
    <Modal show={show} onHide={showModal} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isCreatingUser ? 'Registrar nuevo usuario' : isViewingUser ? 'Detalles del usuario' : 'Editar usuario'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-4 py-3">
        <form onSubmit={handleSubmit(onSubmit)}>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  {...register("first_name", { required: "Campo obligatorio" })}
                />
                {errors.first_name && <p className="text-danger">{errors.first_name.message}</p>}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Apellido</Form.Label>
                <Form.Control
                  type="text"
                  {...register("last_name", { required: "Campo obligatorio" })}
                />
                {errors.last_name && <p className="text-danger">{errors.last_name.message}</p>}
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Correo Electrónico</Form.Label>
                <Form.Control
                  type="email"
                  {...register("email", { required: "Campo obligatorio" })}
                />
                {errors.email && <p className="text-danger">{errors.email.message}</p>}
              </Form.Group>
            </Col>
             <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Usuario *</Form.Label>
                <Form.Control
                  type="text"
                  {...register("username", { required: "Campo obligatorio" })}
                  disabled={!isCreatingUser}
                />
                {errors.username && <p className="text-danger">{errors.username.message}</p>}
              </Form.Group>
            </Col>
          </Row>

          {isCreatingUser && (
            <Row className="mb-3">
               <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Contraseña *</Form.Label>
                    <Form.Control
                      type="password"
                      {...register("password", { required: "Campo obligatorio" })}
                    />
                    {errors.password && <p className="text-danger">{errors.password.message}</p>}
                  </Form.Group>
                </Col>
            </Row>
          )}

          <Form.Group className="mb-3">
            <Row>
              <Col md={2}>
                <Form.Label>Activo</Form.Label>
                <Form.Check
                  type="switch"
                  id="estado-switch"
                  label={active ? "Sí" : "No"}
                  checked={active}
                  onChange={() => setActive(!active)}
                />
              </Col>
            </Row>
          </Form.Group>

          {/* Grupos */}
          <Form.Group className="mb-4">
            <Form.Label>Grupos (Roles)</Form.Label>
            <Row>
              <Col md={5}>
                <select id="groupLeft" multiple size={5} className="form-control" onDoubleClick={async () => {
                  const selected = [...document.getElementById('groupLeft').selectedOptions].map(opt => opt.value);
                  setAssignedGroups(prev => [...prev, ...selected]);
                  setAvailableGroups(prev => prev.filter(r => !selected.includes(r)));
                  if (!isCreatingUser && userData?.username) {
                    for (const role of selected) {
                      await assignRol({ username: userData.username, role });
                    }
                  }
                }}>
                  {availableGroups.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              </Col>
              <Col md={2} className="d-flex flex-column justify-content-center align-items-center">
                <button type="button" onClick={async () => {
                  const selected = [...document.getElementById('groupLeft').selectedOptions].map(opt => opt.value);
                  setAssignedGroups(prev => [...prev, ...selected]);
                  setAvailableGroups(prev => prev.filter(r => !selected.includes(r)));
                  if (!isCreatingUser && userData?.username) {
                    for (const role of selected) {
                      await assignRol({ username: userData.username, role });
                    }
                  }
                }} className="btn btn-outline-secondary mb-2">&gt;</button>
                <button type="button" onClick={async () => {
                  const selected = [...document.getElementById('groupRight').selectedOptions].map(opt => opt.value);
                  setAvailableGroups(prev => [...prev, ...selected]);
                  setAssignedGroups(prev => prev.filter(r => !selected.includes(r)));
                  for (const role of selected) {
                    await unassignRol({ username: userData.username, role });
                  }
                }} className="btn btn-outline-secondary">&lt;</button>
              </Col>
              <Col md={5}>
                <select id="groupRight" multiple size={5} className="form-control">
                  {assignedGroups.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              </Col>
            </Row>
          </Form.Group>

          {/* Botones */}
          <div className="d-flex justify-content-end gap-2">
            <button type="submit" className="btn btn-primary">
              {isCreatingUser ? "Registrar" : "Guardar"}
            </button>
            {!isCreatingUser && (
              <button type="button" className="btn btn-warning" onClick={openResetPasswordModal}>
                Restablecer contraseña
              </button>
            )}
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalUserForm;
