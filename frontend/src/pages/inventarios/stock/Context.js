import React, { createContext, useState, useContext, useEffect } from 'react';
import { getData, postData, putData, deleteData } from '../../../apiService';
import { NotificationManager } from "react-notifications";
import Swal from 'sweetalert2';

const MyContext = createContext();

export const ContextProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [dataFiltrada, setDataFiltrada] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [show, setShow] = useState(false);
  const [modoFormulario, setModoFormulario] = useState('crear'); // 'crear', 'editar' o 'ver'
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [bodega, setBodega] = useState([]);
  const [role, setRole] = useState(null);

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
      title: 'Cargando...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await getData(`inventario/skus-con-bodegas/?page=${page}&page_size=50`);
      const resultados = response.data.results;

      setData(resultados);
      // si había un filtro activo, lo limpiamos al recargar página
      setDataFiltrada(null);
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

  const buscarSkusStock = async (termino) => {
    const q = (termino || '').trim();
    if (!q) {
      setDataFiltrada(null);
      return;
    }

    setBuscando(true);
    try {
      // Usar búsqueda libre con ?q= para evitar intersección AND de filtros
      const params = new URLSearchParams({ page_size: '50', q });
      const res = await getData(`inventario/skus-con-bodegas/buscar/?${params.toString()}`);
      const resultados = Array.isArray(res.data) ? res.data : (res.data.results || []);

      setDataFiltrada(resultados);
      if (resultados.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Sin resultados',
          text: 'No se encontraron SKUs que coincidan con el término.',
        });
      }
    } catch (error) {
      console.error('Error al buscar SKUs (stock):', error);
      Swal.fire({
        icon: 'error',
        title: 'Error en la búsqueda',
        text: 'Ocurrió un problema al consultar el backend.',
      });
    } finally {
      setBuscando(false);
    }
  };

  const limpiarFiltroSkusStock = () => {
    setDataFiltrada(null);
  };

  const cargarBodega = async () => {
    try {
      const response = await getData(`inventario/bodegas/?page_size=20`);
      //console.log(response.data.results)
      setBodega(response.data.results);
    } catch (error) {
      console.error('Error al cargar admisiones:', error);
    }
  }

  const enviarDatos = async (data) => {
    console.log("DATOS", data)
    try {
      const response = await postData("inventario/marcas-crear/", data);
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
      const response = await putData(`inventario/marcas-actualizar/${datos.id}/`, datos);

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
        const response = await deleteData(`inventario/marcas-eliminar/${id}/`);
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

  const actualizarBodegaSKU = async (skuId, datos) => {
    try {
      const response = await putData(`inventario/skus-actualizar/${skuId}/`, datos);
      if (response.status === 200 || response.status === 204) {
        NotificationManager.success("Stock actualizado", "Éxito", 3000);
        cargarDatos();
      } else {
        NotificationManager.error("No se pudo actualizar el stock", "Error", 3000);
      }
    } catch (error) {
      console.error("Error al actualizar bodega:", error);
      NotificationManager.error("Error al actualizar bodega", "Error", 3000);
    }
  };


  useEffect(() => {
    cargarDatos();
    cargarBodega();
    const getRole = () => {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      const r = u?.roles?.[0];
      return typeof r === "string" ? r : r?.id || null;
    };
    setRole(getRole());
  }, [page]);

  const values = {
    data,
    dataFiltrada,
    buscando,
    show,
    showModal,
    nullNextPage,
    nullPrevPage,
    nextPage,
    prevPage,
    buscarSkusStock,
    limpiarFiltroSkusStock,
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
    bodega,
    actualizarBodegaSKU,
    role,
  };

  return <MyContext.Provider value={values}>{children}</MyContext.Provider>;
};

export const useMyContext = () => useContext(MyContext);
