import React, { createContext, useState, useContext, useEffect } from 'react';
import { getData, postData, putData, deleteData } from '../../../apiService';
import { NotificationManager } from "react-notifications";
import Swal from 'sweetalert2';

const MyContext = createContext();

export const ContextProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [show, setShow] = useState(false);
  const [modoFormulario, setModoFormulario] = useState('crear'); // 'crear', 'editar', 'ver'
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [role, setRole] = useState(null);

  // función de reset del formulario expuesta por el modal
  const [resetForm, setResetForm] = useState(null);

  // paginación
  const [page, setPage] = useState(1);
  const [nullNextPage, setNullNextPage] = useState(null);
  const [nullPrevPage, setPrevNextPage] = useState(null);

  const nextPage = () => setPage(prev => prev + 1);
  const prevPage = () => setPage(prev => prev - 1);

  const cargarDatos = async () => {
    Swal.fire({
      title: 'Cargando...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await getData(`inventario/principios/?page=${page}&page_size=50`);
      const resultados = response.data.results;

      setData(resultados);
      setNullNextPage(response.data.next);
      setPrevNextPage(response.data.previous);

      Swal.close();

      if (resultados.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Sin resultados',
          text: 'No se encontraron datos para los filtros aplicados.',
        });
      }
    } catch (error) {
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar admisiones',
      });
      console.error('Error al cargar admisiones:', error);
    }
  };

  const enviarDatos = async (payload) => {
    try {
      const response = await postData("inventario/principios-crear/", payload);
      if (response?.status === 201 && response.data) {
        NotificationManager.success("Marca Creada", "Éxito", 3000);
        showModal(); // cerrar modal
      } else {
        NotificationManager.error("Algo salió mal", "Error", 5000);
      }
    } catch (err) {
      console.error('Error al crear:', err);
      NotificationManager.error("Error al crear", "Error", 5000);
    }
    cargarDatos();
  };

  const actualizarProveedor = async (datos) => {
    try {
      const response = await putData(`inventario/principios-actualizar/${datos.id}/`, datos);
      if (response.status === 200 || response.status === 204) {
        NotificationManager.success("Marca Editada con éxito", "Éxito", 3000);
        cargarDatos();
        setShow(false);
      } else {
        console.warn("Algo salió mal al actualizar:", response);
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
      NotificationManager.error("Error al actualizar", "Error", 5000);
    }
  };

  const eliminarProveedor = async (id) => {
    const confirmed = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará permanentemente la marca.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmed.isConfirmed) {
      try {
        const response = await deleteData(`inventario/principios-eliminar/${id}/`);
        console.log('Proveedor eliminado:', response.status);
        NotificationManager.success("Marca eliminada con éxito", "Éxito", 3000);
        cargarDatos && cargarDatos();
      } catch (error) {
        console.error('Error al eliminar proveedor:', error);
        NotificationManager.error("Hubo un error al eliminar", "Error", 3000);
      }
    }
  };

  const showModal = () => setShow(prev => !prev);

  const abrirModalCrear = () => {
    setProveedorSeleccionado(null);
    setModoFormulario('crear');
    // resetear el formulario ANTES de abrir el modal (si el modal ya expuso su reset)
    if (typeof resetForm === 'function') {
      resetForm();
    }
    showModal();
  };

  const abrirModalEditar = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setModoFormulario('editar');
    showModal();
  };

  const abrirModalVer = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setModoFormulario('ver');
    showModal();
  };

  useEffect(() => {
    cargarDatos();
    const getRole = () => {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      const r = u?.roles?.[0];
      return typeof r === "string" ? r : r?.id || null;
    };
    setRole(getRole());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const values = {
    data,
    show,
    showModal,
    nullNextPage,
    nullPrevPage,
    nextPage,
    prevPage,
    enviarDatos,
    modoFormulario,
    setModoFormulario,
    proveedorSeleccionado,
    setProveedorSeleccionado,
    abrirModalEditar,
    abrirModalCrear,
    abrirModalVer,
    actualizarProveedor,
    eliminarProveedor,
    // para permitir que el modal registre su reset()
    setResetForm,
    role,
  };

  return <MyContext.Provider value={values}>{children}</MyContext.Provider>;
};

export const useMyContext = () => useContext(MyContext);
