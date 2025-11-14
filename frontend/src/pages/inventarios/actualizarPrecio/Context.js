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
        precio: parseFloat(p.precio), // Asegurar que sea número
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
      }}
    >
      {children}
    </PreciosContext.Provider>
  );
};

export const usePreciosContext = () => useContext(PreciosContext);
