import React, { useEffect, useState } from 'react';
import { Modal, Tab, Tabs, Row, Col, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useMyContext } from './Context';

const ModalUserForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
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
    data,
    formKey,
    openResetPasswordModal,
    updateUser,
    userDetail,
    unassignRol,
    departamentos,
  } = useMyContext();

  const userData = userDetail;

  const [active, setActive] = useState(true);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [assignedGroups, setAssignedGroups] = useState([]);
  const [isMedico, setIsMedico] = useState(false);

  const calcularEdadTexto = (fechaNacimiento) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);

    let años = hoy.getFullYear() - nacimiento.getFullYear();
    let meses = hoy.getMonth() - nacimiento.getMonth();
    let dias = hoy.getDate() - nacimiento.getDate();

    // Ajuste si aún no llegó el día del mes
    if (dias < 0) {
      meses--;
      dias += new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
    }

    // Ajuste si aún no llegó el mes
    if (meses < 0) {
      años--;
      meses += 12;
    }

    if (años > 0) {
      return `${años} año${años > 1 ? "s" : ""}`;
    } else if (meses > 0) {
      return `${meses} mes${meses > 1 ? "es" : ""}`;
    } else {
      return `${dias} día${dias > 1 ? "s" : ""}`;
    }
  }

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
    const dateToInput = (d) => (d ? d.split('T')[0] : '');

    if (isCreatingUser) {
      reset({});
      setIsMedico(false);
      setActive(true);
    } else if (userData) {
      reset({
        username: userData.username,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        ...userData.perfil,
        fecha_nacimiento: dateToInput(userData.perfil?.fecha_nacimiento),
        vencimiento_colegiado: dateToInput(userData.perfil?.vencimiento_colegiado),
      });
      setIsMedico(userData.perfil?.es_medico || false);
      setActive(Boolean(userData.is_active));
    }
  }, [isCreatingUser, isViewingUser, userData, reset]);


  const onSubmit = async (formData) => {
    // Asegurar campos booleanos
    const isActive = active;

    // Asegurar edad numérica
    const parseOrNull = (val) => {
      if (val === "" || val === null || val === undefined) return null;
      const num = parseInt(val, 10);
      return isNaN(num) ? null : num;
    };

    // Armar payload
    const payload = {
      username: formData.username,
      email: formData.email,
      password: isCreatingUser ? formData.password : undefined, // solo si estás creando
      first_name: formData.first_name || "",
      last_name: formData.last_name || "",
      is_active: isActive,
      perfil: {
        primer_nombre: formData.primer_nombre || "",
        segundo_nombre: formData.segundo_nombre || "",
        primer_apellido: formData.primer_apellido || "",
        segundo_apellido: formData.segundo_apellido || "",
        direccion: formData.direccion || "",
        telefono: formData.telefono || "",
        correo: formData.email || "",
        estado_civil: formData.estado_civil || "",
        fecha_nacimiento: formData.fecha_nacimiento || null,
        edad: parseOrNull(formData.edad),
        genero: formData.genero || "",
        dpi: formData.dpi || "",
        nit: formData.nit || "",
        departamento_laboral: formData.departamento_laboral || "",
        puesto: formData.puesto || "",
        perfil_acceso: formData.perfil_acceso || "",
        es_medico: isMedico,
        colegiado: formData.colegiado || "",
        vencimiento_colegiado: formData.vencimiento_colegiado || null,
        especialidad: formData.especialidad || "",
        banco: formData.banco || "",
        tipo_cuenta: formData.tipo_cuenta || "",
        numero_cuenta: formData.numero_cuenta || "",
        forma_pago: formData.forma_pago || "",
        regimen_sat: formData.regimen_sat || "",
      },
    };

    try {
      // Username a usar: si es edición tomar del detalle; si creación, del formulario
      const usernameToUse = isCreatingUser ? formData.username : (userData?.username || username);

      if (isCreatingUser) {
        await sendData(payload);
      } else {
        payload.id = userData.id;
        await updateUser(payload);
      }

      for (const roleName of assignedGroups) {
        await assignRol({ username: usernameToUse, role: roleName });
      }

      reset();
      showModal();
    } catch (error) {
      console.error("Error en el formulario", error);
    }
  };


  return (
    <Modal show={show} onHide={showModal} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isCreatingUser ? 'Registrar nuevo usuario' : isViewingUser ? 'Detalles del usuario' : 'Editar usuario'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-4 py-3">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs defaultActiveKey="personales" id="tabs-usuario" className="mb-3">
            {/* Datos personales */}
            <Tab eventKey="personales" title="Datos personales">
              <Row className="mb-3">
                <Col md={3}><Form.Label>Primer nombre</Form.Label><Form.Control {...register("primer_nombre")} /></Col>
                <Col md={3}><Form.Label>Segundo nombre</Form.Label><Form.Control {...register("segundo_nombre")} /></Col>
                <Col md={3}><Form.Label>Primer apellido</Form.Label><Form.Control {...register("primer_apellido")} /></Col>
                <Col md={3}><Form.Label>Segundo apellido</Form.Label><Form.Control {...register("segundo_apellido")} /></Col>
              </Row>
              <Row className="mb-3">
                <Col md={2}><Form.Label>DPI</Form.Label><Form.Control {...register("dpi")} /></Col>
                <Col md={2}><Form.Label>NIT</Form.Label><Form.Control {...register("nit")} /></Col>
                <Col md={3}><Form.Label>Teléfono</Form.Label><Form.Control {...register("telefono")} /></Col>
                <Col md={5}><Form.Label>Correo</Form.Label><Form.Control type="email" {...register("email")} /></Col>
              </Row>
              <Row className="mb-3">
                <Col md={3}>
                  <Form.Label>Estado civil</Form.Label>
                  <Form.Control as="select" {...register("estado_civil")}>
                    <option value="">Seleccione...</option>
                    <option value="soltero">Soltero/a</option>
                    <option value="casado">Casado/a</option>
                    <option value="divorciado">Divorciado/a</option>
                    <option value="union">Unión de Hecho</option>
                    <option value="viudo">Viudo/a</option>
                  </Form.Control>
                </Col>
                <Col md={3}>
                  <Form.Label>Género</Form.Label>
                  <Form.Control as="select" {...register("genero")}>
                    <option value="">Seleccione...</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                  </Form.Control>
                </Col>
                <Col md={3}><Form.Label>Fecha de nacimiento</Form.Label><Form.Control
                  type="date"
                  {...register("fecha_nacimiento")}
                  onChange={(e) => {
                    const valor = e.target.value;
                    const edadTexto = calcularEdadTexto(valor);
                    setValue("edad", edadTexto); // <-- llenamos el campo edad con el texto calculado
                  }}
                /></Col>
                <Col md={3}><Form.Label>Edad</Form.Label>
                  <Form.Control
                    type="text"
                    {...register("edad")}
                    readOnly
                  />
                </Col>
              </Row>
              <Form.Label>Dirección</Form.Label>
              <Form.Control as="textarea" rows={2} {...register("direccion")} />
            </Tab>

            {/* Datos laborales */}
            <Tab eventKey="laborales" title="Datos laborales">
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Departamento</Form.Label>
                  <Form.Control as="select" {...register("departamento_laboral", { required: isCreatingUser })}>
                    <option value="">Seleccione</option>
                    {(departamentos || []).map((d) => (
                      <option key={d.id} value={d.nombre}>{d.nombre}</option>
                    ))}
                  </Form.Control>
                  {errors?.departamento_laboral && <small className="text-danger">Departamento es obligatorio</small>}
                </Col>
                <Col md={6}><Form.Label>Puesto</Form.Label><Form.Control {...register("puesto")} /></Col>
              </Row>
              <Form.Label>Perfil de acceso</Form.Label>
              <Form.Control {...register("perfil_acceso")} />
            </Tab>

            {/* Datos médicos */}
            <Tab eventKey="medico" title="Médico">
              <Form.Check
                type="checkbox"
                label="¿Es médico?"
                checked={isMedico}
                onChange={() => setIsMedico(!isMedico)}
                className="mb-3"
              />
              {isMedico && (
                <>
                  <Row className="mb-3">
                    <Col md={6}><Form.Label>Colegiado</Form.Label><Form.Control {...register("colegiado")} /></Col>
                    <Col md={6}><Form.Label>Vencimiento colegiado</Form.Label><Form.Control type="date" {...register("vencimiento_colegiado")} /></Col>
                  </Row>
                  <Form.Label>Especialidad</Form.Label>
                  <Form.Control {...register("especialidad")} />
                </>
              )}
            </Tab>

            {/* Datos bancarios */}
            <Tab eventKey="bancarios" title="Datos bancarios">
              <Row className="mb-3">
                <Col md={6}><Form.Label>Banco</Form.Label><Form.Control {...register("banco")} /></Col>
                <Col md={6}><Form.Label>Tipo de cuenta</Form.Label><Form.Control {...register("tipo_cuenta")} /></Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}><Form.Label>Número de cuenta</Form.Label><Form.Control {...register("numero_cuenta")} /></Col>
                <Col md={6}><Form.Label>Forma de pago</Form.Label><Form.Control {...register("forma_pago")} /></Col>
              </Row>
              <Form.Label>Régimen SAT</Form.Label>
              <Form.Control {...register("regimen_sat")} />
            </Tab>
          </Tabs>

          {/* Activo */}
          <Form.Group className="mb-3">
            <Row className="mb-3">
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
              <Col md={10}>
                {/* Username (solo al crear) */}
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
          </Form.Group>

          {/* Grupos */}
          <Form.Group className="mb-4">
            <Form.Label>Grupos</Form.Label>
            <Row>
              <Col md={5}>
                <select id="groupLeft" multiple size={5} className="form-control" onDoubleClick={async () => {
                  const selected = [...document.getElementById('groupLeft').selectedOptions].map(opt => opt.value);
                  setAssignedGroups(prev => [...prev, ...selected]);
                  setAvailableGroups(prev => prev.filter(r => !selected.includes(r)));
                  // Asignar inmediatamente al hacer doble clic (solo en edición)
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
                  // Asignar inmediatamente (solo en edición)
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

                  // 👇 Desasignar roles en el backend
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
