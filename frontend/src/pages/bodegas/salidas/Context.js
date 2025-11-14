import React, { createContext, useEffect, useState, useCallback } from 'react';
import { getData, postData } from '../../../apiService';
import { NotificationManager } from 'react-notifications';

export const AppContext = createContext();

export const ContextProvider = ({ children }) => {
  const [salidas, setSalidas] = useState([]);
  const [page, setPage] = useState(1);
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);
  const [filters, setFilters] = useState({ fecha: '', bodega: '', tipo: '' });

  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedSalida, setSelectedSalida] = useState(null);

  // Catálogos
  const [bodegas, setBodegas] = useState([]);
  const [centrosCosto, setCentrosCosto] = useState([]);
  const [cuentasContables, setCuentasContables] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [skus, setSkus] = useState([]);
  // Admisiones por área
  const [areas, setAreas] = useState([]);
  const [admisionesPorArea, setAdmisionesPorArea] = useState({});

  const loadSalidas = useCallback(async () => {
    try {
      const qs = new URLSearchParams({
        page: String(page),
        page_size: '20',
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });
      const res = await getData(`bodegas/salidas/?${qs.toString()}`);
      setSalidas(res.data.results || []);
      setNextUrl(res.data.next);
      setPrevUrl(res.data.previous);
    } catch (err) {
      console.error('Error cargando salidas:', err?.response?.data || err?.message || err);
      NotificationManager.error('No se pudieron cargar las salidas', 'Error', 4000);
      setSalidas([]);
      setNextUrl(null);
      setPrevUrl(null);
    }
  }, [page, filters]);

  const loadCatalogs = useCallback(async () => {
    const [b, cc, ct, c, sku, admAreas] = await Promise.all([
      getData('inventario/bodegas/?page_size=200'),
      getData('mantenimiento/centros-costo/?page_size=200'),
      getData('mantenimiento/cuentas-contables/?page_size=200'),
      getData('inventario/categorias/?page_size=200'),
      getData('inventario/skus/?page_size=200'),
      getData('admisiones/admisiones-por-area/'),
    ]);
    setBodegas(b.data.results || []);
    setCentrosCosto(cc.data.results || []);
    setCuentasContables(ct.data.results || []);
    setCategorias(c.data.results || []);
    setSkus(sku.data.results || []);
    const mapa = admAreas?.data || {};
    setAdmisionesPorArea(mapa);
    setAreas(Object.keys(mapa));
  }, []);

  const getSubcategoriasByCategoria = useCallback(async (categoriaId) => {
    if (!categoriaId) { setSubcategorias([]); return; }
    const res = await getData(`inventario/categorias/subcategorias/${categoriaId}/`);
    const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
    setSubcategorias(list);
  }, []);

  useEffect(() => { loadSalidas(); }, [loadSalidas]);
  useEffect(() => { loadCatalogs(); }, [loadCatalogs]);

  const crearSalida = async (payload) => {
    const res = await postData('bodegas/salidas/crear/', payload);
    await loadSalidas();
    if (res?.status === 201) {
      NotificationManager.success('Salida creada y aplicada', 'Éxito', 3000);
    }
    return res;
  };

  return (
    <AppContext.Provider value={{
      salidas,
      page, setPage,
      nextUrl, prevUrl,
      filters, setFilters,
      showForm, setShowForm,
      showDetail, setShowDetail,
      selectedSalida, setSelectedSalida,
      bodegas, centrosCosto, cuentasContables, categorias, subcategorias, skus,
      getSubcategoriasByCategoria,
      areas,
      admisionesPorArea,
      crearSalida,
    }}>
      {children}
    </AppContext.Provider>
  );
};
