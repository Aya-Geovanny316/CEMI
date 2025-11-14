// Context.js
import React, { createContext, useEffect, useState, useCallback } from 'react';
import { getData, postData } from '../../../../apiService'; 

export const AppContext = createContext();

export const ContextProvider = ({ children }) => {
  const [soloAprobadas, setSoloAprobadas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);

  const cargarRequisiciones = useCallback(async () => {
    try {
      setLoading(true);
      const aprobadas = await getData('compras/requisiciones/?estatus=AUTORIZADA');
      const rows = aprobadas.data?.results || [];
      setSoloAprobadas(rows);
    } catch (error) {
      console.error('❌ Error al cargar requisiciones:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const crearOCDesdeRequisicion = async (requisicionId) => {
    const res = await postData(`compras/ordenes-compra/crear-desde-requisicion/${requisicionId}/`, {});
    return res.data; // {id, ...}
  };

  const openPreview = (row) => { setSelectedReq(row); setShowPreview(true); };
  const closePreview = () => { setShowPreview(false); setSelectedReq(null); };

  useEffect(() => {
    cargarRequisiciones();
  }, []);

  return (
    <AppContext.Provider
      value={{ soloAprobadas, loading, cargarRequisiciones, crearOCDesdeRequisicion, showPreview, setShowPreview, selectedReq, setSelectedReq, openPreview, closePreview }}
    >
      {children}
    </AppContext.Provider>
  );
};
