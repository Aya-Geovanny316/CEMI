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
    // Mostrar alerta de carga
    Swal.fire({
      title: 'Cargando...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      let url = `auditoria/historial-api/?page=${page}&page_size=${pageSize}`;
      if (fechaInicio) url += `&fecha_inicio=${fechaInicio}`;
      if (fechaFin) url += `&fecha_fin=${fechaFin}`;

      console.time("⏱️ API - Fetch historial"); // Inicia medición de tiempo
      const response = await getData(url);
      console.timeEnd("⏱️ API - Fetch historial"); // Termina medición del fetch

      const resultados = response.data.results;
      console.log('Resultados obtenidos:', resultados);

      console.time("⏱️ UI - Render historial"); // Inicia medición del render
      setData(resultados);
      setNullNextPage(response.data.next);
      setPrevNextPage(response.data.previous);
      setTimeout(() => {
        console.timeEnd("⏱️ UI - Render historial"); // Termina después del render
      }, 0);

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

  const exportarHistorialPDF = async () => {
    try {
      let url = `${API_URL}auditoria/historial-exportar-pdf/?`;
      if (fechaInicio) url += `fecha_inicio=${fechaInicio}&`;
      if (fechaFin) url += `fecha_fin=${fechaFin}`;

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
      const nombreArchivo = `historial_api_${fechaInicio || 'inicio'}_a_${fechaFin || 'hoy'}.pdf`;
      a.download = nombreArchivo.replace(/:/g, '-');
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
    exportarHistorialPDF,
  };

  return <MyContext.Provider value={values}>{children}</MyContext.Provider>;
};

export const useMyContext = () => useContext(MyContext);
