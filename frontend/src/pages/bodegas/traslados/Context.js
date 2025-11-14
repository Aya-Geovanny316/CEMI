import React, { createContext, useCallback, useEffect, useState } from 'react';
import { getData, postData } from '../../../apiService';
import { NotificationManager } from 'react-notifications';

export const AppContext = createContext();

export const ContextProvider = ({ children }) => {
  const [traslados, setTraslados] = useState([]);
  const [page, setPage] = useState(1);
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);
  const [filters, setFilters] = useState({ fecha_envio: '', fecha_recibido: '', bodega_origen: '', estatus: '' });

  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedTraslado, setSelectedTraslado] = useState(null);

  // Catálogos
  const [bodegas, setBodegas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [skus, setSkus] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const loadTraslados = useCallback(async () => {
    try {
      const qs = new URLSearchParams({
        page: String(page), page_size: '20',
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });
      const res = await getData(`bodegas/traslados/?${qs.toString()}`);
      setTraslados(res.data.results || []);
      setNextUrl(res.data.next);
      setPrevUrl(res.data.previous);
    } catch (err) {
      console.error('Error cargando traslados:', err?.response?.data || err?.message || err);
      NotificationManager.error('No se pudieron cargar los traslados', 'Error', 4000);
      setTraslados([]);
      setNextUrl(null);
      setPrevUrl(null);
    }
  }, [page, filters]);

  const loadCatalogs = useCallback(async () => {
    try {
      // Helper: fetch all pages for a paginated endpoint
      const fetchAllPaginated = async (url) => {
        try {
          let all = [];
          let next = url;
          while (next) {
            const res = await getData(next);
            const data = res?.data || {};
            const results = Array.isArray(data) ? data : (data.results || []);
            all = all.concat(results);
            next = data.next || null;
          }
          return all;
        } catch (_) {
          return [];
        }
      };

      const [b, c, sku, deps, usersAll] = await Promise.all([
        getData('inventario/bodegas/?page_size=200'),
        getData('inventario/categorias/?page_size=200'),
        getData('inventario/skus/?page_size=200'),
        getData('mantenimiento/departamentos/?page_size=200'),
        fetchAllPaginated('user/filter-users/'),
      ]);
      setBodegas(b.data.results || []);
      setCategorias(c.data.results || []);
      setSkus(sku.data.results || []);
      setDepartamentos(deps?.data?.results ?? deps?.data ?? []);
      setUsuarios(usersAll || []);
    } catch (err) {
      console.error('Error cargando catálogos:', err?.response?.data || err?.message || err);
      NotificationManager.error('No se pudieron cargar catálogos', 'Error', 4000);
      setBodegas([]); setCategorias([]); setSkus([]); setDepartamentos([]); setUsuarios([]);
    }
  }, []);

  const getSubcategoriasByCategoria = useCallback(async (categoriaId) => {
    if (!categoriaId) { setSubcategorias([]); return; }
    const res = await getData(`inventario/categorias/subcategorias/${categoriaId}/`);
    const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
    setSubcategorias(list);
  }, []);

  useEffect(() => { loadTraslados(); }, [loadTraslados]);
  useEffect(() => { loadCatalogs(); }, [loadCatalogs]);

  const crearTraslado = async (payload) => {
    try {
      const res = await postData('bodegas/traslados/crear/', payload);
      await loadTraslados();
      if (res?.status === 201) {
        NotificationManager.success('Traslado enviado, pendiente de recibir/aplicar', 'Éxito', 3000);
      }
      return res;
    } catch (err) {
      const msg = err?.response?.data?.error || 'No se pudo crear el traslado';
      NotificationManager.error(typeof msg === 'string' ? msg : JSON.stringify(msg), 'Error', 5000);
      throw err;
    }
  };

  const recibirTraslado = async (id) => {
    try {
      const res = await postData(`bodegas/traslados/${id}/recibir/`, {});
      await loadTraslados();
      if (res?.status === 200) {
        NotificationManager.success('Traslado recibido', 'Éxito', 3000);
      }
      return res;
    } catch (err) {
      const msg = err?.response?.data?.error || 'No se pudo marcar como recibido';
      NotificationManager.error(typeof msg === 'string' ? msg : JSON.stringify(msg), 'Error', 5000);
      throw err;
    }
  };

  const anularTraslado = async (id) => {
    try {
      const res = await postData(`bodegas/traslados/${id}/anular/`, {});
      await loadTraslados();
      if (res?.status === 200) {
        NotificationManager.success('Traslado anulado', 'Éxito', 3000);
      }
      return res;
    } catch (err) {
      const msg = err?.response?.data?.error || 'No se pudo anular el traslado';
      NotificationManager.error(typeof msg === 'string' ? msg : JSON.stringify(msg), 'Error', 5000);
      throw err;
    }
  };

  return (
    <AppContext.Provider value={{
      traslados,
      page, setPage,
      nextUrl, prevUrl,
      filters, setFilters,
      showForm, setShowForm,
      showDetail, setShowDetail,
      selectedTraslado, setSelectedTraslado,
      bodegas, categorias, subcategorias, skus,
      departamentos, usuarios,
      getSubcategoriasByCategoria,
      crearTraslado,
      recibirTraslado,
      anularTraslado,
    }}>
      {children}
    </AppContext.Provider>
  );
};
