import React, { createContext, useState, useContext, useEffect } from 'react';
import { getData, postData, putData, deleteData } from '../../../apiService';
import { NotificationManager } from "react-notifications";
import Swal from 'sweetalert2';
import useDebouncedValue from '../../../utils/useDebouncedValue';

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
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const nextPage = () => {
    setPage(prev => prev + 1);
  }

  const prevPage = () => {
    setPage(prev => prev - 1);
  }

  const cargarDatos = async () => {
    Swal.fire({
      title: 'Cargando...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const qs = new URLSearchParams({ page: String(page), page_size: '50', ...(debouncedSearch ? { search: debouncedSearch } : {}) });
      const response = await getData(`mantenimiento/centros-costo/?${qs.toString()}`);
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
        text: 'Error al cargar centros de costo',
      });

      console.error('Error al cargar centros de costo:', error);
    }
  };

  const setSearchTerm = (term) => {
    setSearch(term);
    setPage(1);
  }

  const enviarDatos = async (data) => {
    console.log("DATOS", data)
    try {
      const response = await postData("mantenimiento/centros-costo/crear/", data);
      if (response?.status === 201 && response.data) {
        NotificationManager.success("Centro de Costo creado", "Éxito", 3000);
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
      const response = await putData(`mantenimiento/centros-costo/actualizar/${datos.id}/`, datos);

      if (response.status === 200 || response.status === 204) {
        console.log("Centro de costo actualizado con éxito:", response.data);
        NotificationManager.success("Centro de Costo editado", "Éxito", 3000);
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
      text: 'Esta acción eliminará permanentemente el centro de costo.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmed.isConfirmed) {
      try {
        const response = await deleteData(`mantenimiento/centros-costo/eliminar/${id}/`);
        console.log('Proveedor eliminado:', response.status);
        NotificationManager.success("Centro de Costo eliminado", "Éxito", 3000);

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
  }, [page, debouncedSearch]);

  const values = {
    data,
    show,
    showModal,
    nullNextPage,
    nullPrevPage,
    nextPage,
    prevPage,
    search,
    setSearchTerm,
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
