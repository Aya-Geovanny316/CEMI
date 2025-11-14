import React, { createContext, useContext, useState, useEffect } from 'react';
import { getData, postData, putData, deleteData } from '../../../apiService';
import Swal from 'sweetalert2';

const PreciosContext = createContext();

export const PreciosProvider = ({ children }) => {
  const [skus, setSkus] = useState([]);
  const [seguros, setSeguros] = useState([]);
  const [precios, setPrecios] = useState([]);
  const [showModalPrecios, setShowModalPrecios] = useState(false);
  const [skuActivo, setSkuActivo] = useState(null);
  const [sku, setSku] = useState('');
  const [descripcionSku, setDescripcionSku] = useState('');

  // 🔎 Nuevo: estados para filtrar
  const [skusFiltrados, setSkusFiltrados] = useState(null);
  const [buscandoSkus, setBuscandoSkus] = useState(false);

  const cargarSkus = async () => {
    Swal.fire({
      title: 'Cargando SKUs...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const res = await getData('inventario/skus/?page_size=1000');
      const resultados = res.data.results || [];
      setSkus(resultados);
      Swal.close();

      if (resultados.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Sin resultados',
          text: 'No se encontraron SKUs.',
        });
      }
    } catch (error) {
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar SKUs',
      });
      console.error('Error al cargar SKUs:', error);
    }
  };

  const cargarSeguros = async () => {
    try {
      const res = await getData('inventario/seguros/?page_size=100');
      setSeguros(res.data.results || []);
    } catch (error) {
      console.error('Error al cargar seguros:', error);
    }
  };

  const cargarPrecios = async () => {
    try {
      const res = await getData('inventario/precios/?page_size=10000');
      const preciosTransformados = res.data.map(p => ({
        ...p,
        seguro_id: seguros.find(s => s.nombre === p.seguro_nombre)?.id || null,
        precio: parseFloat(p.precio),
      }));
      setPrecios(preciosTransformados || []);
    } catch (error) {
      console.error('Error al cargar precios:', error);
    }
  };

  const abrirModalEditarPrecios = (sku) => {
    console.log('Abriendo modal para SKU:', sku);
    setSku(sku.codigo_sku);
    setDescripcionSku(sku.descripcion_estado_cuenta);
    const preciosSKU = precios.filter((p) => p.sku === sku.id);
    setSkuActivo({ ...sku, precios: preciosSKU });
    setShowModalPrecios(true);
  };

  const actualizarPrecio = async (data) => {
    try {
      await putData(`inventario/precios-actualizar/${data.id}/`, data);
      await cargarPrecios();
    } catch (error) {
      console.error('Error al actualizar precio:', error);
    }
  };

  const crearPrecio = async (data) => {
    try {
      await postData('inventario/precios-crear/', data);
      await cargarPrecios();
    } catch (error) {
      console.error('Error al crear precio:', error);
    }
  };

  const eliminarPrecio = async (id) => {
    try {
      await deleteData(`inventario/precios/${id}/`);
      await cargarPrecios();
    } catch (error) {
      console.error('Error al eliminar precio:', error);
    }
  };

  // 🔎 Nuevo: búsqueda por código de SKU o código de barras
  const buscarSkusPorCodigoOBarras = async (termino) => {
    const q = (termino || '').trim();
    if (!q) {
      setSkusFiltrados(null);
      return;
    }

    setBuscandoSkus(true);
    try {
      // Intentamos usar el endpoint de búsqueda de precios para obtener los SKU relacionados
      const params = new URLSearchParams({ limit: '1000' });
      // Enviamos varios parámetros para maximizar compatibilidad con el backend:
      params.set('q', q);                 // búsqueda libre
      params.set('sku_codigo', q);        // si el backend lo soporta
      params.set('codigo_barras', q);     // si el backend lo soporta
      params.set('nombre', q);            // incluir búsqueda por nombre si existe

      const res = await getData(`inventario/precios/buscar/?${params.toString()}`);
      const payload = Array.isArray(res.data) ? res.data : (res.data.results || []);

      // Obtenemos los IDs de SKU que devolvió la búsqueda de precios
      const idsSku = new Set(payload.map(p => p.sku).filter(Boolean));

      // Filtramos la lista local de SKUs:
      const ql = q.toLowerCase();
      const filtrados = (skus || []).filter(s =>
        idsSku.has(s.id) ||
        (s.nombre && s.nombre.toString().toLowerCase().includes(ql)) ||
        (s.codigo_sku && s.codigo_sku.toString().toLowerCase().includes(ql)) ||
        (s.codigo_barras && s.codigo_barras.toString().toLowerCase().includes(ql))
      );

      setSkusFiltrados(filtrados);

      if (filtrados.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Sin resultados',
          text: 'No se encontraron SKUs que coincidan con el término.',
        });
      }
    } catch (error) {
      console.error('Error al buscar SKUs:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error en la búsqueda',
        text: 'Ocurrió un problema al consultar el backend.',
      });
    } finally {
      setBuscandoSkus(false);
    }
  };

  const limpiarFiltroSkus = () => {
    setSkusFiltrados(null);
  };

  useEffect(() => {
    cargarSkus();
    cargarSeguros();
  }, []);

  useEffect(() => {
    if (seguros.length > 0) {
      cargarPrecios();
    }
  }, [seguros]);

  return (
    <PreciosContext.Provider
      value={{
        skus,
        seguros,
        precios,
        skuActivo,
        showModalPrecios,
        setShowModalPrecios,
        abrirModalEditarPrecios,
        actualizarPrecio,
        crearPrecio,
        eliminarPrecio,
        cargarSeguros,
        sku,
        descripcionSku,

        // 🔎 Nuevo en el contexto
        skusFiltrados,
        buscandoSkus,
        buscarSkusPorCodigoOBarras,
        limpiarFiltroSkus,
      }}
    >
      {children}
    </PreciosContext.Provider>
  );
};

export const usePreciosContext = () => useContext(PreciosContext);
