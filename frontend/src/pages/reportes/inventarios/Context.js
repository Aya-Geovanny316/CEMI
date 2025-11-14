import React, { createContext, useState, useContext, useEffect } from 'react';
import { getData, API_URL } from '../../../apiService';
import Swal from 'sweetalert2';

const MyContext = createContext();

export const ContextProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState(() => {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const [page, setPage] = useState(1);
  const [nullNextPage, setNullNextPage] = useState(null);
  const [nullPrevPage, setPrevNextPage] = useState(null);
  const [pageSize] = useState(20);

  const nextPage = () => setPage(prev => prev + 1);
  const prevPage = () => setPage(prev => prev - 1);

  const cargarDatos = async () => {
    Swal.fire({
      title: 'Cargando...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      let url = `inventario/skus/?page=${page}`;
      if (fechaInicio) url += `&fecha_inicio=${fechaInicio}`;
      if (fechaFin) url += `&fecha_fin=${fechaFin}`;

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
          text: 'No se encontraron datos para los filtros aplicados.',
        });
      }
    } catch (error) {
      Swal.close();

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar historial',
      });

      console.error('Error al cargar historial:', error);
    }
  };

  const exportarInventarioPDF = async () => {
    try {
      const url = `${API_URL}auditoria/inventario-exportar-pdf/`; // ⚠️ Ajustá la URL real si es distinta

      const authToken = localStorage.getItem('token');
      const headers = {
        ...(authToken && { Authorization: `Token ${authToken}` }),
      };

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      const contentType = response.headers.get("Content-Type");
      if (!response.ok || !contentType.includes("application/pdf")) {
        const errorText = await response.text();
        console.error("❌ No es PDF:", errorText);
        alert("Hubo un error generando el PDF.");
        return;
      }

      const blob = await response.blob();
      const urlBlob = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = `inventario_${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('No se pudo descargar el PDF.');
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [page, fechaInicio, fechaFin]);

  const values = {
    data,
    fechaInicio,
    fechaFin,
    setFechaInicio,
    setFechaFin,
    page,
    setPage,
    nextPage,
    prevPage,
    nullNextPage,
    nullPrevPage,
    cargarDatos,
    exportarInventarioPDF,
  };

  return <MyContext.Provider value={values}>{children}</MyContext.Provider>;
};

export const useMyContext = () => useContext(MyContext);
