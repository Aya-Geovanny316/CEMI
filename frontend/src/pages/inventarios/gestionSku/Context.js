import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
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
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [unidadMedida, setUnidadMedida] = useState([]);
  const [bodega, setBodega] = useState([]);
  const [skuActivo, setSkuActivo] = useState(null);
  const [principiosActivos, setPrincipiosActivos] = useState([]);
  const [showModalMovimiento, setShowModalMovimiento] = useState(false);
  // búsqueda global
  const [skusFiltrados, setSkusFiltrados] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [termBusqueda, setTermBusqueda] = useState('');
  const [searchPage, setSearchPage] = useState(1);
  const [searchNext, setSearchNext] = useState(null);
  const [searchPrev, setSearchPrev] = useState(null);

  // ⬇️ NEW: proveedores
  const [proveedores, setProveedores] = useState([]);

  // subcategorías filtradas
  const [subcategorias, setSubcategorias] = useState([]);

  // paginación
  const [page, setPage] = useState(1);
  const [nullNextPage, setNullNextPage] = useState(null);
  const [nullPrevPage, setPrevNextPage] = useState(null);

  const nextPage = () => setPage(prev => prev + 1);
  const prevPage = () => setPage(prev => prev - 1);

  const abrirModalMovimiento = (sku) => {
    setSkuActivo(sku);
    setShowModalMovimiento(true);
  };

  const cargarDatos = async () => {
    Swal.fire({
      title: 'Cargando...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const response = await getData(`inventario/skus/?page=${page}&page_size=50`);
      const resultados = response.data.results;

      setData(resultados);
      setNullNextPage(response.data.next);
      setPrevNextPage(response.data.previous);
      setSkusFiltrados(null); // reset filtro al cambiar de página
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
      Swal.fire({ icon: 'error', title: 'Error', text: 'Error al cargar admisiones' });
      console.error('Error al cargar admisiones:', error);
    }
  };

  const buscarSkusGlobal = async (termino, pageArg = 1) => {
    const q = (termino || '').trim();
    if (!q) {
      setSkusFiltrados(null);
      setTermBusqueda('');
      setSearchPage(1);
      setSearchNext(null);
      setSearchPrev(null);
      return;
    }
    setBuscando(true);
    try {
      const params = new URLSearchParams({ page_size: '50' });
      params.set('page', String(pageArg || 1));
      // Usar búsqueda OR del backend con ?q= para nombre/código/barcode
      params.set('q', q);
      const res = await getData(`inventario/skus/buscar/?${params.toString()}`);
      const resultados = Array.isArray(res.data) ? res.data : (res.data.results || []);
      setSkusFiltrados(resultados);
      setTermBusqueda(q);
      setSearchPage(pageArg || 1);
      setSearchNext(res.data?.next ?? null);
      setSearchPrev(res.data?.previous ?? null);
      if (resultados.length === 0) {
        Swal.fire({ icon: 'info', title: 'Sin resultados', text: 'No se encontraron SKUs que coincidan.' });
      }
    } catch (error) {
      console.error('Error al buscar SKUs:', error);
      Swal.fire({ icon: 'error', title: 'Error en la búsqueda', text: 'Ocurrió un problema al consultar el backend.' });
    } finally {
      setBuscando(false);
    }
  };

  const limpiarFiltroSkus = () => setSkusFiltrados(null);

  const buscarSkusNextPage = async () => {
    if (!termBusqueda || !searchNext) return;
    await buscarSkusGlobal(termBusqueda, searchPage + 1);
  };

  const buscarSkusPrevPage = async () => {
    if (!termBusqueda || !searchPrev) return;
    await buscarSkusGlobal(termBusqueda, Math.max(1, searchPage - 1));
  };

  const cargarCategorias = async () => {
    try {
      const response = await getData(`inventario/categorias/?page_size=100`);
      setCategorias(response.data.results);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const cargarMarcas = async () => {
    try {
      const response = await getData(`inventario/marcas/?page_size=100`);
      setMarcas(response.data.results);
    } catch (error) {
      console.error('Error al cargar marcas:', error);
    }
  };

  const cargarMedida = async () => {
    try {
      const response = await getData(`inventario/medidas/?page_size=100`);
      setUnidadMedida(response.data.results);
    } catch (error) {
      console.error('Error al cargar medidas:', error);
    }
  };

  const cargarBodega = async () => {
    try {
      const response = await getData(`inventario/bodegas/?page=1&page_size=20`);
      setBodega(response.data.results);
    } catch (error) {
      console.error('Error al cargar bodegas:', error);
    }
  };

  const cargarPrincipiosActivos = async () => {
    try {
      const response = await getData(`inventario/principios/?page=1&page_size=20`);
      setPrincipiosActivos(response.data.results);
    } catch (error) {
      console.error('Error al cargar principios activos:', error);
    }
  };

  // ⬇️ NEW: cargar proveedores desde endpoint
  const cargarProveedores = async () => {
    try {
      const response = await getData(`inventario/proveedores/?page=1&page_size=200`);
      const list = response?.data?.results ?? response?.data ?? [];
      setProveedores(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      setProveedores([]);
    }
  };

  // ✅ FIX: memoizar para que no cambie la referencia en cada render
  const cargarSubcategoriasPorCategoria = useCallback(async (categoriaNombre) => {
    try {
      if (!categoriaNombre) {
        setSubcategorias([]);
        return;
      }
      const cat = categorias.find(c => c?.nombre === categoriaNombre);
      const catId = cat?.id;
      if (!catId) {
        setSubcategorias([]);
        return;
      }

      const res = await getData(`inventario/categorias/subcategorias/${catId}?page_size=200`);
      const list = res.data?.results ?? res.data ?? [];

      // evitar re-render innecesario si la lista es igual (comparación simple por length + nombres)
      const next = Array.isArray(list) ? list : [];
      setSubcategorias(prev => {
        const sameLen = prev.length === next.length;
        const sameNames = sameLen && prev.every((p, i) => p.nombre === next[i]?.nombre);
        return sameLen && sameNames ? prev : next;
      });
    } catch (error) {
      console.error('Error al cargar subcategorías:', error);
      setSubcategorias([]);
    }
  }, [categorias]);

  const enviarDatos = async (data) => {
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
        NotificationManager.success("Marca Editada con exito", "Éxito", 3000);
        cargarDatos();
        setShow(false);
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
        await deleteData(`inventario/skus-eliminar/${id}/`);
        NotificationManager.success("Marca eliminada con éxito", "Éxito", 3000);
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
      await postData("inventario/skus/mover/", {
        sku: datos.sku,
        bodega_origen: datos.bodega_origen,
        bodega_destino: datos.bodega_destino,
        cantidad: parseInt(datos.cantidad),
      });
      NotificationManager.success("Movimiento realizado", "Éxito", 3000);
      cargarDatos();
      cargarBodega();
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
    setSubcategorias([]); // reset
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
    cargarCategorias();
    cargarMarcas();
    cargarMedida();
    cargarBodega();
    cargarPrincipiosActivos();
    // ⬇️ NEW: también cargar proveedores
    cargarProveedores();
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
    skusFiltrados,
    buscando,
    buscarSkusGlobal,
    limpiarFiltroSkus,
    termBusqueda,
    searchPage,
    searchNext,
    searchPrev,
    buscarSkusNextPage,
    buscarSkusPrevPage,
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
    principiosActivos,

    // subcategorías (memo)
    subcategorias,
    cargarSubcategoriasPorCategoria,
    setSubcategorias,

    // ⬇️ NEW: exponer proveedores
    proveedores,
    role,
  };

  return <MyContext.Provider value={values}>{children}</MyContext.Provider>;
};

export const useMyContext = () => useContext(MyContext);
