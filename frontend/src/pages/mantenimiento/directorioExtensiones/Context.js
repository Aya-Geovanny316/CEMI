import React, { createContext, useState, useContext, useEffect } from 'react';
import { getData, postData, putData, deleteData } from '../../../apiService';
import { NotificationManager } from "react-notifications";
import Swal from 'sweetalert2';

const MyContext = createContext();

export const ContextProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [show, setShow] = useState(false);
  const [modoFormulario, setModoFormulario] = useState('crear'); // 'crear', 'editar' o 'ver'
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);

  //paginacion
  const [page, setPage] = useState(1);
  const [nullNextPage, setNullNextPage] = useState(null)
  const [nullPrevPage, setPrevNextPage] = useState(null)

  const nextPage = () => {
    setPage(prev => prev + 1);
  }

  const prevPage = () => {
    setPage(prev => prev - 1);
  }

  const cargarDatos = async () => {
    Swal.fire({
      title: 'Cargando directorio...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await getData(`directorio-extensiones/?page=${page}`);
      const resultados = response.data.results;

      setData(resultados);
      setNullNextPage(response.data.next);
      setPrevNextPage(response.data.previous);

      Swal.close();

      if (resultados.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Sin resultados',
          text: 'No se encontraron extensiones en el directorio.',
        });
      }
    } catch (error) {
      Swal.close();

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar el directorio de extensiones',
      });

      console.error('Error al cargar admisiones:', error);
    }
  };

  const enviarDatos = async (data) => {
    console.log("DATOS", data)
    try {
      const response = await postData("directorio-extensiones/crear/", data);
      if (response?.status === 201 && response.data) {
        NotificationManager.success("Marca Creada", "Éxito", 3000);
        showModal()
      } else {
        NotificationManager.error("Algo salió mal", "Error", 5000);
        console.log("Algo salió mal", "Error", 5000)
      }
    } catch (err) {
      console.error('Error al crear usuario:', err);
    }
    cargarDatos()
  }

  const actualizarProveedor = async (datos) => {
    try {
      const response = await putData(`directorio-extensiones/actualizar/${datos.id}/`, datos);

      if (response.status === 200 || response.status === 204) {
        console.log("Proveedor actualizado con éxito:", response.data);
        NotificationManager.success("Marca Editada con exito", "Éxito", 3000);
        cargarDatos(); // recarga el listado si tenés esta función
        setShow(false); // cierra el modal
      } else {
        console.warn("Algo salió mal al actualizar:", response);
      }
    } catch (error) {
      console.error("Error al actualizar proveedor:", error);
    }
  };

  const eliminarProveedor = async (id) => {
    const confirmed = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará permanentemente el seguro.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmed.isConfirmed) {
      try {
        const response = await deleteData(`directorio-extensiones/eliminar/${id}/`);
        console.log('Proveedor eliminado:', response.status);
        NotificationManager.success("Marca eliminada con éxito", "Éxito", 3000);

        // Recargar listado o actualizar estado
        cargarDatos && cargarDatos();
      } catch (error) {
        console.error('Error al eliminar proveedor:', error);
        NotificationManager.error("Hubo un error al eliminar", "Error", 3000);
      }
    }
  };

  const showModal = () => setShow(!show);

  const abrirModalCrear = () => {
    setProveedorSeleccionado(null);
    setModoFormulario('crear');
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
    cargarDatos()
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
    eliminarProveedor
  };

  return <MyContext.Provider value={values}>{children}</MyContext.Provider>;
};

export const useMyContext = () => useContext(MyContext);