// Context.js
import React, { createContext, useEffect, useState, useCallback } from 'react';
import { postData, putData, getData } from '../../../../apiService';

export const AppContext = createContext();

export const ContextProvider = ({ children }) => {
  const [showModalProveedor, setShowModalProveedor] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [requisicionSeleccionada, setRequisicionSeleccionada] = useState(null);

  const [bodegas, setBodegas] = useState([]);
  const [proveedores, setProveedores] = useState([]); 
  const [categorias, setCategorias] = useState([]); 
  const [skus, setSkus] = useState([]); 
  const [centrosCosto, setCentrosCosto] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);

  // NUEVO: subcategorías dependientes de la categoría seleccionada
  const [subcategorias, setSubcategorias] = useState([]);
  const [loadingSubcats, setLoadingSubcats] = useState(false);

  const getBodegas = async () => {
    try {
      const response = await getData('/inventario/bodegas/?page_size=100');
      setBodegas(response.data.results);
    } catch (error) {
      console.error('Error al cargar bodegas:', error);
    }
  };

  const getProveedores = async () => {
    try {
      const response = await getData('/inventario/proveedores/?page_size=100');
      setProveedores(response.data.results);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
    }
  };

  const getCategorias = async () => {
    try {
      const response = await getData('/inventario/categorias/?page_size=100');
      setCategorias(response.data.results);
    } catch (error) {
      console.error('Error al cargar categorias:', error);
    }
  };

  const getSkus = async () => {
    try {
      const response = await getData('/inventario/skus/?page_size=100');
      setSkus(response.data.results);
    } catch (error) {
      console.error('Error al cargar SKUs:', error);
    }
  };

  const getCentrosCosto = async () => {
    try {
      const res = await getData('/mantenimiento/centros-costo/?page_size=200');
      setCentrosCosto(res?.data?.results ?? res?.data ?? []);
    } catch (error) {
      console.error('Error al cargar centros de costo:', error);
      setCentrosCosto([]);
    }
  };

  const getDepartamentos = async () => {
    try {
      const res = await getData('/mantenimiento/departamentos/?page_size=200');
      setDepartamentos(res?.data?.results ?? res?.data ?? []);
    } catch (error) {
      console.error('Error al cargar departamentos:', error);
      setDepartamentos([]);
    }
  };

  // NUEVO: cargar subcategorías por categoría (id)
  const getSubcategoriasByCategoria = useCallback(async (categoriaId) => {
    if (!categoriaId) {
      setSubcategorias([]);
      return;
    }
    try {
      setLoadingSubcats(true);
      const res = await getData(`/inventario/categorias/subcategorias/${categoriaId}?page_size=200`);
      const list = res?.data?.results ?? res?.data ?? [];
      setSubcategorias(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error al cargar subcategorías:', error);
      setSubcategorias([]);
    } finally {
      setLoadingSubcats(false);
    }
  }, []);

  const toggleModalProveedor = () => {
    setShowModalProveedor(!showModalProveedor);
  };

  const abrirModal = (requisicion) => {
    setRequisicionSeleccionada(requisicion);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setRequisicionSeleccionada(null);
  };

  const crearRequisicion = async (formulario, productos = [], servicios = []) => {
    // Remover 'id' temporal de frontend antes de enviar
    const cleanProductos = productos.map(({ id, ...rest }) => rest);
    const cleanServicios = servicios.map(({ id, ...rest }) => rest);

    const payload = {
      ...formulario,
      productos: cleanProductos,
      servicios: cleanServicios,
    };

    try {
      const response = await postData('/requisisiones/guardar/', payload);
      console.log('Requisición guardada:', response.data);
      alert('✅ Requisición guardada correctamente');
    } catch (error) {
      console.error('❌ Error al guardar requisición:', error.response?.data || error);
      alert('Error al guardar la requisición');
    }
  };

  useEffect(() => {
    getBodegas();
    getProveedores();
    getCategorias();
    getSkus();
    getCentrosCosto();
    getDepartamentos();
  }, []);

  const values = {
    showModalProveedor,
    setShowModalProveedor,
    toggleModalProveedor,
    showModal,
    abrirModal,
    cerrarModal,
    requisicionSeleccionada,
    crearRequisicion,

    bodegas,
    proveedores,
    categorias,
    skus,
    centrosCosto,
    departamentos,

    // Exponer subcategorías y loader
    subcategorias,
    loadingSubcats,
    getSubcategoriasByCategoria,
    setSubcategorias,
  };

  return (
    <AppContext.Provider value={values}>
      {children}
    </AppContext.Provider>
  );
};
