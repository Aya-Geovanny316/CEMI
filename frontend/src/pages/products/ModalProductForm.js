import React, { useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useMyContext } from './Context';

const ModalProductForm = () => {
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
    updateProduct,
    selectedProduct,
    isEditingProduct,
    isViewingProduct,
    formKey,
    categories,
  } = useMyContext();

  useEffect(() => {
    if (!selectedProduct || (!isEditingProduct && !isViewingProduct)) {
      reset({
        name: '',
        description: '',
        price: '',
        unit: '',
        quantity: '',
        category_id: '',
      });
    } else {
      reset({
        name: selectedProduct.name,
        description: selectedProduct.description,
        price: selectedProduct.price,
        unit: selectedProduct.unit,
        quantity: selectedProduct.quantity,
        category_id: selectedProduct.category?.id || '',
      });
    }
  }, [selectedProduct, isEditingProduct, isViewingProduct, reset]);

  const onSubmit = async (data) => {
    if (isViewingProduct) {
      showModal();
      return;
    }

    if (isEditingProduct) {
      await updateProduct({ ...selectedProduct, ...data });
    } else {
      await sendData(data);
    }
    reset();
  };

  return (
    <Modal show={show} onHide={showModal} centered>
      <Modal.Body>
        <div className="px-3 py-2">
          <h4 className="mb-4 fw-bold">
            {isViewingProduct
              ? 'Detalles del producto'
              : isEditingProduct
              ? 'Editar producto'
              : 'Nuevo producto'}
          </h4>

          <form key={formKey} onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input
                className="form-control"
                placeholder="Nombre del producto"
                readOnly={isViewingProduct}
                {...register('name', { required: 'Nombre requerido' })}
              />
              {errors.name && <p className="text-danger">{errors.name.message}</p>}
            </div>

            <div className="mb-3">
              <label className="form-label">Descripción</label>
              <textarea
                className="form-control"
                placeholder="Descripción"
                rows={3}
                readOnly={isViewingProduct}
                {...register('description')}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Precio</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                placeholder="Precio"
                readOnly={isViewingProduct}
                {...register('price', { required: 'Precio requerido' })}
              />
              {errors.price && <p className="text-danger">{errors.price.message}</p>}
            </div>

            <div className="mb-3">
              <label className="form-label">Unidad de medida</label>
              <input
                className="form-control"
                placeholder="Ej: kg, unidad, litro"
                readOnly={isViewingProduct}
                {...register('unit')}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Cantidad</label>
              <input
                type="number"
                className="form-control"
                placeholder="Cantidad disponible"
                readOnly={isViewingProduct}
                {...register('quantity')}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Categoría</label>
              <select
                className="form-control"
                disabled={isViewingProduct}
                {...register('category_id', { required: 'Categoría requerida' })}
              >
                <option value="">Seleccione una categoría</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="text-danger">{errors.category_id.message}</p>
              )}
            </div>

            {!isViewingProduct ? (
              <button type="submit" className="btn btn-primary w-100">
                {isEditingProduct ? 'Actualizar' : 'Guardar'}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-secondary w-100"
                onClick={showModal}
              >
                Cerrar
              </button>
            )}
          </form>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ModalProductForm;
