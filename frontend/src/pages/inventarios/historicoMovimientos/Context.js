import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import Swal from 'sweetalert2';
import { getData } from '../../../apiService';

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

  const [bodegas, setBodegas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [skus, setSkus] = useState([]);

  const [bodegaSel, setBodegaSel] = useState('');
  const [categoriaSel, setCategoriaSel] = useState('');
  const [subcategoriaSel, setSubcategoriaSel] = useState('');
  // skuFiltro: null = sin selección (no cargar);
  //            '' = Todos; 'ABC123' = SKU específico
  const [skuFiltro, setSkuFiltro] = useState(null);

  const [page, setPage] = useState(1);
  const [nullNextPage, setNullNextPage] = useState(null);
  const [nullPrevPage, setPrevNextPage] = useState(null);
  const [pageSize] = useState(50);
  const [role, setRole] = useState(null);

  const nextPage = () => setPage((p) => p + 1);
  const prevPage = () => setPage((p) => Math.max(1, p - 1));

  const cargarCatalogos = useCallback(async () => {
    try {
      const [b, c, sku] = await Promise.all([
        getData('inventario/bodegas/?page_size=200'),
        getData('inventario/categorias/?page_size=200'),
        getData('inventario/skus/?page_size=200'),
      ]);
      setBodegas(b?.data?.results ?? b?.data ?? []);
      setCategorias(c?.data?.results ?? c?.data ?? []);
      const list = sku?.data?.results ?? sku?.data ?? [];
      setSkus(list);
    } catch (e) {
      setBodegas([]); setCategorias([]); setSkus([]);
    }
  }, []);

  const cargarSubcategorias = useCallback(async (categoriaId) => {
    if (!categoriaId) { setSubcategorias([]); return; }
    try {
      const res = await getData(`inventario/categorias/subcategorias/${categoriaId}?page_size=200`);
      const list = res?.data?.results ?? res?.data ?? [];
      setSubcategorias(Array.isArray(list) ? list : []);
    } catch { setSubcategorias([]); }
  }, []);

  const cargarDatos = useCallback(async () => {
    // No cargar hasta que el usuario seleccione explícitamente un SKU (o "Todos")
    if (skuFiltro === null) return;
    const loading = Swal.fire({ title: 'Cargando movimientos...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      let url = `inventario/movimientos-detalle/?page=${page}&page_size=${pageSize}`;
      if (bodegaSel) url += `&bodega=${encodeURIComponent(bodegaSel)}`;
      if (categoriaSel) {
        const cat = categorias.find(c => String(c.id) === String(categoriaSel));
        if (cat?.nombre) url += `&categoria=${encodeURIComponent(cat.nombre)}`;
      }
      if (subcategoriaSel) {
        const sc = subcategorias.find(s => String(s.id) === String(subcategoriaSel));
        if (sc?.nombre) url += `&subcategoria=${encodeURIComponent(sc.nombre)}`;
      }
      // Si skuFiltro está vacío (''), el backend interpretará "Todos"
      url += `&sku=${encodeURIComponent(skuFiltro || '')}`;
      // Para SKU específico, aplicar filtros de fecha
      if (skuFiltro) {
        if (fechaInicio) url += `&inicio=${fechaInicio}`;
        if (fechaFin) url += `&fin=${fechaFin}`;
      }
      const res = await getData(url);
      setData(res?.data?.results ?? []);
      setNullNextPage(res?.data?.next ?? null);
      setPrevNextPage(res?.data?.previous ?? null);
    } catch { setData([]); }
    finally { Swal.close(); }
  }, [page, pageSize, bodegaSel, categoriaSel, subcategoriaSel, skuFiltro, fechaInicio, fechaFin, categorias, subcategorias]);

  useEffect(() => { cargarCatalogos(); }, [cargarCatalogos]);
  useEffect(() => { cargarSubcategorias(categoriaSel); setSubcategoriaSel(''); setSkuFiltro(null); }, [categoriaSel, cargarSubcategorias]);
  useEffect(() => { cargarDatos(); }, [cargarDatos]);
  useEffect(() => {
    const getRole = () => {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      const r = u?.roles?.[0];
      return typeof r === "string" ? r : r?.id || null;
    };
    setRole(getRole());
  }, []);

  const values = {
    data,
    // filtros
    bodegas, categorias, subcategorias, skus,
    bodegaSel, setBodegaSel,
    categoriaSel, setCategoriaSel,
    subcategoriaSel, setSubcategoriaSel,
    skuFiltro, setSkuFiltro,
    fechaInicio, setFechaInicio,
    fechaFin, setFechaFin,
    cargarSubcategorias,
    // paginación
    page, setPage, nextPage, prevPage,
    nullPrevPage, nullNextPage,
    role,
  };

  return <MyContext.Provider value={values}>{children}</MyContext.Provider>;
};

export const useMyContext = () => useContext(MyContext);
