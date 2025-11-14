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
  const [role, setRole] = useState(null);
  const [categorias, setCategorias] = useState([])
  const [marcas, setMarcas] = useState([])
  const [unidadMedida, setUnidadMedida] = useState([]) //unidad de despacho
  const [bodega, setBodega] = useState([])
  const [skuActivo, setSkuActivo] = useState(null); // SKU seleccionado
  const [showModalMovimiento, setShowModalMovimiento] = useState(false);

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

  const abrirModalMovimiento = (sku) => {
    setSkuActivo(sku);
    setShowModalMovimiento(true);
  };


  const cargarDatos = async () => {
    Swal.fire({
      title: 'Cargando SKUs controlados...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const url = `inventario/skus-filtrados/?page=${page}&clasificacion=controlado&page_size=50`;
      const response = await getData(url);
      const resultados = response.data.results;

      setData(resultados);
      setNullNextPage(response.data.next);
      setPrevNextPage(response.data.previous);

      Swal.close();

      if (resultados.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Sin resultados',
          text: 'No se encontraron SKUs controlados.',
        });
      }
    } catch (error) {
      Swal.close();

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar SKUs controlados',
      });

      console.error('Error al cargar SKUs controlados:', error);
    }
  };

  const cargarCategorias = async () => {
    try {
      const response = await getData(`inventario/categorias/?page_size=100}`);
      //console.log(responseCategorias.data)
      setCategorias(response.data.results);
    } catch (error) {
      console.error('Error al cargar admisiones:', error);
    }
  }

  const cargarMarcas = async () => {
    try {
      const response = await getData(`inventario/marcas/?page_size=100}`);
      //console.log(response.data)
      setMarcas(response.data.results);
    } catch (error) {
      console.error('Error al cargar admisiones:', error);
    }
  }

  const cargarMedida = async () => {
    try {
      const response = await getData(`inventario/medidas/?page_size=100`);
      console.log(response.data)
      setUnidadMedida(response.data.results);
    } catch (error) {
      console.error('Error al cargar admisiones:', error);
    }
  }

  const cargarBodega = async () => {
    try {
      const response = await getData(`inventario/bodegas/?page=1&page_size=20`);
      console.log(response.data)
      setBodega(response.data.results);
    } catch (error) {
      console.error('Error al cargar admisiones:', error);
    }
  }

  const enviarDatos = async (data) => {
    console.log("DATOS", data);
    try {
      const response = await postData("inventario/skus-crear/", data);
      if (response?.status === 201 && response.data) {
        NotificationManager.success("SKU creado", "Éxito", 3000);
        showModal();
      } else {
        NotificationManager.error("Algo salió mal", "Error", 5000);
      }
    } catch (err) {
      const detail = err.response?.data;
      if (detail?.codigo_sku?.[0]) {
        NotificationManager.error(`Código duplicado: ${detail.codigo_sku[0]}`, "Error", 5000);
      } else {
        NotificationManager.error("Error desconocido al crear", "Error", 5000);
      }
      console.error('Error al crear usuario:', detail || err);
    }
    cargarDatos();
  };


  const actualizarProveedor = async (datos) => {
    try {
      const response = await putData(`inventario/skus-actualizar/${datos.id}/`, datos);

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
        const response = await deleteData(`inventario/skus-eliminar/${id}/`);
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

  const recargarSkuActivo = async (id) => {
    try {
      const res = await getData(`inventario/skus/${id}/`);
      setSkuActivo(res.data);
    } catch (error) {
      console.error("Error al recargar SKU activo:", error);
    }
  };

  const moverProducto = async (datos) => {
    try {
      const res = await postData("inventario/skus/mover/", {
        sku: datos.sku,
        bodega_origen: datos.bodega_origen,
        bodega_destino: datos.bodega_destino,
        cantidad: parseInt(datos.cantidad),
      });
      NotificationManager.success("Movimiento realizado", "Éxito", 3000);
      cargarDatos(); // Refresca lista de SKUs
      cargarBodega(); // Por si se modifica algo
      await recargarSkuActivo(datos.sku);
    } catch (error) {
      console.error("Error al mover producto:", error);
      NotificationManager.error("Error al mover producto", "Error", 4000);
    }
  };


  const showModal = () => setShow(!show);

  const abrirModalCrear = () => {
    setProveedorSeleccionado(null);
    setModoFormulario('crear');
    showModal();
  };

  const abrirModalEditar = (proveedor) => {
    console.log(proveedor)
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
    cargarCategorias()
    cargarMarcas()
    cargarMedida()
    cargarBodega()
    const getRole = () => {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      const r = u?.roles?.[0];
      return typeof r === "string" ? r : r?.id || null;
    };
    setRole(getRole());
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
    categorias,
    marcas,
    unidadMedida,
    bodega,
    skuActivo,
    setSkuActivo,
    showModalMovimiento,
    setShowModalMovimiento,
    abrirModalMovimiento,
    moverProducto,

  };

  return <MyContext.Provider value={values}>{children}</MyContext.Provider>;
};

export const useMyContext = () => useContext(MyContext);
