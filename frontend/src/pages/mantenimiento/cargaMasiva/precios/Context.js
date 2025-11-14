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

const formatDateTime = (value) => {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString('es-GT');
  } catch (e) {
    return value;
  }
};

const formatCurrency = (value) => {
  const num = Number(value || 0);
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
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

const CargaMasivaPreciosContext = createContext(null);

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

  const [seguros, setSeguros] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadCargas = useCallback(async (targetPage = 1) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: String(targetPage), page_size: '20' });
      const res = await getData(`mantenimiento/carga-masiva/precios/?${qs.toString()}`);
      const data = res.data || {};
      const results = Array.isArray(data) ? data : data.results || [];
      setCargas(results);
      setCount(data.count || results.length || 0);
      setNextUrl(data.next || null);
      setPrevUrl(data.previous || null);
    } catch (error) {
      console.error('Error obteniendo cargas de precios:', error);
      NotificationManager.error('No se pudo obtener el historial de cargas', 'Error', 3000);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSeguros = useCallback(async () => {
    try {
      const res = await getData('inventario/seguros/?page_size=200');
      const data = res.data || {};
      const list = Array.isArray(data) ? data : data.results || [];
      setSeguros(list);
    } catch (error) {
      console.error('Error obteniendo seguros:', error);
    }
  }, []);

  useEffect(() => {
    loadCargas(page);
  }, [page, loadCargas]);

  useEffect(() => {
    loadSeguros();
  }, [loadSeguros]);

  const openDetalle = useCallback(async (id) => {
    setDetalleLoading(true);
    setShowDetalle(true);
    setDetalle(null);
    try {
      const res = await getData(`mantenimiento/carga-masiva/precios/${id}/`);
      setDetalle(res.data);
    } catch (error) {
      console.error('Error obteniendo detalle de precios:', error);
      NotificationManager.error('No se pudo cargar el detalle', 'Error', 3000);
    } finally {
      setDetalleLoading(false);
    }
  }, []);

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
    async ({ seguro, archivo }) => {
      setSubmitting(true);
      try {
        const fd = new FormData();
        fd.append('seguro', seguro);
        fd.append('archivo', archivo);
        await apiClient.post('mantenimiento/carga-masiva/precios/crear/', fd, {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data',
          },
        });
        NotificationManager.success('Carga de precios aplicada correctamente', 'Éxito', 3000);
        setShowForm(false);
        await loadCargas(page);
      } catch (error) {
        console.error('Error procesando carga de precios:', error);
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
      seguros,
      openForm,
      closeForm,
      showForm,
      submitting,
      procesarCarga,
      formatDateTime,
      formatCurrency,
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
      seguros,
      openForm,
      closeForm,
      showForm,
      submitting,
      procesarCarga,
    ]
  );

  return (
    <CargaMasivaPreciosContext.Provider value={value}>
      {children}
    </CargaMasivaPreciosContext.Provider>
  );
};

export const useCargaMasivaPrecios = () => {
  const context = useContext(CargaMasivaPreciosContext);
  if (!context) {
    throw new Error('useCargaMasivaPrecios debe usarse dentro de un ContextProvider');
  }
  return context;
};
