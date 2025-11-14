import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { NotificationManager } from 'react-notifications';
import apiClient, { getData } from '../../../../apiService';

const formatDate = (value) => {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString('es-GT');
  } catch (e) {
    return value;
  }
};

const formatNumber = (value) => {
  const num = typeof value === 'number' ? value : Number(value || 0);
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

const getUsername = () => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.username || null;
  } catch (e) {
    return null;
  }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const username = getUsername();
  return {
    ...(token && { Authorization: `Token ${token}` }),
    ...(username && { 'X-User': username }),
  };
};

const CargaMasivaExistenciasContext = createContext(null);

export const ContextProvider = ({ children }) => {
  const [cargas, setCargas] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const [detalle, setDetalle] = useState(null);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [showDetalle, setShowDetalle] = useState(false);

  const [bodegas, setBodegas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadCargas = useCallback(async (targetPage = 1) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: String(targetPage), page_size: '20' });
      const res = await getData(`mantenimiento/carga-masiva/existencias/?${qs.toString()}`);
      const data = res.data || {};
      const results = Array.isArray(data) ? data : data.results || [];
      setCargas(results);
      setCount(data.count || results.length || 0);
      setNextUrl(data.next || null);
      setPrevUrl(data.previous || null);
    } catch (error) {
      console.error('Error cargando cargas masivas:', error);
      NotificationManager.error('No se pudo obtener el historial de cargas', 'Error', 3000);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBodegas = useCallback(async () => {
    try {
      const res = await getData('inventario/bodegas/?page_size=200');
      const data = res.data || {};
      const list = Array.isArray(data) ? data : data.results || [];
      setBodegas(list);
    } catch (error) {
      console.error('Error obteniendo bodegas:', error);
    }
  }, []);

  useEffect(() => {
    loadCargas(page);
  }, [page, loadCargas]);

  useEffect(() => {
    loadBodegas();
  }, [loadBodegas]);

  const openDetalle = useCallback(
    async (id) => {
      setDetalleLoading(true);
      setShowDetalle(true);
      setDetalle(null);
      try {
        const res = await getData(`mantenimiento/carga-masiva/existencias/${id}/`);
        setDetalle(res.data);
      } catch (error) {
        console.error('Error obteniendo detalle de carga:', error);
        NotificationManager.error('No se pudo cargar el detalle', 'Error', 3000);
      } finally {
        setDetalleLoading(false);
      }
    },
    []
  );

  const closeDetalle = useCallback(() => {
    setShowDetalle(false);
    setDetalle(null);
  }, []);

  const openForm = useCallback(() => {
    setShowForm(true);
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
  }, []);

  const goToPrevious = useCallback(() => {
    setPage((current) => Math.max(1, current - 1));
  }, []);

  const goToNext = useCallback(() => {
    setPage((current) => current + 1);
  }, []);

  const procesarCarga = useCallback(
    async ({ bodega, archivo }) => {
      setSubmitting(true);
      try {
        const fd = new FormData();
        fd.append('bodega', bodega);
        fd.append('archivo', archivo);
        await apiClient.post('mantenimiento/carga-masiva/existencias/crear/', fd, {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data',
          },
        });
        NotificationManager.success('Carga de existencias aplicada correctamente', 'Éxito', 3000);
        setShowForm(false);
        await loadCargas(page);
      } catch (error) {
        console.error('Error procesando carga masiva:', error);
        const message = error?.response?.data?.error || 'No se pudo procesar la carga';
        NotificationManager.error(message, 'Error', 4000);
      } finally {
        setSubmitting(false);
      }
    },
    [loadCargas, page]
  );

  const value = useMemo(
    () => ({
      cargas,
      loading,
      page,
      count,
      nextUrl,
      prevUrl,
      hasNext: Boolean(nextUrl),
      hasPrev: Boolean(prevUrl) || page > 1,
      goToNext,
      goToPrevious,
      setPage,
      openDetalle,
      closeDetalle,
      showDetalle,
      detalle,
      detalleLoading,
      bodegas,
      openForm,
      closeForm,
      showForm,
      submitting,
      procesarCarga,
      formatDate,
      formatNumber,
    }),
    [
      cargas,
      loading,
      page,
      count,
      nextUrl,
      prevUrl,
      goToNext,
      goToPrevious,
      openDetalle,
      closeDetalle,
      showDetalle,
      detalle,
      detalleLoading,
      bodegas,
      openForm,
      closeForm,
      showForm,
      submitting,
      procesarCarga,
    ]
  );

  return (
    <CargaMasivaExistenciasContext.Provider value={value}>
      {children}
    </CargaMasivaExistenciasContext.Provider>
  );
};

export const useCargaMasivaExistencias = () => {
  const context = useContext(CargaMasivaExistenciasContext);
  if (!context) {
    throw new Error('useCargaMasivaExistencias debe usarse dentro de un ContextProvider');
  }
  return context;
};
