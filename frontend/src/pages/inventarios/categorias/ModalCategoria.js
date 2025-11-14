import React, { useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useMyContext } from './Context';
import { useForm } from 'react-hook-form';

const ModalCategoria = () => {
  const {
    show, showModal, enviarDatos,
    proveedorSeleccionado, modoFormulario, actualizarProveedor,
    subcategorias, setSubcategorias
  } = useMyContext();

  const { register, handleSubmit, setValue, reset, getValues } = useForm();
  const readOnly = modoFormulario === 'ver';

  useEffect(() => {
    if (modoFormulario === 'crear') {
      reset();
      setSubcategorias([{ id: undefined, nombre: '' }]);
    }

    if ((modoFormulario === 'editar' || modoFormulario === 'ver') && proveedorSeleccionado) {
      Object.entries(proveedorSeleccionado).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modoFormulario, proveedorSeleccionado, reset, setValue]);

  // UI helpers para subcategorías como objetos
  const handleAddSubcategoria = () => {
    if (readOnly) return;
    setSubcategorias(prev => [...prev, { id: undefined, nombre: '' }]);
  };

  const handleRemoveSubcategoria = (index) => {
    if (readOnly) return;
    setSubcategorias(prev => {
      const copia = [...prev];
      const item = copia[index];
      // si tiene id, márcalo como eliminado para que el backend lo borre
      if (item?.id) {
        copia[index] = { ...item, _delete: true };
      } else {
        // si no tiene id (aún no persistido), simplemente quítalo del array
        copia.splice(index, 1);
      }
      return copia.length ? copia : [{ id: undefined, nombre: '' }];
    });
  };

  const handleChangeSubcategoria = (index, value) => {
    if (readOnly) return;
    setSubcategorias(prev => {
      const copia = [...prev];
      const item = copia[index] || { id: undefined, nombre: '' };
      copia[index] = {
        ...item,
        nombre: value,
        _dirty: item?.id ? true : !!value?.trim()
      };
      return copia;
    });
  };

  const onSubmit = (formData) => {
    // filtrar las que se verán/mandarán (incluye marcadas _delete para backend)
    const subcats = subcategorias
      .filter(sc => (sc?._delete === true) || (sc?.nombre !== undefined)) // mantén las marcadas eliminar y las editables
      .map(sc => ({
        id: sc?.id,
        nombre: sc?.nombre ?? '',
        _delete: !!sc?._delete,
        _dirty: !!sc?._dirty
      }));

    const payload = {
      ...formData,
      subcategorias: subcats
    };

    if (modoFormulario === 'crear') {
      enviarDatos(payload);
    } else if (modoFormulario === 'editar') {
      // asegúrate de mandar el id de la categoría
      const catId = proveedorSeleccionado?.id || getValues('id');
      actualizarProveedor({ ...payload, id: catId });
    }
  };

  return (
    <Modal show={show} onHide={showModal} size="sm" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          {modoFormulario === 'crear' && 'Nueva categoría'}
          {modoFormulario === 'editar' && 'Editar categoría'}
          {modoFormulario === 'ver' && 'Ver categoría'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group className="mb-2">
            <Form.Label>Nombre *</Form.Label>
            <Form.Control as="textarea" rows={1} {...register("nombre")} disabled={readOnly} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Estado</Form.Label>
            <Form.Control as="select" {...register("estado")} disabled={readOnly}>
              <option value="alta">Alta</option>
              <option value="baja">Baja</option>
            </Form.Control>
          </Form.Group>

          <hr />
          <Form.Label>Subcategorías</Form.Label>

          {subcategorias?.filter(sc => sc?._delete !== true).map((sub, index) => (
            <div key={sub?.id ?? `new-${index}`} className="d-flex mb-2 gap-2">
              <Form.Control
                type="text"
                value={sub?.nombre ?? ''}
                disabled={readOnly}
                onChange={(e) => handleChangeSubcategoria(index, e.target.value)}
              />
              {!readOnly && (
                <Button variant="danger" onClick={() => handleRemoveSubcategoria(index)}>X</Button>
              )}
            </div>
          ))}

          {!readOnly && (
            <Button variant="success" onClick={handleAddSubcategoria} className="mb-3">
              + Añadir Subcategoría
            </Button>
          )}

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={showModal}>Cerrar</Button>
            {modoFormulario !== 'ver' && (
              <Button variant="primary" type="submit">Guardar</Button>
            )}
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalCategoria;
