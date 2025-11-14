import React, { createContext, useEffect, useState, useCallback } from 'react';
import { getData, postData, putData, deleteData } from '../../../apiService';
import { NotificationManager } from 'react-notifications';

export const AppContext = createContext();

export const ContextProvider = ({ children }) => {
  const [entradas, setEntradas] = useState([]);
  const [page, setPage] = useState(1);
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);
  const [filters, setFilters] = useState({ fecha: '', bodega: '', tipo: '' });

  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedEntrada, setSelectedEntrada] = useState(null);

  // Catálogos
  const [bodegas, setBodegas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [centrosCosto, setCentrosCosto] = useState([]);
  const [cuentasContables, setCuentasContables] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [skus, setSkus] = useState([]);

  const loadEntradas = useCallback(async () => {
    const qs = new URLSearchParams({ page: String(page), page_size: '20', ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)) });
    const res = await getData(`bodegas/entradas/?${qs.toString()}`);
    setEntradas(res.data.results || []);
    setNextUrl(res.data.next);
    setPrevUrl(res.data.previous);
  }, [page, filters]);

  const loadCatalogs = useCallback(async () => {
    const [b, p, cc, ct, c, sku] = await Promise.all([
      getData('inventario/bodegas/?page_size=200'),
      getData('inventario/proveedores/?page_size=200'),
      getData('mantenimiento/centros-costo/?page_size=200'),
      getData('mantenimiento/cuentas-contables/?page_size=200'),
      getData('inventario/categorias/?page_size=200'),
      getData('inventario/skus/?page_size=200'),
    ]);
    setBodegas(b.data.results || []);
    setProveedores(p.data.results || []);
    setCentrosCosto(cc.data.results || []);
    setCuentasContables(ct.data.results || []);
    setCategorias(c.data.results || []);
    setSkus(sku.data.results || []);
  }, []);

  const getSubcategoriasByCategoria = useCallback(async (categoriaId) => {
    if (!categoriaId) { setSubcategorias([]); return; }
    try {
      const res = await getData(`inventario/categorias/subcategorias/${categoriaId}/`);
      const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setSubcategorias(list);
    } catch (e) {
      console.error('Error al cargar subcategorías:', e);
      setSubcategorias([]);
    }
  }, []);

  useEffect(() => { loadEntradas(); }, [loadEntradas]);
  useEffect(() => { loadCatalogs(); }, [loadCatalogs]);

  const crearEntrada = async (payload) => {
    const res = await postData('bodegas/entradas/crear/', payload);
    await loadEntradas();
    return res;
  };

  const aplicarEntrada = async (id) => {
    const res = await postData(`bodegas/entradas/aplicar/${id}/`, {});
    await loadEntradas();
    if (res?.status === 200) {
      NotificationManager.success('Entrada aplicada correctamente', 'Éxito', 3000);
    }
    return res;
  }

  const actualizarEntrada = async (id, payload) => {
    const res = await putData(`bodegas/entradas/actualizar/${id}/`, payload);
    await loadEntradas();
    return res;
  }

  const eliminarEntrada = async (id) => {
    const res = await deleteData(`bodegas/entradas/eliminar/${id}/`);
    await loadEntradas();
    return res;
  }

  return (
    <AppContext.Provider value={{
      entradas,
      page, setPage,
      nextUrl, prevUrl,
      filters, setFilters,
      showForm, setShowForm,
      showDetail, setShowDetail,
      selectedEntrada, setSelectedEntrada,
      bodegas, proveedores, centrosCosto, cuentasContables, categorias, subcategorias, skus,
      getSubcategoriasByCategoria,
      crearEntrada,
      aplicarEntrada,
      actualizarEntrada,
      eliminarEntrada,
    }}>
      {children}
    </AppContext.Provider>
  );
};
