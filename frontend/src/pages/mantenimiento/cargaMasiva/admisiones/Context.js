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

const CargaMasivaAdmisionesContext = createContext(null);

export const ContextProvider = ({ children }) => {
  const [cargas, setCargas] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const pageSize = 20;

  const [detalle, setDetalle] = useState(null);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [showDetalle, setShowDetalle] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadCargas = useCallback(async (targetPage = 1) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: String(targetPage), page_size: String(pageSize) });
      const res = await getData(`mantenimiento/carga-masiva/admisiones/?${qs.toString()}`);
      const data = res.data || {};
      const results = Array.isArray(data) ? data : data.results || [];
      setCargas(results);
      setCount(data.count || results.length || 0);
      setNextUrl(data.next || null);
      setPrevUrl(data.previous || null);
    } catch (error) {
      console.error('Error obteniendo cargas de admisiones:', error);
      NotificationManager.error('No se pudo obtener el historial de cargas', 'Error', 3000);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCargas(page);
  }, [page, loadCargas]);

  const openDetalle = useCallback(async (id) => {
    setDetalleLoading(true);
    setShowDetalle(true);
    setDetalle(null);
    try {
      const res = await getData(`mantenimiento/carga-masiva/admisiones/${id}/`);
      setDetalle(res.data);
    } catch (error) {
      console.error('Error obteniendo detalle de admisiones:', error);
      NotificationManager.error('No se pudo cargar el detalle', 'Error', 3000);
    } finally {
      setDetalleLoading(false);
    }
  }, []);

  const closeDetalle = useCallback(() => {
    setShowDetalle(false);
    setDetalle(null);
  }, []);

  const openForm = useCallback(() => setShowForm(true), []);
  const closeForm = useCallback(() => setShowForm(false), []);

  const goToPrevious = useCallback(() => {
    setPage((current) => Math.max(1, current - 1));
  }, []);

  const goToNext = useCallback(() => {
    setPage((current) => current + 1);
  }, []);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((count || 0) / pageSize)),
    [count, pageSize]
  );

  const goToFirst = useCallback(() => setPage(1), []);
  const goToLast = useCallback(() => setPage(totalPages), [totalPages]);

  const procesarCarga = useCallback(
    async ({ archivo }) => {
      setSubmitting(true);
      try {
        const fd = new FormData();
        fd.append('archivo', archivo);
        await apiClient.post('mantenimiento/carga-masiva/admisiones/crear/', fd, {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data',
          },
          timeout: 120000, // 120s por si el servidor tarda en responder
        });
        NotificationManager.success('Carga de admisiones aplicada correctamente', 'Éxito', 3000);
        setShowForm(false);
        await loadCargas(page);
      } catch (error) {
        console.error('Error procesando carga de admisiones:', error);
        const isTimeout = error?.code === 'ECONNABORTED';
        const message = error?.response?.data?.error;
        if (isTimeout) {
          NotificationManager.info(
            'La carga puede seguir procesándose en el servidor. Verifique el historial en 1-2 minutos.',
            'Procesando en segundo plano',
            5000
          );
          setShowForm(false);
          setTimeout(() => loadCargas(page), 3000);
        } else {
          NotificationManager.error(message || 'No se pudo procesar la carga', 'Error', 4000);
        }
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
      totalPages,
      goToNext,
      goToPrevious,
      goToFirst,
      goToLast,
      setPage,
      openDetalle,
      closeDetalle,
      showDetalle,
      detalle,
      detalleLoading,
      openForm,
      closeForm,
      showForm,
      submitting,
      procesarCarga,
      formatDateTime,
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
      goToFirst,
      goToLast,
      openDetalle,
      closeDetalle,
      showDetalle,
      detalle,
      detalleLoading,
      openForm,
      closeForm,
      showForm,
      submitting,
      procesarCarga,
    ]
  );

  return (
    <CargaMasivaAdmisionesContext.Provider value={value}>
      {children}
    </CargaMasivaAdmisionesContext.Provider>
  );
};

export const useCargaMasivaAdmisiones = () => {
  const context = useContext(CargaMasivaAdmisionesContext);
  if (!context) {
    throw new Error('useCargaMasivaAdmisiones debe usarse dentro de un ContextProvider');
  }
  return context;
};
