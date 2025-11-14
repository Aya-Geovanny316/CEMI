import React from 'react';
import { Table, Button } from 'react-bootstrap';
import { useMyContext } from './Context';
import { FcCancel, FcCheckmark } from 'react-icons/fc';
import { BsEye } from 'react-icons/bs';

export const Products = () => {
  const {
    data,
    deleteProduct,
    openCreateProductModal,
    openEditProductModal,
    openViewProductModal,
    nextPageUrl,
    prevPageUrl,
    fetchPage
  } = useMyContext();

  return (
    <div>
      <h1>Productos</h1>

      <Button variant="primary" onClick={openCreateProductModal} className="mb-3">
        Nuevo producto
      </Button>

      <Table striped responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Unidad</th>
            <th>Cantidad</th>
            <th>Categoría</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((product) => (
            <tr key={product.id}>
              <th scope="row">{product.id}</th>
              <td>{product.name}</td>
              <td>Q{product.price}</td>
              <td>{product.unit}</td>
              <td>{product.quantity}</td>
              <td>{product.category?.name || 'Sin categoría'}</td>
              <td>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-info"
                    onClick={() => openViewProductModal(product)}
                  >
                    <BsEye />
                  </Button>
                  <Button
                    variant="outline-success"
                    onClick={() => openEditProductModal(product)}
                  >
                    <FcCheckmark />
                  </Button>
                  <Button
                    variant="outline-danger"
                    onClick={() => deleteProduct(product.id)}
                  >
                    <FcCancel />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* PAGINACIÓN ABAJO A LA DERECHA */}
      <div className="d-flex justify-content-end mt-3 gap-2">
        <Button
          variant="outline-secondary"
          disabled={!prevPageUrl}
          onClick={() => fetchPage(prevPageUrl)}
        >
          Anterior
        </Button>
        <Button
          variant="outline-secondary"
          disabled={!nextPageUrl}
          onClick={() => fetchPage(nextPageUrl)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
};
